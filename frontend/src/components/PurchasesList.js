import React, { useEffect, useState } from "react";
import { Table, Button, message, Input, Row, Col } from "antd";
import axios from "axios";
import { port } from "./porturl";

const PurchasesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");

  // -----------------------
  // FETCH INVOICES
  // -----------------------
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${port}purchase-invoices`);
      setInvoices(res.data);
      setFilteredInvoices(res.data);
    } catch {
      message.error("Error fetching purchase invoices.");
    }
    setLoading(false);
  };

  // -----------------------
  // FETCH INVOICE DETAILS
  // -----------------------
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

  // -----------------------
  // APPLY INVOICE FILTER
  // -----------------------
  const applyInvoiceFilter = (value) => {
    setInvoiceSearch(value);

    if (!value) {
      setFilteredInvoices(invoices);
      return;
    }

    const filtered = invoices.filter((inv) =>
      inv.bill_number
        ?.toLowerCase()
        .includes(value.toLowerCase())
    );

    setFilteredInvoices(filtered);
  };

  // -----------------------
  // TABLE COLUMNS
  // -----------------------
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

  // -----------------------
  // EXPANDED ROW
  // -----------------------
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

      {/* ---------- FILTER SECTION ---------- */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Search by Invoice Number"
            value={invoiceSearch}
            onChange={(e) => applyInvoiceFilter(e.target.value)}
            allowClear
          />
        </Col>
      </Row>

      {/* ---------- TABLE ---------- */}
      <Table
        rowKey="purchase_id"
        loading={loading}
        columns={columns}
        expandable={{ expandedRowRender }}
        dataSource={filteredInvoices}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default PurchasesList;
