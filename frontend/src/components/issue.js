import React, { useEffect, useState } from "react";
import { Form, Select, Input, Button, DatePicker, Table, message } from "antd";
import axios from "axios";
import { port } from "./porturl";

const { Option } = Select;

export default function IssueItems() {
  const [form] = Form.useForm();

  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [stock, setStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);

  const [cart, setCart] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [recipients, setRecipients] = useState([]);
  const [loggedUser, setLoggedUser] = useState("");

  // -----------------------
  // LOAD INITIAL DATA
  // -----------------------
  useEffect(() => {
    loadCategories();
    loadRecipients();
    loadUser();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await axios.get(`${port}categories`);
      setCategories(res.data);
    } catch {
      message.error("Failed to load categories");
    }
  };

  const loadRecipients = async () => {
    try {
      const res = await axios.get(`${port}recipients`);
      setRecipients(res.data);
    } catch {
      message.error("Failed to load recipients");
    }
  };

  // Load Logged-in User
  const loadUser = async () => {
    try {
      const res = await axios.get(`${port}auth/me`);
      setLoggedUser(res.data.username);
    } catch {
      message.error("Failed to load logged user");
    }
  };

  // -----------------------
  // CATEGORY CHANGE
  // -----------------------
  const handleCategoryChange = async (_, option) => {
    setSelectedCategory(option.key);

    try {
      const resAttr = await axios.get(`${port}categories/${option.key}/attributes`);
      setAttributes(resAttr.data);

      const resStock = await axios.get(`${port}category-stock/${option.key}`);
      setStock(resStock.data);
      setFilteredStock(resStock.data);

    } catch {
      message.error("Error loading category details");
    }
  };

  // -----------------------
  // FILTER STOCK BASED ON ATTRIBUTES
  // -----------------------
  const handleFilter = (values) => {
    let result = [...stock];

    Object.keys(values).forEach((k) => {
      if (k.startsWith("attr_") && values[k]) {
        result = result.filter(item => item.attributes.includes(values[k]));
      }
    });

    setFilteredStock(result);
  };

  // -----------------------
  // ADD ITEM TO ISSUE CART
  // -----------------------
  const handleAddToCart = (values) => {
    const selectedItem = filteredStock.find(i => i.item_id === values.item_id);

    if (!selectedItem) return message.error("Invalid item selection");

    if (values.quantity > selectedItem.available_qty) {
      return message.error("Not enough stock available");
    }

    setCart([
      ...cart,
      {
        allotment_id: values.allotment_id,
        item_id: selectedItem.item_id,
        item_label: `${selectedItem.category_name} | ${selectedItem.attributes}`,
        quantity: values.quantity,
        issued_to: values.issued_to,
        issued_by: loggedUser, // AUTO SET
        issue_date: values.issue_date
      }
    ]);

    message.success("Added to issue list");
    form.resetFields(["quantity", "allotment_id"]);
  };

  // -----------------------
  // SUBMIT FULL ISSUE
  // -----------------------
  const submitIssue = async () => {
    if (cart.length === 0) return message.error("Issue cart is empty");

    try {
      await axios.post(`${port}issue-items`, { items: cart });
      setCart([]);
      form.resetFields();
      message.success("Items issued successfully");

    } catch (err) {
      console.log(err);
      message.error("Failed to issue items");
    }
  };

  // -----------------------
  // TABLE COLUMNS
  // -----------------------
  const columns = [
    { title: "Allotment ID", dataIndex: "allotment_id" },
    { title: "Item", dataIndex: "item_label" },
    { title: "Qty", dataIndex: "quantity" },
    { title: "Issued To", dataIndex: "issued_to" },
    { title: "Issued By", dataIndex: "issued_by" },
    {
      title: "Date",
      dataIndex: "issue_date",
      render: d => new Date(d).toLocaleDateString()
    },
    {
      title: "Remove",
      render: (_, record) => (
        <Button danger onClick={() => setCart(cart.filter(i => i !== record))}>
          Delete
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>📤 Issue Stock</h2>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={(_, allValues) => handleFilter(allValues)}
        onFinish={handleAddToCart}
      >

        {/* Allotment ID */}
        <Form.Item name="allotment_id" label="Allotment ID" rules={[{ required: true }]}>
          <Input placeholder="Enter Allotment ID" />
        </Form.Item>

        {/* CATEGORY */}
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select placeholder="Select Category" onChange={handleCategoryChange}>
            {categories.map(c => (
              <Option key={c.category_id} value={c.category_name}>
                {c.category_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* DYNAMIC ATTRIBUTE FILTERS */}
        {Object.keys(attributes).map(attr => (
          <Form.Item key={attr} name={`attr_${attr}`} label={attr}>
            <Select>
              {attributes[attr].values.map(v => (
                <Option key={v.value_id} value={v.value}>{v.value}</Option>
              ))}
            </Select>
          </Form.Item>
        ))}

        {/* STOCK DROPDOWN */}
        <Form.Item name="item_id" label="Available Items" rules={[{ required: true }]}>
          <Select>
            {filteredStock.map(item => (
              <Option key={item.item_id} value={item.item_id}>
                {item.attributes} (Available: {item.available_qty})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* QUANTITY */}
        <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
          <Input type="number" min={1} />
        </Form.Item>

        {/* RECIPIENT DROPDOWN */}
        <Form.Item name="issued_to" label="Issued To" rules={[{ required: true }]}>
          <Select placeholder="Select Recipient">
            {recipients.map(r => (
              <Option key={r.recipient_id} value={r.recipient_name}>
                {r.recipient_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* ISSUED BY AUTO-FILLED */}
        <Form.Item label="Issued By">
          <Input value={loggedUser} disabled />
        </Form.Item>

        {/* DATE */}
        <Form.Item name="issue_date" label="Issue Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
        </Form.Item>

        <Button type="primary" htmlType="submit">Add to Issue Cart</Button>
      </Form>

      <Table dataSource={cart} columns={columns} style={{ marginTop: 20 }} rowKey={(r,i)=>i} />

      <Button type="primary" disabled={!cart.length} onClick={submitIssue}>
        Submit Issue
      </Button>
    </div>
  );
}