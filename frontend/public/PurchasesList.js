import React, { useState, useEffect } from "react";
import { Table, DatePicker, Input, Button, Spin, message } from "antd";
import axios from "axios";

const { RangePicker } = DatePicker;

const PurchasesList = () => {
  const [purchases, setPurchases] = useState([]); // Store purchases data
  const [loading, setLoading] = useState(false); // Loading state
  const [filters, setFilters] = useState({ purchase_date: null, supplier_id: "" }); // Filters

  // Fetch purchases from the backend
  const fetchPurchases = async (applyFilters = false) => {
    setLoading(true);
    try {
      const params = {};
      if (applyFilters) {
        if (filters.purchase_date) {
          params.purchase_date = filters.purchase_date.format("YYYY-MM-DD");
        }
        if (filters.supplier_id) {
          params.supplier_id = filters.supplier_id;
        }
      }

      const response = await axios.get("http://localhost:5000/purchases", { params });
      setPurchases(response.data);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      message.error("Failed to fetch purchases. Please try again later.");
    }
    setLoading(false);
  };

  // Fetch all purchases on component mount
  useEffect(() => {
    fetchPurchases();
  }, []);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Handle filter submission
  const handleFilterSubmit = () => {
    fetchPurchases(true); // Apply filters
  };

  // Columns for the purchases table
  const columns = [
    { title: "Purchase ID", dataIndex: "purchase_id", key: "purchase_id" },
    { title: "Item Name", dataIndex: "item_name", key: "item_name" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Unit Price", dataIndex: "unit_price", key: "unit_price" },
    { title: "Total Cost", dataIndex: "total_cost", key: "total_cost" },
    { title: "Bill Number", dataIndex: "bill_no", key: "bill_no" },
    { title: "Supplier ID", dataIndex: "supplier_id", key: "supplier_id" },
    { title: "Purchase Date", dataIndex: "purchase_date", key: "purchase_date" },
    {
      title: "Invoice",
      key: "invoice",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            const blob = new Blob([record.invoice], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
          }}
        >
          View Invoice
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Purchases</h2>

      {/* Filters */}
      <div style={{ marginBottom: 20 }}>
        <RangePicker
          onChange={(dates) => handleFilterChange("purchase_date", dates ? dates[0] : null)}
          style={{ marginRight: 10 }}
        />
        <Input
          placeholder="Enter Supplier ID"
          onChange={(e) => handleFilterChange("supplier_id", e.target.value)}
          style={{ width: 200, marginRight: 10 }}
        />
        <Button type="primary" onClick={handleFilterSubmit}>
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