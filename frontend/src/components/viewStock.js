import React, { useEffect, useState } from "react";
import { Form, Select, Table, Input } from "antd";
import axios from "axios";
import { port } from "./porturl";

const { Option } = Select;

export default function ViewStock() {
  const [form] = Form.useForm();

  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [stock, setStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const res = await axios.get(`${port}categories`);
    setCategories(res.data);
  };

  const handleCategoryChange = async (_, option) => {
    const categoryId = option.key;

    const resAttr = await axios.get(`${port}categories/${categoryId}/attributes`);
    setAttributes(resAttr.data);

    const resStock = await axios.get(`${port}category-stock/${categoryId}`);
    setStock(resStock.data);
    setFilteredStock(resStock.data);
  };

  const handleFilter = (_, values) => {
    let result = [...stock];

    Object.keys(values).forEach((k) => {
      if (k.startsWith("attr_") && values[k]) {
        result = result.filter(item =>
          item.attributes?.toLowerCase().includes(values[k].toLowerCase())
        );
      }
    });

    setFilteredStock(result);
  };

  const columns = [
    { title: "Item ID", dataIndex: "item_id" },
    { title: "Category", dataIndex: "category_name" },
    { title: "Attributes", dataIndex: "attributes" },
    { title: "Available Qty", dataIndex: "available_qty" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 View Stock</h2>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFilter}
      >
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select onChange={handleCategoryChange} placeholder="Select category">
            {categories.map(c => (
              <Option key={c.category_id} value={c.category_name}>
                {c.category_name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {Object.keys(attributes).map(attr => (
          <Form.Item key={attr} name={`attr_${attr}`} label={attr}>
            <Select allowClear placeholder={`Filter by ${attr}`}>
              {attributes[attr].values.map(v => (
                <Option key={v.value_id} value={v.value}>{v.value}</Option>
              ))}
            </Select>
          </Form.Item>
        ))}

        <Form.Item name="search" label="Search Attributes">
          <Input
            placeholder="Type to search"
            onChange={e => {
              const val = e.target.value.toLowerCase();
              setFilteredStock(
                stock.filter(i => i.attributes?.toLowerCase().includes(val))
              );
            }}
          />
        </Form.Item>
      </Form>

      <Table
        dataSource={filteredStock}
        columns={columns}
        rowKey="item_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
