import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, DatePicker, Table, Select } from "antd";
import axios from "axios";
import { PlusOutlined } from "@ant-design/icons";
import { port } from "./porturl";

const { Option } = Select;

const Purchases = () => {
  const [form] = Form.useForm();

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // -----------------------
  // Fetch categories + suppliers
  // -----------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const resCategories = await axios.get(`${port}categories`);
        setCategories(resCategories.data);

        const resSuppliers = await axios.get(`${port}suppliers`);
        setSuppliers(resSuppliers.data);
      } catch (err) {
        message.error("Failed to load initial data.");
      }
    };
    loadData();
  }, []);

  // -------------------------------------
  // Fetch attributes dynamically per category
  // -------------------------------------
  const handleCategoryChange = async (value, option) => {
    setSelectedCategoryId(option.key);

    try {
      const res = await axios.get(`${port}categories/${option.key}/attributes`);
      setAttributes(res.data);
      form.setFieldsValue({ attributes: {} }); // reset old values
    } catch {
      message.error("Failed to load attributes");
    }
  };

  // -----------------------
  // Handle add item to cart
  // -----------------------
  const handleAddToCart = (values) => {
    const formattedAttributes = {};
    Object.keys(values).forEach((key) => {
      if (key.startsWith("attr_")) {
        formattedAttributes[key.replace("attr_", "")] = values[key];
      }
    });

    const newItem = {
      item_name: values.item_name,
      category_id: selectedCategoryId,
      attributes: formattedAttributes,
      quantity: values.quantity,
      unit_price: values.unit_price
    };

    // prevent duplicates
    const duplicate = cart.some((i) => JSON.stringify(i) === JSON.stringify(newItem));
    if (duplicate) return message.error("Duplicate entry found.");

    setCart([...cart, newItem]);
    message.success("Item added to cart!");
    form.resetFields(["item_name", "quantity", "unit_price", ...Object.keys(values)]);
  };

  // -----------------------
  // Remove from cart
  // -----------------------
  const removeItem = (record) => {
    setCart(cart.filter((i) => i !== record));
  };

  // -----------------------
  // Submit Purchase
  // -----------------------
  const handleSubmitPurchase = async (values) => {
    if (cart.length === 0) return message.error("Cart is empty!");

    setLoading(true);

    try {
      const payload = {
        supplier_id: values.supplier_id,
        purchase_date: values.purchase_date,
        items: cart
      };

      await axios.post(`${port}purchase`, payload);

      message.success("Purchase submitted!");
      setCart([]);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Failed to submit purchase");
    }
    setLoading(false);
  };

  // -----------------------
  // TABLE COLUMNS
  // -----------------------
  const cartColumns = [
    { title: "Item Name", dataIndex: "item_name" },
    { title: "Category ID", dataIndex: "category_id" },
    {
      title: "Attributes",
      render: (record) => (
        <ul>
          {Object.entries(record.attributes).map(([k, v]) => (
            <li key={k}>
              <b>{k}</b>: {v}
            </li>
          ))}
        </ul>
      ),
    },
    { title: "Qty", dataIndex: "quantity" },
    { title: "Unit Price", dataIndex: "unit_price" },
    {
      title: "Total",
      render: (r) => (r.unit_price * r.quantity).toFixed(2),
    },
    {
      title: "Action",
      render: (record) => (
        <Button danger onClick={() => removeItem(record)}>
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>

      <h2>📦 New Purchase</h2>

      {/* ITEM ENTRY FORM */}
      <Form form={form} layout="vertical" onFinish={handleAddToCart} style={{ width: 400 }}>

        <Form.Item label="Item Name" name="item_name" rules={[{ required: true }]}>
          <Input placeholder="Ex: Wire Coil" />
        </Form.Item>

        <Form.Item label="Category" name="category" rules={[{ required: true }]}>
          <Select placeholder="Select Category" onChange={handleCategoryChange}>
            {categories.map((c) => (
              <Option key={c.category_id} value={c.category_name}>
                {c.category_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Dynamic attributes dropdowns */}
        {Object.keys(attributes).map((attr) => (
          <Form.Item
            key={attr}
            label={attr}
            name={`attr_${attr}`}
            rules={[{ required: true }]}
          >
            <Select placeholder={`Select ${attr}`}>
              {attributes[attr].values.map((v) => (
                <Option key={v.value_id} value={v.value}>
                  {v.value}
                </Option>
              ))}
            </Select>
          </Form.Item>
        ))}

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
      <Table
        dataSource={cart}
        columns={cartColumns}
        rowKey={(r, i) => i}
        style={{ marginTop: 30 }}
      />

      {/* SUBMIT PURCHASE FORM */}
      <Form layout="vertical" onFinish={handleSubmitPurchase} style={{ width: 400, marginTop: 30 }}>

        <Form.Item label="Supplier" name="supplier_id" rules={[{ required: true }]}>
          <Select placeholder="Select Supplier">
            {suppliers.map((s) => (
              <Option key={s.gstin} value={s.supplier_name}>
                {s.supplier_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Purchase Date" name="purchase_date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          Submit Purchase
        </Button>
      </Form>
    </div>
  );
};

export default Purchases;
