import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, message, Input, Row, Col, Space, Typography, Tag, Divider, Spin } from "antd";
import { DownloadOutlined, FilePdfOutlined, PrinterOutlined } from "@ant-design/icons";
import axios from "axios";
import { port } from "./porturl";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Title from "antd/es/skeleton/Title";

const { Text } = Typography;
const { Search } = Input;

// -----------------------
// PDF GENERATION FUNCTION
// -----------------------

// This function takes the ID of the container element you want to print
const generateInvoicePdf = (record, invoiceData) => {
    const input = document.getElementById(`invoice-content-${record.purchase_id}`);
    
    if (!input) {
        return message.error("Invoice content not ready for PDF generation.");
    }

    message.loading({ content: 'Generating high-quality invoice...', key: 'pdfGen', duration: 0 });

    html2canvas(input, { scale: 2 }) // Increase scale for better resolution
        .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' units, 'a4' format
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Handle multi-page content
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Invoice_${record.bill_number}.pdf`);
            message.success({ content: 'PDF invoice downloaded!', key: 'pdfGen', duration: 3 });
        })
        .catch(err => {
            console.error("PDF Generation Error:", err);
            message.error({ content: 'PDF generation failed.', key: 'pdfGen', duration: 3 });
        });
};


const PurchasesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
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
  const fetchDetails = useCallback(async (purchaseId) => {
    if (details[purchaseId] && details[purchaseId].items) return; 
    
    setDetails((prev) => ({ ...prev, [purchaseId]: { loading: true } }));

    try {
      const res = await axios.get(`${port}purchase-details/${purchaseId}`);
      setDetails((prev) => ({ ...prev, [purchaseId]: res.data }));
    } catch {
      message.error("Error fetching invoice details.");
      setDetails((prev) => ({ ...prev, [purchaseId]: { error: true } }));
    }
  }, [details]); 

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
      inv.bill_number?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredInvoices(filtered);
  };

  // -----------------------
  // HANDLE ROW EXPANSION (FIXED UX ISSUE)
  // -----------------------
  const handleExpand = (expanded, record) => {
    const purchaseId = record.purchase_id;

    if (expanded) {
      setExpandedRows((prev) => [...new Set([...prev, purchaseId])]);
      // 🔥 FIX: Fetch data immediately on expand
      fetchDetails(purchaseId);
    } else {
      setExpandedRows((prev) => prev.filter((id) => id !== purchaseId));
    }
  };


  // -----------------------
  // TABLE COLUMNS
  // -----------------------
  const columns = [
    { title: "Invoice", dataIndex: "bill_number" },
    { title: "Supplier", dataIndex: "supplier_name" },
    { title: "Purchase Date", dataIndex: "purchase_date" },
    { 
        title: "Total Amount (Inc. GST)", 
        dataIndex: "invoice_total",
        render: (total) => `₹${parseFloat(total).toFixed(2)}`
    },
    {
      title: "Actions", // Renamed column
      render: (_, record) => {
        const invoice = details[record.purchase_id];
        const isDataReady = invoice && invoice.items;
          
        return (
          <Space size="small">
              <Button 
                  type="primary" 
                  icon={<FilePdfOutlined />} 
                  onClick={() => generateInvoicePdf(record, invoice)}
                  size="small"
                  disabled={!isDataReady} // Disable button until data is fetched on expand
              >
                  PDF
              </Button>
          </Space>
        );
      },
    },
  ];

  // -----------------------
  // EXPANDED ROW (The content to be printed)
  // -----------------------
  const expandedRowRender = (record) => {
    const invoice = details[record.purchase_id];
    
    if (invoice && invoice.loading) return <Spin tip="Loading item details..." style={{ margin: 20 }} />;
    if (invoice && invoice.error) return <Text type="danger">Error fetching details.</Text>;
    if (!invoice || !invoice.items) return "Expand the row to view details.";

    return (
      <div 
        id={`invoice-content-${record.purchase_id}`} // 🔥 ID required for html2canvas
        style={{ background: "#ffffff", padding: 25, border: '1px solid #ddd' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Title level={4} style={{ margin: 0 }}>PURCHASE INVOICE</Title>
            <Text type="secondary">Bill Number: {record.bill_number} | Date: {record.purchase_date}</Text>
        </div>
        
        <Row gutter={16} style={{ marginBottom: 15 }}>
            <Col span={12}>
                <Text strong>Supplier:</Text> {record.supplier_name}
            </Col>
            <Col span={12}>
                <Text strong>Supplier GSTIN:</Text> {record.supplier_id}
            </Col>
        </Row>
        
        <Table
          dataSource={invoice.items}
          pagination={false}
          rowKey="item_id"
          size="small"
          columns={[
            { title: "Item Name", dataIndex: "item_name" },
            { title: "Category", dataIndex: "category_name" },
            { title: "Attributes", dataIndex: "attributes" },
            { title: "Qty", dataIndex: "quantity" },
            { 
                title: "Unit Price (Excl. GST)", 
                dataIndex: "unit_price",
                render: (price) => `₹${parseFloat(price).toFixed(2)}`
            },
            { 
                title: "Total Price (Inc. GST)", 
                dataIndex: "total_price",
                render: (total) => <b style={{ color: '#389e0d' }}>₹{parseFloat(total).toFixed(2)}</b>
            },
          ]}
        />

        <Divider style={{ margin: '15px 0' }} />
        
        <h4 style={{ marginTop: 15, textAlign: 'right', fontWeight: 'bold' }}>
          FINAL INVOICE TOTAL: <b style={{ fontSize: '1.4em', color: '#1890ff' }}>₹{parseFloat(invoice.invoiceTotal).toFixed(2)}</b>
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
          <Search
            placeholder="Search by Invoice Number"
            value={invoiceSearch}
            onChange={(e) => applyInvoiceFilter(e.target.value)}
            onSearch={applyInvoiceFilter}
            allowClear
            enterButton={<DownloadOutlined />}
          />
        </Col>
        <Col span={16}>
            <Space>
                 <Button type="default" onClick={fetchInvoices} loading={loading}>
                    Refresh List
                </Button>
                <Tag color="blue">Total Invoices: {invoices.length}</Tag>
            </Space>
        </Col>
      </Row>

      {/* ---------- TABLE ---------- */}
      <Table
        rowKey="purchase_id"
        loading={loading}
        columns={columns}
        dataSource={filteredInvoices}
        pagination={{ pageSize: 10 }}
        
        // FIX: Trigger fetch and control expansion
        expandable={{ 
            expandedRowRender,
            onExpand: handleExpand,
            expandedRowKeys: expandedRows,
        }}
      />
    </div>
  );
};

export default PurchasesList;