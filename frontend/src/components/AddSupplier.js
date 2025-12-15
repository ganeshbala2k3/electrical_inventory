import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Modal, Input, message, Row, Col } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { port } from "./porturl";

const { Search } = Input;

const Suppliers = () => {
  const [suppliersData, setSuppliersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // 🔥 NEW: State for search term
  const [formData, setFormData] = useState({
    supplier_id: "",
    supplier_name: "",
    contact_person: "",
    phone: "",
    address: "",
  });

  // Fetch suppliers data
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${port}suppliers`);
      setSuppliersData(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      message.error("Failed to fetch suppliers. Please try again later.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Basic form validation (ensure required fields are not empty)
    if (!formData.supplier_id || !formData.supplier_name || !formData.contact_person || !formData.phone || !formData.address) {
        return message.error("Please fill in all required fields.");
    }

    try {
      message.destroy();
      await axios.post(`${port}addSupplier`, {
        // Use supplier_id for the database field gstin
        supplier_id: formData.supplier_id, 
        supplier_name: formData.supplier_name,
        contact_person: formData.contact_person,
        phone: formData.phone,
        address: formData.address,
      });
      message.success("Supplier added successfully!");
      setFormData({
        supplier_id: "",
        supplier_name: "",
        contact_person: "",
        phone: "",
        address: "",
      });
      setIsModalVisible(false);
      fetchSuppliers();
    } catch (error) {
      message.destroy();
      if (error.response?.status === 409) {
        message.error("Error: Supplier ID (GSTIN) already exists.");
      } else {
        console.error(
          "Error adding supplier:",
          error.response?.data || error.message
        );
        message.error(
          "Error adding supplier: " + (error.response?.data?.message || 'Unknown error')
        );
      }
    }
  };

  // 🔥 NEW LOGIC: Filtering suppliers data
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) {
      return suppliersData;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();

    return suppliersData.filter(supplier =>
      supplier.gstin?.toLowerCase().includes(lowerCaseSearch) ||
      supplier.supplier_name?.toLowerCase().includes(lowerCaseSearch) ||
      supplier.contact_person?.toLowerCase().includes(lowerCaseSearch) ||
      supplier.phone_number?.toLowerCase().includes(lowerCaseSearch)
    );
  }, [suppliersData, searchTerm]);


  const suppliersColumns = [
    { 
        title: "GST IN", 
        dataIndex: "gstin", 
        key: "gstin",
        // Enable built-in sorting on GSTIN
        sorter: (a, b) => a.gstin.localeCompare(b.gstin)
    },
    { 
        title: "Supplier Name", 
        dataIndex: "supplier_name", 
        key: "supplier_name",
        // Enable built-in sorting on Name
        sorter: (a, b) => a.supplier_name.localeCompare(b.supplier_name)
    },
    { title: "Contact Person", dataIndex: "contact_person", key: "contact_person" },
    { title: "Phone", dataIndex: "phone_number", key: "phone" },
    { title: "Address", dataIndex: "address", key: "address" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Vendors / Suppliers</h2>
      
      <Row gutter={16} style={{ marginBottom: 16, alignItems: 'center' }}>
        <Col span={8}>
          {/* 🔥 NEW: Search Input */}
          <Search
            placeholder="Search by GSTIN, Name, or Contact"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={16} style={{ textAlign: 'right' }}>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
            >
                Add Supplier
            </Button>
        </Col>
      </Row>

      <Table
        // 🔥 Use filtered data source
        dataSource={filteredSuppliers}
        columns={suppliersColumns}
        rowKey={(record) => record.gstin}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <Modal
        title="Add New Supplier"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText="Add Supplier"
        destroyOnClose={true} // Reset form when closing modal
      >
        <Input
          name="supplier_id"
          placeholder="Supplier ID (GSTIN)"
          value={formData.supplier_id}
          onChange={handleChange}
          style={{ marginBottom: 10 }}
          required
        />
        <Input
          name="supplier_name"
          placeholder="Supplier Name"
          value={formData.supplier_name}
          onChange={handleChange}
          style={{ marginBottom: 10 }}
          required
        />
        <Input
          name="contact_person"
          placeholder="Contact Person"
          value={formData.contact_person}
          onChange={handleChange}
          style={{ marginBottom: 10 }}
          required
        />
        <Input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          style={{ marginBottom: 10 }}
          required
        />
        <Input.TextArea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </Modal>
    </div>
  );
};

export default Suppliers;