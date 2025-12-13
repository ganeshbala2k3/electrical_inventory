import React, { useEffect, useState } from "react";
import { Form, Select, Input, Button, DatePicker, Table, message } from "antd";
import axios from "axios";
import { port } from "./porturl";
import dayjs from "dayjs";


const { Option } = Select;

export default function IssueItems() {
  const [form] = Form.useForm();

  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [stock, setStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [cart, setCart] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loggedUser, setLoggedUser] = useState("");

  useEffect(() => {
    loadCategories();
    loadRecipients();
    setLoggedUser(localStorage.getItem("user_name"));
  }, []);

  const loadCategories = async () => {
    const res = await axios.get(`${port}categories`);
    setCategories(res.data);
  };

  const loadRecipients = async () => {
    const res = await axios.get(`${port}recipients`);
    setRecipients(res.data);
  };

  const handleCategoryChange = async (_, option) => {
    const categoryId = option.key;

    const resAttr = await axios.get(`${port}categories/${categoryId}/attributes`);
    setAttributes(resAttr.data);

    const resStock = await axios.get(`${port}category-stock/${categoryId}`);
    setStock(resStock.data);
    setFilteredStock(resStock.data);
  };

const handleFilter = (values) => {
  let result = [...stock];

  Object.keys(values).forEach((k) => {
    if (k.startsWith("attr_") && values[k]) {
      const selectedValue = values[k].toLowerCase();

      result = result.filter(item =>
        item.attributes
          ?.toLowerCase()
          .includes(selectedValue)
      );
    }
  });

  setFilteredStock(result);
};


  const handleAddToCart = (values) => {
    const item = filteredStock.find(i => i.item_id === values.item_id);
    if (!item) return message.error("Invalid item");

    if (values.quantity > item.available_qty)
      return message.error("Insufficient stock");

    if (cart.some(c => c.item_id === item.item_id))
      return message.error("Item already in cart");

    setCart(prev => [
      ...prev,
      {
        allotment_id: values.allotment_id,
        item_id: item.item_id,
        item_label: `${item.category_name} | ${item.attributes}`,
        quantity: values.quantity,
        issued_to: values.issued_to,
        issued_by: loggedUser,
        issue_date: values.issue_date.format("YYYY-MM-DD")
      }
    ]);

    form.resetFields(["quantity", "item_id"]);
  };

  const submitIssue = async () => {
    if (!cart.length) return message.error("Cart empty");

    await axios.post(`${port}issue-items`, { items: cart });
    setCart([]);
    form.resetFields();
    message.success("Issued successfully");
  };

  const columns = [
    { title: "Allotment", dataIndex: "allotment_id" },
    { title: "Item", dataIndex: "item_label" },
    { title: "Qty", dataIndex: "quantity" },
    { title: "Issued To", dataIndex: "issued_to" },
    { title: "Issued By", dataIndex: "issued_by" },
    { title: "Date", dataIndex: "issue_date" },
    {
      title: "Remove",
      render: (_, r) => (
        <Button danger onClick={() => setCart(cart.filter(i => i.item_id !== r.item_id))}>
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
        onValuesChange={(_, v) => handleFilter(v)}
        onFinish={handleAddToCart}
        initialValues={{
        issue_date: dayjs(),   // ✅ TODAY
         }}
      >
        <Form.Item name="allotment_id" label="Allotment ID" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select onChange={handleCategoryChange}>
            {categories.map(c => (
              <Option key={c.category_id} value={c.category_name}>
                {c.category_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {Object.keys(attributes).map(attr => (
          <Form.Item key={attr} name={`attr_${attr}`} label={attr}>
            <Select allowClear>
              {attributes[attr].values.map(v => (
                <Option key={v.value_id} value={v.value}>{v.value}</Option>
              ))}
            </Select>
          </Form.Item>
        ))}

        <Form.Item name="item_id" label="Item" rules={[{ required: true }]}>
          <Select>
            {filteredStock.map(i => (
              <Option key={i.item_id} value={i.item_id}>
                {i.attributes} (Stock: {i.available_qty})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
          <Input type="number" min={1} />
        </Form.Item>

        <Form.Item name="issued_to" label="Issued To" rules={[{ required: true }]}>
          <Select>
            {recipients.map(r => (
              <Option key={r.recipient_id} value={r.recipient_name}>
                {r.recipient_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Issued By">
          <Input value={loggedUser} disabled />
        </Form.Item>

        <Form.Item name="issue_date" label="Issue Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Button type="primary" htmlType="submit">Add</Button>
      </Form>

      <Table
        dataSource={cart}
        columns={columns}
        rowKey="item_id"
        style={{ marginTop: 20 }}
      />

      <Button type="primary" disabled={!cart.length} onClick={submitIssue}>
        Submit Issue
      </Button>
    </div>
  );
}
