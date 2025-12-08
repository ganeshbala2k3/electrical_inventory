import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message, Table } from "antd";
import axios from "axios";
import { PlusOutlined } from "@ant-design/icons";
import { port } from "./porturl";

const { Option } = Select;

const AddCategory = () => {
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedAttributeId, setSelectedAttributeId] = useState(null);

  // Fetch categories when page loads
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${port}categories`);
      setCategories(res.data);
    } catch (err) {
      message.error("Failed to fetch categories.");
    }
  };

  const fetchAttributes = async (categoryId) => {
    try {
      const res = await axios.get(`${port}categories/${categoryId}/attributes`);
      setAttributes(
        Object.entries(res.data).map(([name, obj]) => ({
          label: name,
          id: obj.attribute_id,
          values: obj.values,
        }))
      );
    } catch (err) {
      message.error("Failed to fetch attributes.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // -------------------- ADD CATEGORY --------------------
  const handleAddCategory = async (values) => {
    try {
      await axios.post(`${port}add-categories`, values);
      message.success("Category added!");
      fetchCategories();
    } catch {
      message.error("Failed to add category.");
    }
  };

  // -------------------- ADD ATTRIBUTE --------------------
  const handleAddAttribute = async (values) => {
    try {
      await axios.post(`${port}add-attributes`, values);
      message.success("Attribute added!");
      fetchAttributes(values.category_id);
    } catch {
      message.error("Failed to add attribute.");
    }
  };

  // -------------------- ADD ATTRIBUTE VALUE --------------------
  const handleAddValue = async (values) => {
    try {
      await axios.post(`${port}add-attribute-values`, values);
      message.success("Value added!");
      fetchAttributes(values.attribute_id);
      
    } catch {
      message.error("Failed to add value.");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>⚙️ Add Category / Attributes / Values</h2>

      {/* ADD CATEGORY FORM */}
      <Form layout="inline" onFinish={handleAddCategory} style={{ marginBottom: 30 }}>
        <Form.Item name="category_name" label="New Category" rules={[{ required: true }]}>
          <Input placeholder="Ex: Wire Coils" />
        </Form.Item>
        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
          Add Category
        </Button>
      </Form>

      {/* ADD ATTRIBUTE FORM */}
      <Form layout="inline" onFinish={handleAddAttribute} style={{ marginBottom: 30 }}>
        <Form.Item name="category_id" rules={[{ required: true }]} label="Category">
          <Select placeholder="Select Category" onChange={fetchAttributes} style={{ width: 200 }}>
            {categories.map((c) => (
              <Option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="attribute_name" rules={[{ required: true }]} label="Attribute Name">
          <Input placeholder="Ex: Color" />
        </Form.Item>

        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
          Add Attribute
        </Button>
      </Form>

      {/* ADD ATTRIBUTE VALUE */}
      <Form layout="inline" onFinish={handleAddValue}>
        <Form.Item name="attribute_id" rules={[{ required: true }]} label="Attribute">
          <Select
            placeholder="Select Attribute"
            onChange={(id) => setSelectedAttributeId(id)}
            style={{ width: 200 }}
          >
            {attributes.map((a) => (
              <Option key={a.id} value={a.id}>
                {a.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="value" rules={[{ required: true }]} label="Value">
          <Input placeholder="Ex: Red" />
        </Form.Item>

        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
          Add Value
        </Button>
      </Form>

      {/* Display current structure */}
      <h3 style={{ marginTop: 40 }}>📌 Current Structure</h3>

      <Table
        dataSource={attributes}
        rowKey={(row) => row.id}
        columns={[
          { title: "Attribute", dataIndex: "label" },
          {
            title: "Values",
            render: (record) => record.values.map((v) => v.value).join(", "),
          },
        ]}
      />
    </div>
  );
};

export default AddCategory;
