import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, DatePicker, Table, Space, Select } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { port } from "./porturl";
const { Option } = Select;

const Purchases = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [billNo, setBillNo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // <-- NEW STATE

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${port}categories`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        message.error("Failed to fetch categories.");
      }
    };

    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(`${port}suppliers`);
        setSuppliers(response.data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        message.error("Failed to fetch suppliers.");
      }
    };

    fetchCategories();
    fetchSuppliers();
  }, []);

  const handleAddItem = (values) => {
    const isDuplicate = cart.some((item) => item.item_name === values.item_name);
    if (isDuplicate) {
      message.error("This item is already in the cart.");
      return;
    }

    setCart((prev) => [...prev, values]);
    message.success("Item added!");
  };

  const handleAddPurchase = async (values) => {
    if (cart.length === 0) {
      message.error("Add at least one item.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        supplier_id: values.supplier_id,
        purchase_date: values.purchase_date.format("YYYY-MM-DD"),
        items: cart.map(item => ({
          ...item,
          expiry_date: item.expiry_date ? item.expiry_date.format("YYYY-MM-DD") : null,
          SED: item.SED ? item.SED.format("YYYY-MM-DD") : null,
        })),
      };

      const response = await axios.post(`${port}purchases`, payload);

      if (response.data.success) {
        message.success(`Purchase saved! Bill No: ${response.data.bill_no}`);
        setBillNo(response.data.bill_no);
        setCart([]);
      } else {
        message.error("Failed to save.");
      }
    } catch (error) {
      console.error(error);
      message.error("Error saving.");
    }
    setLoading(false);
  };

  const handleRemoveFromCart = (record) => {
    setCart((prev) => prev.filter((item) => item.item_name !== record.item_name));
    message.success("Item removed.");
  };

  const cartColumns = [
    { title: "Item Name", dataIndex: "item_name", key: "item_name" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Unit Price", dataIndex: "unit_price", key: "unit_price" },
    { title: "Brand", dataIndex: "brand", key: "brand" },
    { title: "Wire Size", dataIndex: "wire_size", key: "wire_size" }, // <-- SHOW IT
    {
      title: "Action",
      render: (_, record) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => handleRemoveFromCart(record)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Purchase</h2>

      <h3>Manage Cart</h3>
      <Form layout="vertical" onFinish={handleAddItem} style={{ maxWidth: 600, marginBottom: 20 }}>

        <Form.Item label="Item Name" name="item_name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item label="Unit Price" name="unit_price" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item label="Brand" name="brand" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        {/* ------------------- CATEGORY UPDATED ------------------- */}
        <Form.Item
          label="Category Name"
          name="category_name"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select category"
            onChange={(value) => setSelectedCategory(value)} // track category
          >
            <Option value="Wire Coils">Wire Coils</Option>
            <Option value="Cables">Cables</Option>
            <Option value="Switches">Switches</Option>
            <Option value="Sockets">Sockets</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>

        {/* ---------------- CONDITIONAL FIELD ---------------- */}
        {selectedCategory === "Wire Coils" && (
          <Form.Item
            label="Wire Size"
            name="wire_size"
            rules={[{ required: true, message: "Select wire size" }]}
          >
            <Select placeholder="Select wire size">
              <Option value="2.5mm">2.5mm</Option>
              <Option value="5mm">5mm</Option>
              <Option value="7.5mm">7.5mm</Option>
              <Option value="9mm">9mm</Option>
              <Option value="15mm">15mm</Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item>
          <Button icon={<PlusOutlined />} type="dashed" htmlType="submit">
            Add To Cart
          </Button>
        </Form.Item>
      </Form>

      <Table dataSource={cart} columns={cartColumns} rowKey="item_name" pagination={false} />

      <h3>Submit Purchase</h3>
      <Form layout="vertical" onFinish={handleAddPurchase} style={{ maxWidth: 600 }}>
        
        {billNo && (
          <Form.Item label="Bill No">
            <Input readOnly value={billNo} />
          </Form.Item>
        )}

        <Form.Item label="Supplier" name="supplier_id" rules={[{ required: true }]}>
          <Select placeholder="Select supplier">
            {suppliers.map(s => (
              <Option key={s.supplier_id} value={s.supplier_id}>
                {s.supplier_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Purchase Date" name="purchase_date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit Purchase
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Purchases;

