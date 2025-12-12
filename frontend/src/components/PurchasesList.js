import React, { useEffect, useState } from "react";
import { Table, Button, message } from "antd";
import axios from "axios";
import { port } from "./porturl";

const PurchasesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${port}purchase-invoices`);
      setInvoices(res.data);
    } catch {
      message.error("Error fetching purchase invoices.");
    }
    setLoading(false);
  };

  const fetchDetails = async (purchaseId) => {
    try {
      const res = await axios.get(`${port}purchase-details/${purchaseId}`);
      setDetails((prev) => ({ ...prev, [purchaseId]: res.data }));
    } catch {
      message.error("Error fetching invoice details.");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const columns = [
    { title: "Invoice", dataIndex: "bill_number" },
    { title: "Supplier", dataIndex: "supplier_name" },
    { title: "Purchase Date", dataIndex: "purchase_date" },
    { title: "Total Amount", dataIndex: "invoice_total" },
    {
      title: "Action",
      render: (_, record) => (
        <Button type="link" onClick={() => fetchDetails(record.purchase_id)}>
          View Items
        </Button>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const invoice = details[record.purchase_id];
    if (!invoice) return "Loading...";

    return (
      <div style={{ background: "#fafafa", padding: 15 }}>
        <Table
          dataSource={invoice.items}
          pagination={false}
          rowKey="item_id"
          size="small"
          columns={[
            { title: "Item", dataIndex: "item_name" },
            { title: "Category", dataIndex: "category_name" },
            { title: "Attributes", dataIndex: "attributes" },
            { title: "Qty", dataIndex: "quantity" },
            { title: "Unit Price", dataIndex: "unit_price" },
            { title: "Total", dataIndex: "total_price" },
          ]}
        />

        <h4 style={{ marginTop: 10 }}>
          🧾 Invoice Total: <b>₹{invoice.invoiceTotal}</b>
        </h4>
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Purchase Invoices</h2>
      <Table
        rowKey="purchase_id"
        loading={loading}
        columns={columns}
        expandable={{ expandedRowRender }}
        dataSource={invoices}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default PurchasesList;
