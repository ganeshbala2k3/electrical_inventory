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
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New State for GST Percentage
  const [gstPercentage, setGstPercentage] = useState(0); 

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const resCategories = await axios.get(`${port}categories`);
        setCategories(resCategories.data);

        const resSuppliers = await axios.get(`${port}suppliers`);
        setSuppliers(resSuppliers.data);
      } catch {
        message.error("Failed to load initial data");
      }
    };
    loadData();
  }, []);

  // Load Attributes
  const handleCategoryChange = async (text, option) => {
    setSelectedCategoryId(option.key);
    setSelectedCategoryName(option.children);

    try {
      const res = await axios.get(`${port}categories/${option.key}/attributes`);
      setAttributes(res.data);

      const newValues = form.getFieldsValue();
      Object.keys(newValues)
        .filter((k) => k.startsWith("attr_"))
        .forEach((k) => (newValues[k] = undefined));
      form.setFieldsValue(newValues);
    } catch {
      message.error("Failed to load attributes");
    }
  };

  // Add to Cart
  const handleAddToCart = (values) => {
    if (!invoiceNumber) return message.error("Enter invoice number!");
    
    // Check if GST percentage is set
    if (gstPercentage === null || gstPercentage === undefined) {
      return message.error("Please enter the GST Percentage in the main form.");
    }

    const formattedAttributes = {};
    Object.keys(values).forEach((key) => {
      if (key.startsWith("attr_")) {
        formattedAttributes[key.replace("attr_", "")] = values[key];
      }
    });

    const quantity = parseFloat(values.quantity);
    const unitPrice = parseFloat(values.unit_price);
    
    // Calculations
    const baseTotal = quantity * unitPrice; // Price before GST
    const gstRate = gstPercentage / 100;
    const gstAmount = baseTotal * gstRate;
    const totalIncGst = baseTotal + gstAmount; // Total price including GST

    const newItem = {
      category_id: selectedCategoryId,
      category_name: selectedCategoryName,
      attributes: formattedAttributes,
      quantity: quantity,
      unit_price: unitPrice, // Unit price *before* GST
      quantity_type: values.quantity_type,
      // New fields for cart item
      gst_percentage: gstPercentage,
      gst_amount: gstAmount.toFixed(2),
      total_inc_gst: totalIncGst.toFixed(2) // Final total value (inc GST)
    };

    setCart([...cart, newItem]);
    message.success("Item added");

    form.resetFields(["quantity", "unit_price", "quantity_type"]);
  };

  const removeItem = (record) => setCart(cart.filter((i) => i !== record));

  // Submit Purchase
  const handleSubmitPurchase = async (values) => {
    if (!invoiceNumber) return message.error("Invoice missing!");
    if (cart.length === 0) return message.error("Cart empty!");
    if (gstPercentage === null || gstPercentage === undefined) return message.error("GST Percentage missing!");

    setLoading(true);

    try {
      // Process cart to ensure correct types for backend
      const processedCart = cart.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          gst_percentage: parseFloat(item.gst_percentage),
          gst_amount: parseFloat(item.gst_amount),
          total_inc_gst: parseFloat(item.total_inc_gst),
      }));
      
    const payload = {
            supplier_id: values.supplier_id,
            purchase_date: values.purchase_date.format("YYYY-MM-DD"),
            bill_number: invoiceNumber,
            stock_page_no: values.stock_page_no,
            stock_entry_date: values.stock_entry_date.format("YYYY-MM-DD"),
            // Use the state value, not the form value
            gst_percentage: gstPercentage, 
            items: processedCart 
        };

      await axios.post(`${port}purchase`, payload);

      message.success("Purchase submitted!");
      setCart([]);
      purchaseForm.resetFields();
      setInvoiceNumber("");
      setGstPercentage(1); // Reset GST percentage state
    } catch {
      message.error("Purchase failed");
    }

    setLoading(false);
  };

  const cartColumns = [
    { title: "Category", dataIndex: "category_name" },
    {
      title: "Attributes",
      render: (record) => (
        <ul>
          {Object.entries(record.attributes).map(([k, v]) => (
            <li key={k}><b>{k}:</b> {v}</li>
          ))}
        </ul>
      ),
    },
    { title: "Qty", dataIndex: "quantity" },
    { title: "Type", dataIndex: "quantity_type" },
    { title: "Unit Price (Excl GST)", dataIndex: "unit_price" }, // Updated title
    { title: "GST %", dataIndex: "gst_percentage" }, // New column
    { title: "GST Amt", dataIndex: "gst_amount" },   // New column
    { 
      title: "Total (Inc GST)", 
      dataIndex: "total_inc_gst", // New column for final total
    },
    {
      title: "Remove",
      render: (record) => (
        <Button danger onClick={() => removeItem(record)}>Remove</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 New Purchase</h2>

      <Form 
        form={purchaseForm} 
        layout="vertical" 
        style={{ marginBottom: 30 }}
        // Update GST percentage state when input changes
        onValuesChange={(_, allValues) => {
            if (allValues.gst_percentage !== undefined) {
                setGstPercentage(parseFloat(allValues.gst_percentage) || 0);
            }
        }}
      >
        <Form.Item label="Invoice Number" name="invoice" rules={[{ required: true }]}>
          <Input
            placeholder="Enter Invoice No"
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Supplier" name="supplier_id" rules={[{ required: true }]}>
          <Select placeholder="Select Supplier">
            {suppliers.map((s) => (
              <Option key={s.gstin} value={s.gstin}>{s.supplier_name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Purchase Date" name="purchase_date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
        </Form.Item>
        
        {/* New: GST Percentage Input */}
      <Form.Item 
    label="GST Percentage (%)" 
    required
    tooltip="This GST rate will apply to ALL items you add to the cart."
>
    <Input 
        type="number" 
        min={1} 
        max={100} 
        value={gstPercentage} // Control the value with state
        onChange={(e) => {
            // Update state directly when the user types
            const value = parseFloat(e.target.value) || 0;
            setGstPercentage(value);
        }}
    />
</Form.Item>

        <Form.Item label="Stock Page No" name="stock_page_no" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Stock Entry Date" name="stock_entry_date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
        </Form.Item>
      </Form>

      {/* Item Entry */}
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
            <Select>
              {attributes[attr].values.map((v) => (
                <Option key={v.value_id} value={v.value}>{v.value}</Option>
              ))}
            </Select>
          </Form.Item>
        ))}

        <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
          <Input type="number" min={1} />
        </Form.Item>

        <Form.Item label="Quantity Type" name="quantity_type" rules={[{ required: true }]}>
          <Select>
            <Option value="Nos">Nos</Option>
            <Option value="Meters">Meters</Option>
            <Option value="Coil">Coil</Option>
            <Option value="Box">Box</Option>
            <Option value="Packet">Packet</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Unit Price" name="unit_price" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>

        <Button icon={<PlusOutlined />} type="primary" htmlType="submit">
          Add to Cart
        </Button>
      </Form>

      <Table dataSource={cart} columns={cartColumns} rowKey={(r, i) => i} style={{ marginTop: 30 }} />

      <Button type="primary" style={{ marginTop: 30 }} onClick={() => purchaseForm.submit()} loading={loading}>
        Submit Purchase
      </Button>

      <Form form={purchaseForm} onFinish={handleSubmitPurchase} hidden />
    </div>
  );
};

export default Purchases;