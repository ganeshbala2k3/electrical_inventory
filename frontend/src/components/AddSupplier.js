import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, message } from "antd";
import axios from "axios";
import { port } from "./porturl";
const Suppliers = () => {
  const [suppliersData, setSuppliersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
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
    fetchSuppliers(); // Fetch suppliers when the component mounts
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Clear any existing messages
      message.destroy();

      const response = await axios.post(`${port}addSupplier`, formData);
      message.success("Supplier added successfully!"); // Show success alert
      setFormData({
        supplier_id: "",
        supplier_name: "",
        contact_person: "",
        phone: "",
        address: "",
      }); // Reset form
      setIsModalVisible(false); // Close modal
      fetchSuppliers(); // Refresh suppliers table
    } catch (error) {
      // Clear any existing messages
      message.destroy();

      if (error.response?.status === 409) {
        message.error("Error: Supplier ID already exists."); // Show alert for duplicate entry
      } else {
        console.error("Error adding supplier:", error.response?.data || error.message);
        message.error("Error adding supplier: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // Columns for the suppliers table
  const suppliersColumns = [
    {
      title: "Supplier ID",
      dataIndex: "supplier_id",
      key: "supplier_id",
    },
    {
      title: "Supplier Name",
      dataIndex: "supplier_name",
      key: "supplier_name",
    },
    {
      title: "Contact Person",
      dataIndex: "contact_person",
      key: "contact_person",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Suppliers</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table
          dataSource={suppliersData}
          columns={suppliersColumns}
          rowKey={(record) => record.supplier_id} // Assuming `supplier_id` is the unique key
        />
      )}
      <Button
        type="primary"
        style={{ marginTop: 20 }}
        onClick={() => setIsModalVisible(true)}
      >
        + Add Supplier
      </Button>

      {/* Add Supplier Modal */}
      <Modal
        title="Add Supplier"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText="Add"
      >
        <Input
          type="text"
          name="supplier_id"
          placeholder="Supplier ID"
          value={formData.supplier_id}
          onChange={handleChange}
          style={{ marginBottom: 10 }}
        />
        <Input
          type="text"
          name="supplier_name"
          placeholder="Supplier Name"
          value={formData.supplier_name}
          onChange={handleChange}
          style={{ marginBottom: 10 }}
        />
        <Input
          type="text"
          name="contact_person"
          placeholder="Contact Person"
          value={formData.contact_person}
          onChange={handleChange}
          style={{ marginBottom: 10 }}
        />
        <Input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          style={{ marginBottom: 10 }}
        />
        <Input.TextArea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          style={{ marginBottom: 10 }}
        />
      </Modal>
    </div>
  );
};

export default Suppliers;