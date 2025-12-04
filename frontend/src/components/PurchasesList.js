import React, { useState, useEffect } from "react";
import { Table, DatePicker, Button, Spin, message, AutoComplete, Input } from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { port } from "./porturl";
const { RangePicker } = DatePicker;

const PurchasesList = () => {
  const [purchases, setPurchases] = useState([]); // Store purchases data
  const [loading, setLoading] = useState(false); // Loading state
  const [filters, setFilters] = useState({
    date_from: null,
    date_to: null,
    supplier_id: null, // Supplier ID filter
    bill_no: null, // Bill Number filter
  });
  const [billOptions, setBillOptions] = useState([]); // Options for Bill Number AutoComplete
  const [supplierOptions, setSupplierOptions] = useState([]); // Options for Supplier ID AutoComplete

  // Fetch purchases from the backend
  const fetchPurchases = async (applyFilters = false) => {
    setLoading(true);
    try {
      const params = {};
      if (applyFilters) {
        if (filters.date_from) {
          params.date_from = filters.date_from.format("YYYY-MM-DD");
        }
        if (filters.date_to) {
          params.date_to = filters.date_to.format("YYYY-MM-DD");
        }
        if (filters.supplier_id) {
          params.supplier_id = filters.supplier_id;
        }
        if (filters.bill_no) {
          params.bill_no = filters.bill_no;
        }
      }

      console.log("Fetching purchases with params:", params); // Debugging log
      const response = await axios.get(`${port}purchaselist`, { params });
      console.log("Response data:", response.data); // Debugging log
      setPurchases(response.data);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      message.error("Failed to fetch purchases. Please try again later.");
    }
    setLoading(false);
  };

  // Fetch all purchases on component mount
  useEffect(() => {
    console.log("PurchasesList component mounted"); // Debugging log
    fetchPurchases(); // Fetch all purchases by default
  }, []);

  // Fetch bill numbers for AutoComplete
  useEffect(() => {
    const fetchBillNumbers = async () => {
      try {
        const response = await axios.get(`${port}bills`); // Replace with your bill endpoint
        const options = response.data.map((bill) => ({
          value: bill.bill_no.toString(),
          label: `Bill No: ${bill.bill_no}`,
        }));
        setBillOptions(options);
      } catch (error) {
        console.error("Error fetching bill numbers:", error);
        message.error("Failed to fetch bill numbers. Please try again later.");
      }
    };

    fetchBillNumbers();
  }, []);

  // Fetch supplier options for AutoComplete
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(`${port}suppliers`); // Replace with your supplier endpoint
        const options = response.data.map((supplier) => ({
          value: supplier.supplier_id.toString(),
          label: `${supplier.supplier_id} - ${supplier.supplier_name}`,
        }));
        setSupplierOptions(options);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        message.error("Failed to fetch suppliers. Please try again later.");
      }
    };

    fetchSuppliers();
  }, []);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, [field]: value };
      console.log("Updated filters:", updatedFilters); // Debugging log
      return updatedFilters;
    });
  };

  // Columns for the purchases table
  const columns = [
    { title: "Purchase ID", dataIndex: "purchase_id", key: "purchase_id" },
    { title: "Item Name", dataIndex: "item_name", key: "item_name" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Unit Price", dataIndex: "unit_price", key: "unit_price" },
    { title: "Total Cost", dataIndex: "total_cost", key: "total_cost" },
    { title: "Bill Number", dataIndex: "bill_no", key: "bill_no" },
    { title: "Brand", dataIndex: "brand", key: "brand", render: (text) => text || "N/A" },
    { title: "Units", dataIndex: "units", key: "units", render: (text) => text || "N/A" },
    { title: "Domain", dataIndex: "domain", key: "domain", render: (text) => text || "N/A" },
    { title: "Category", dataIndex: "category_name", key: "category_name", render: (text) => text || "N/A" },
    { title: "Supplier ID", dataIndex: "supplier_id", key: "supplier_id" },
    {
      title: "Purchase Date",
      dataIndex: "purchase_date",
      key: "purchase_date",
      render: (date) => new Date(date).toLocaleDateString(), // Format the date
    },
    {
      title: "SED",
      dataIndex: "SED",
      key: "SED",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    { title: "SPN", dataIndex: "SPN", key: "SPN" },
    { title: "Invoice", dataIndex: "invoice", key: "invoice" }, // ADDED INVOICE
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Purchases</h2>

      {/* Filters */}
      <div style={{ marginBottom: 20, display: "flex", gap: "10px", alignItems: "center" }}>
        {/* Date Range Filter */}
        <RangePicker
          onChange={(dates) => {
            handleFilterChange("date_from", dates ? dates[0] : null);
            handleFilterChange("date_to", dates ? dates[1] : null);
          }}
          style={{ marginRight: 10 }}
        />

        {/* Supplier ID Filter */}
        <AutoComplete
          options={supplierOptions}
          style={{ width: 250 }}
          placeholder="Filter by Supplier ID"
          onChange={(value) => handleFilterChange("supplier_id", value)}
          allowClear
        >
          <Input prefix={<UserOutlined />} />
        </AutoComplete>

        {/* Bill Number Filter */}
        <AutoComplete
          options={billOptions}
          style={{ width: 250 }}
          placeholder="Filter by Bill Number"
          onChange={(value) => handleFilterChange("bill_no", value)}
          allowClear
        >
          <Input prefix={<UserOutlined />} />
        </AutoComplete>

        <Button type="primary" onClick={() => fetchPurchases(true)}>
          Apply Filters
        </Button>
      </div>

      {/* Purchases Table */}
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={purchases}
          columns={columns}
          rowKey={(record) => record.purchase_id}
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default PurchasesList;