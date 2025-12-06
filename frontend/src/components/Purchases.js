import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, DatePicker, Table, Select } from "antd";
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
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Hardcoded for now - later dynamic from DB
  const wireMakes = ["Finolex", "Polycab", "Vasavi"];
  const wireRatings = ["1 sqmm", "1.5 sqmm", "2 sqmm", "2.5 sqmm", "4 sqmm", "6 sqmm", "10 sqmm", "16 sqmm", "18 sqmm"];
  const wireColors = ["Red", "Yellow", "Blue", "Black", "Cream"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get(`${port}categories`);
        setCategories(catRes.data);

        const supRes = await axios.get(`${port}suppliers`);
        setSuppliers(supRes.data);
      } catch (error) {
        message.error("Failed to load initial data.");
      }
    };

    fetchData();
  }, []);

  const handleAddItem = (values) => {
    const exists = cart.some((i) => 
      i.item_name === values.item_name &&
      values.category_name === "Wire Coils" &&
      i.make === values.make &&
      i.rating === values.rating &&
      i.color === values.color
    );

    if (exists) return message.error("Duplicate item exists in cart.");

    setCart([...cart, values]);
    message.success("Item added.");
  };

  const handleRemoveItem = (item) => {
    setCart(cart.filter((i) => i !== item));
  };

  const cartColumns = [
    { title: "Item Name", dataIndex: "item_name" },
    { title: "Category", dataIndex: "category_name" },
    { title: "Make", dataIndex: "make" },
    { title: "Rating", dataIndex: "rating" },
    { title: "Color", dataIndex: "color" },
    { title: "Qty", dataIndex: "quantity" },
    { title: "Unit Price", dataIndex: "unit_price" },
    {
      title: "Action",
      render: (record) => (
        <Button danger onClick={() => handleRemoveItem(record)}>
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Purchase</h2>

      {/* ADD ITEM FORM */}
      <Form layout="vertical" onFinish={handleAddItem} style={{ width: 400 }}>
        
        <Form.Item label="Item Name" name="item_name" rules={[{ required: true }]}>
          <Input placeholder="Example: PVC Wire Roll" />
        </Form.Item>

     <Form.Item label="Category" name="category_name" rules={[{ required: true }]}>
  <Select placeholder="Select Category">
    {categories.map((c, index) => (
      <Option key={index} value={c}>
        {c}
      </Option>
    ))}
  </Select>
</Form.Item>


        {/* ----------- CONDITIONAL WIRES UI ----------- */}
        {selectedCategory === "Wire Coil" && (
          <>
            <Form.Item label="Make (Brand)" name="make" rules={[{ required: true }]}>
              <Select placeholder="Select Make">
                {wireMakes.map((m) => (
                  <Option key={m} value={m}>{m}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Rating" name="rating" rules={[{ required: true }]}>
              <Select placeholder="Select Wire Rating">
                {wireRatings.map((r) => (
                  <Option key={r} value={r}>{r}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Color" name="color" rules={[{ required: true }]}>
              <Select placeholder="Select Color">
                {wireColors.map((c) => (
                  <Option key={c} value={c}>{c}</Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}

        <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item label="Unit Price" name="unit_price" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>

        <Button icon={<PlusOutlined />} type="primary" htmlType="submit">
          Add to Cart
        </Button>
      </Form>

      {/* CART TABLE */}
      <Table dataSource={cart} columns={cartColumns} rowKey={(r) => r.item_name + r.color + r.rating} style={{ marginTop: 30 }} />

      {/* SUBMIT PURCHASE SECTION */}
      <h3 style={{ marginTop: 30 }}>Submit Purchase</h3>

      <Form layout="vertical" style={{ width: 400 }}>
        <Form.Item label="Supplier" name="supplier_id" rules={[{ required: true }]}>
          <Select placeholder="Select Supplier">
            {suppliers.map((s) => (
              <Option key={s.gstin} value={s.gstin}>
                {s.supplier_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Purchase Date" name="purchase_date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Button type="primary" loading={loading}>
          Submit Purchase
        </Button>
      </Form>
    </div>
  );
};

export default Purchases;
