import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, DatePicker, Table, Select } from "antd";
import axios from "axios";
import { PlusOutlined } from "@ant-design/icons";
import { port } from "./porturl";

const { Option } = Select;

const Purchases = () => {
  const [form] = Form.useForm();
  const [purchaseForm] = Form.useForm();

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [billNumber, setInvoiceNumber] = useState("");

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // ----------------------- LOAD DATA -----------------------
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

  // ----------------------- FETCH ATTRIBUTES -----------------------
  const handleCategoryChange = async (label, option) => {
    setSelectedCategoryId(option.key);

    try {
      const res = await axios.get(`${port}categories/${option.key}/attributes`);
      setAttributes(res.data);

      // Reset dynamic attribute selections
      const newValues = form.getFieldsValue();
      Object.keys(newValues)
        .filter((k) => k.startsWith("attr_"))
        .forEach((k) => (newValues[k] = undefined));

      form.setFieldsValue(newValues);
    } catch {
      message.error("Failed to load attributes");
    }
  };

  // ----------------------- ADD TO CART -----------------------
  const handleAddToCart = (values) => {
    if (!billNumber) return message.error("Enter invoice number first!");

    const formattedAttributes = {};
    Object.keys(values).forEach((key) => {
      if (key.startsWith("attr_")) {
        formattedAttributes[key.replace("attr_", "")] = values[key];
      }
    });

    const newItem = {
      category_id: selectedCategoryId,
      attributes: formattedAttributes,
      quantity: values.quantity,
      unit_price: values.unit_price
    };

    setCart([...cart, newItem]);
    message.success("Item added!");

    form.resetFields(["quantity", "unit_price", ...Object.keys(values).filter(k => k.startsWith("attr_"))]);
  };

  const removeItem = (record) => setCart(cart.filter((i) => i !== record));

  // ----------------------- SUBMIT PURCHASE -----------------------
const handleSubmitPurchase = async (values) => {
  if (!billNumber) return message.error("Invoice number missing!");
  if (cart.length === 0) return message.error("Cart is empty!");

  setLoading(true);

  try {
    const payload = {
      supplier_id: values.supplier_id,
      purchase_date: values.purchase_date.format("YYYY-MM-DD"),
      bill_number: billNumber,
      items: cart
    };

    await axios.post(`${port}purchase`, payload);

    message.success("Purchase submitted!");
    setCart([]);
    purchaseForm.resetFields();
    setInvoiceNumber("");
  } catch (err) {
    message.error("Purchase failed");
  }

  setLoading(false);
};


  // ----------------------- CART TABLE -----------------------
  const cartColumns = [
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
      title: "Remove",
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

      {/* Purchase Header (Supplier + Invoice + Date) */}
      <Form form={purchaseForm} layout="vertical" style={{ marginBottom: 30 }}>
        <Form.Item label="Invoice Number" name="invoice" rules={[{ required: true }]}>
          <Input
            placeholder="Enter Invoice No"
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </Form.Item>

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
      </Form>

      {/* ITEM ENTRY */}
      <Form form={form} layout="vertical" onFinish={handleAddToCart} style={{ width: 400 }}>
        <Form.Item label="Category" name="category" rules={[{ required: true }]}>
          <Select placeholder="Select Category" onChange={handleCategoryChange}>
            {categories.map((c) => (
              <Option key={c.category_id} value={c.category_name}>
                {c.category_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {Object.keys(attributes).map((attr) => (
          <Form.Item key={attr} label={attr} name={`attr_${attr}`} rules={[{ required: true }]}>
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
      <Table dataSource={cart} columns={cartColumns} rowKey={(r, i) => i} style={{ marginTop: 30 }} />

      <Button type="primary" style={{ marginTop: 30 }} onClick={() => purchaseForm.submit()} loading={loading}>
        Submit Purchase
      </Button>

      <Form form={purchaseForm} onFinish={handleSubmitPurchase} hidden />
    </div>
  );
};

export default Purchases;
