import React, { useState, useEffect } from "react";
import { Form, Input, Button, Table, message } from "antd";
import axios from "axios";
import { port } from "./porturl";

export default function Recipients() {
  const [form] = Form.useForm();
  const [recipients, setRecipients] = useState([]);

  useEffect(() => {
    loadRecipients();
  }, []);

  // Load all recipients
  const loadRecipients = async () => {
    try {
      const res = await axios.get(`${port}recipients`);
      setRecipients(res.data);
    } catch (err) {
      message.error("Failed to load recipients");
    }
  };

  // Add a recipient
  const addRecipient = async (values) => {
    try {
      await axios.post(`${port}recipients`, values);
      message.success("Recipient added successfully");
      form.resetFields();
      loadRecipients();
    } catch (err) {
      message.error("Failed to add recipient");
    }
  };

  // Delete recipient
  const deleteRecipient = async (id) => {
    try {
      await axios.delete(`${port}recipients/${id}`);
      message.success("Recipient deleted");
      loadRecipients();
    } catch (err) {
      message.error("Failed to delete recipient");
    }
  };

  // Table columns
  const columns = [
    { title: "Recipient Name", dataIndex: "recipient_name" },
    { title: "Department", dataIndex: "department" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Actions",
      render: (record) => (
        <Button
          danger
          onClick={() => deleteRecipient(record.recipient_id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>➕ Add Recipient</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={addRecipient}
        style={{ maxWidth: 400 }}
      >
        <Form.Item
          label="Recipient Name"
          name="recipient_name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="Enter Name" />
        </Form.Item>

        <Form.Item
          label="Department"
          name="department"
          rules={[{ required: true, message: "Department is required" }]}
        >
          <Input placeholder="Enter Department" />
        </Form.Item>

        <Form.Item label="Phone" name="phone">
          <Input placeholder="Enter Phone Number" />
        </Form.Item>

        <Form.Item label="Email" name="email">
          <Input placeholder="Enter Email" />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Save Recipient
        </Button>
      </Form>

      <h2 style={{ marginTop: 30 }}>📋 Recipient List</h2>

      <Table
        dataSource={recipients}
        columns={columns}
        rowKey="recipient_id"
      />
    </div>
  );
}
