import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message, Table } from "antd";
import axios from "axios";
import { PlusOutlined } from "@ant-design/icons";
import { port } from "./porturl";

const { Option } = Select;

const AddCategory = () => {
  const [categoryForm] = Form.useForm();
  const [attributeForm] = Form.useForm();
  const [valueForm] = Form.useForm();

  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Fetch categories on load
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${port}categories`);
      setCategories(res.data);
    } catch (err) {
      message.error("Failed to fetch categories.");
    }
  };

  const fetchAttributes = async (categoryId) => {
    setSelectedCategoryId(categoryId);

    try {
      const res = await axios.get(`${port}categories/${categoryId}/attributes`);
      const mapped = Object.entries(res.data).map(([name, obj]) => ({
        id: obj.attribute_id,
        label: name,
        values: obj.values || [],
      }));
      setAttributes(mapped);
    } catch {
      message.error("Failed to fetch attributes.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (values) => {
    try {
      await axios.post(`${port}add-categories`, values);
      message.success("Category added!");
      categoryForm.resetFields();
      fetchCategories();
    } catch {
      message.error("Failed to add category.");
    }
  };

  const handleAddAttribute = async (values) => {
    try {
      await axios.post(`${port}add-attributes`, values);
      message.success("Attribute added!");
      fetchAttributes(values.category_id);
      attributeForm.resetFields();
    } catch {
      message.error("Failed to add attribute.");
    }
  };

  const handleAddValue = async (values) => {
    try {
      await axios.post(`${port}add-attribute-values`, values);
      message.success("Value added!");
      fetchAttributes(selectedCategoryId);
      valueForm.resetFields(["value"]);
    } catch {
      message.error("Failed to add value.");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>⚙️ Add Category / Attributes / Values</h2>

      {/* ADD CATEGORY */}
      <Form form={categoryForm} layout="inline" onFinish={handleAddCategory} style={{ marginBottom: 30 }}>
        <Form.Item name="category_name" rules={[{ required: true }]}>
          <Input placeholder="New Category (e.g. Wire Coils)" />
        </Form.Item>

        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
          Add Category
        </Button>
      </Form>

      {/* ADD ATTRIBUTE */}
      <Form form={attributeForm} layout="inline" onFinish={handleAddAttribute} style={{ marginBottom: 30 }}>
        <Form.Item name="category_id" rules={[{ required: true }]}>
          <Select
            placeholder="Select Category"
            style={{ width: 200 }}
            onChange={(catId) => {
              fetchAttributes(catId);
              valueForm.resetFields();
            }}
          >
            {categories.map((c) => (
              <Option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="attribute_name" rules={[{ required: true }]}>
          <Input placeholder="Attribute Name (e.g. Color)" />
        </Form.Item>

        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
          Add Attribute
        </Button>
      </Form>

      {/* ADD VALUE */}
      <Form form={valueForm} layout="inline" onFinish={handleAddValue}>
        <Form.Item name="attribute_id" rules={[{ required: true }]}>
          <Select placeholder="Select Attribute" style={{ width: 200 }}>
            {attributes.map((a) => (
              <Option key={a.id} value={a.id}>
                {a.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="value" rules={[{ required: true }]}>
          <Input placeholder="Value (e.g. Red)" />
        </Form.Item>

        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
          Add Value
        </Button>
      </Form>

      {/* TABLE */}
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
