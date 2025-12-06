import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, message, Popconfirm } from "antd";
import axios from "axios";
import { port } from "./porturl";

const Suppliers = () => {
  const [suppliersData, setSuppliersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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
      message.destroy();
      await axios.post(`${port}addSupplier`, formData);
      message.success("Supplier added successfully!");
      setFormData({ supplier_id: "", supplier_name: "", contact_person: "", phone: "", address: "" });
      setIsModalVisible(false);
      fetchSuppliers();
    } catch (error) {
      message.destroy();
      if (error.response?.status === 409) {
        message.error("Error: Supplier ID already exists.");
      } else {
        console.error("Error adding supplier:", error.response?.data || error.message);
        message.error("Error adding supplier: " + (error.response?.data?.message || error.message));
      }
    }
  };

// Delete single supplier
const deleteSupplier = async (id) => {
  setLoading(true);
  try {
    const response = await axios.delete(`${port}supplier/${id}`);
    message.success(response.data?.message || "Supplier deleted successfully");
    await fetchSuppliers();
    setTimeout(() => setLoading(false), 150);
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to delete supplier");
  } finally {
    setLoading(false);
  }
};

// Delete selected suppliers
const deleteSelectedSuppliers = async () => {
  if (selectedRowKeys.length === 0)
    return message.warning("Select at least one supplier");

  setLoading(true);
  try {
    const response = await axios.post(`${port}deleteMultipleSuppliers`, {
      ids: selectedRowKeys,
    });

    message.success(
      response.data?.message || "Selected suppliers deleted successfully"
    );

    setSelectedRowKeys([]);
    await fetchSuppliers();
setTimeout(() => setLoading(false), 150);

  } catch (error) {
    message.error(error.response?.data?.message || "Failed to delete selected");
  } finally {
    setLoading(false);
  }
};

  const suppliersColumns = [
    { title: "GST IN", dataIndex: "gstin", key: "gstin" },
    { title: "Supplier Name", dataIndex: "supplier_name", key: "supplier_name" },
    { title: "Contact Person", dataIndex: "contact_person", key: "contact_person" },
    { title: "Phone", dataIndex: "phone_number", key: "phone" },
    { title: "Address", dataIndex: "address", key: "address" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Popconfirm title="Are you sure?" onConfirm={() => deleteSupplier(record.gstin)}>
          <Button danger size="small">Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Suppliers</h2>

      {selectedRowKeys.length > 0 && (
        <Popconfirm title="Delete selected suppliers?" onConfirm={deleteSelectedSuppliers}>
          <Button danger style={{ marginBottom: 10 }}>Delete Selected ({selectedRowKeys.length})</Button>
        </Popconfirm>
      )}

      <Table
        rowSelection={rowSelection}
        dataSource={suppliersData}
        columns={suppliersColumns}
        rowKey={(record) => record.gstin}
        loading={loading}
      />

      <Button type="primary" style={{ marginTop: 20 }} onClick={() => setIsModalVisible(true)}>
        + Add Supplier
      </Button>

      <Modal title="Add Supplier" visible={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={handleSubmit} okText="Add">
        <Input name="supplier_id" placeholder="Supplier ID" value={formData.supplier_id} onChange={handleChange} style={{ marginBottom: 10 }} />
        <Input name="supplier_name" placeholder="Supplier Name" value={formData.supplier_name} onChange={handleChange} style={{ marginBottom: 10 }} />
        <Input name="contact_person" placeholder="Contact Person" value={formData.contact_person} onChange={handleChange} style={{ marginBottom: 10 }} />
        <Input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} style={{ marginBottom: 10 }} />
        <Input.TextArea name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
      </Modal>
    </div>
  );
};

export default Suppliers;