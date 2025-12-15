import React, { useState, useEffect } from "react";
// Removed duplicate Antd import line
import { Form, Input, Button, Select, message, Table, Card, Divider, Row, Col, Typography, Space, Tag } from "antd"; // ADDED TAG
import { PlusOutlined, TagsOutlined, SettingOutlined, CheckSquareOutlined, DatabaseOutlined } from "@ant-design/icons";
import axios from "axios";
import { port } from "./porturl";

const { Option } = Select;
const { Title, Text } = Typography;

// ... rest of the component logic ...

const AddCategory = () => {
  const [categoryForm] = Form.useForm();
  const [attributeForm] = Form.useForm();
  const [valueForm] = Form.useForm();

  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const selectedCategoryName = categories.find(c => c.category_id === selectedCategoryId)?.category_name || "N/A";

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
    setLoadingAttributes(true);

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
    } finally {
      setLoadingAttributes(false);
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
      // Refetch attributes for the selected category
      fetchAttributes(values.category_id);
      attributeForm.resetFields(["attribute_name"]); // Reset only the input field
    } catch {
      message.error("Failed to add attribute.");
    }
  };

  const handleAddValue = async (values) => {
    try {
      await axios.post(`${port}add-attribute-values`, values);
      message.success("Value added!");
      // Refetch attributes for the currently displayed category
      if (selectedCategoryId) {
        fetchAttributes(selectedCategoryId);
      }
      valueForm.resetFields(["value"]); // Reset only the value input
    } catch {
      message.error("Failed to add value.");
    }
  };

  // Function to handle category change in the Attribute form
  const handleAttributeCategoryChange = (catId) => {
    // Reset attribute and value forms when category changes
    attributeForm.setFieldsValue({ category_id: catId });
    valueForm.resetFields(); 
    fetchAttributes(catId);
  };

  return (
    <div style={{ padding: 20 }}>
     
      <Divider style={{ margin: '15px 0' }} />

      <Row gutter={24}>
        
        {/* ---------------- 1. ADD CATEGORY ---------------- */}
        <Col span={8}>
          <Card 
            title={<Space><TagsOutlined style={{ color: '#1890ff' }} /> <Text strong>1. Add New Category</Text></Space>}
            bordered={false}
            style={{ marginBottom: 20, boxShadow: "0 4px 8px rgba(0,0,0,0.05)" }}
          >
            <Form form={categoryForm} layout="vertical" onFinish={handleAddCategory}>
              <Form.Item name="category_name" rules={[{ required: true, message: "Category name required" }]}>
                <Input placeholder="e.g. Wire Coils, Tools" />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} style={{ width: '100%' }}>
                Save Category
              </Button>
            </Form>
          </Card>
        </Col>

        {/* ---------------- 2. ADD ATTRIBUTE ---------------- */}
        <Col span={8}>
          <Card 
            title={<Space><SettingOutlined style={{ color: '#faad14' }} /> <Text strong>2. Add Attribute</Text></Space>}
            bordered={false}
            style={{ marginBottom: 20, boxShadow: "0 4px 8px rgba (0,0,0,0.05)" }}
          >
            <Form form={attributeForm} layout="vertical" onFinish={handleAddAttribute}>
              <Form.Item name="category_id" rules={[{ required: true, message: "Select a category" }]}>
                <Select
                  placeholder="Select Category"
                  onChange={handleAttributeCategoryChange}
                >
                  {categories.map((c) => (
                    <Option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="attribute_name" rules={[{ required: true, message: "Attribute name required" }]}>
                <Input placeholder="e.g. Size, Material, Brand" />
              </Form.Item>

              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} style={{ width: '100%', backgroundColor: '#faad14', borderColor: '#faad14' }}>
                Save Attribute
              </Button>
            </Form>
          </Card>
        </Col>

        {/* ---------------- 3. ADD VALUE ---------------- */}
        <Col span={8}>
          <Card 
            title={<Space><CheckSquareOutlined style={{ color: '#52c41a' }} /> <Text strong>3. Add Value</Text></Space>}
            bordered={false}
            style={{ marginBottom: 20, boxShadow: "0 4px 8px rgba(0,0,0,0.05)" }}
          >
            <Form form={valueForm} layout="vertical" onFinish={handleAddValue}>
              <Form.Item name="attribute_id" rules={[{ required: true, message: "Select an attribute" }]}>
                <Select placeholder="Select Attribute">
                  {attributes.map((a) => (
                    <Option key={a.id} value={a.id}>
                      {a.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="value" rules={[{ required: true, message: "Value required" }]}>
                <Input placeholder="e.g. 15mm, PVC, Acme Corp" />
              </Form.Item>

              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} style={{ width: '100%', backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                Save Value
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left" style={{ marginTop: 20 }}>
        <Title level={4}>
          Current Attributes for: <span style={{ color: '#1890ff' }}>{selectedCategoryName}</span>
        </Title>
      </Divider>

      {/* TABLE */}
      <Table
        dataSource={attributes}
        rowKey={(row) => row.id}
        loading={loadingAttributes}
        pagination={false}
        columns={[
          { title: "Attribute ID", dataIndex: "id", width: 100 },
          { title: "Attribute Name", dataIndex: "label", width: 200 },
          {
            title: "Available Values",
            dataIndex: "values",
            render: (values) => values.map((v) => 
                <Tag color="processing" key={v.value_id}>{v.value}</Tag>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AddCategory;