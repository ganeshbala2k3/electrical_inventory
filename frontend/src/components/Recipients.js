import React, { useState, useEffect, useMemo } from "react";
import { Form, Input, Button, Table, message, Row, Col } from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import axios from "axios";
import { port } from "./porturl";

const { Search } = Input;

export default function Recipients() {
  const [form] = Form.useForm();
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 

  useEffect(() => {
    loadRecipients();
  }, []);

  // Load all recipients
  const loadRecipients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${port}recipients`);
      setRecipients(res.data);
    } catch (err) {
      message.error("Failed to load recipients");
    } finally {
      setLoading(false);
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
      console.error("Error adding recipient:", err);
      message.error("Failed to add recipient");
    }
  };

  // 🔥 REMOVED: deleteRecipient function is removed

  // Filtering recipients based on search term
  const filteredRecipients = useMemo(() => {
    if (!searchTerm) {
      return recipients;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();

    return recipients.filter(r =>
      r.recipient_name?.toLowerCase().includes(lowerCaseSearch) ||
      r.department?.toLowerCase().includes(lowerCaseSearch) ||
      r.phone?.toLowerCase().includes(lowerCaseSearch) ||
      r.email?.toLowerCase().includes(lowerCaseSearch)
    );
  }, [recipients, searchTerm]);


  // Table columns (🔥 REMOVED: Actions column)
  const columns = [
    { title: "Recipient Name", dataIndex: "recipient_name", sorter: (a, b) => a.recipient_name.localeCompare(b.recipient_name) },
    { title: "Department", dataIndex: "department" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Email", dataIndex: "email" },
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

        <Button type="primary" htmlType="submit" icon={<UserAddOutlined />}>
          Save Recipient
        </Button>
      </Form>

      <h2 style={{ marginTop: 30 }}>📋 Recipient List</h2>
      
      {/* Search Input */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Search
            placeholder="Search by Name, Dept, or Email"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={16} />
      </Row>


      <Table
        dataSource={filteredRecipients}
        columns={columns}
        rowKey="recipient_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}