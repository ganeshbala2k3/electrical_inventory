import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, message, Input, Row, Col, Space, Typography, Tag, Spin, DatePicker, Select } from "antd";
import { FilePdfOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { port } from "./porturl";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// -----------------------
// REVISED PDF GENERATION FUNCTION
// -----------------------

const generateIssuedInvoicePdf = (record) => {
    // Get the element ID used in expandedRowRender
    const input = document.getElementById(`issued-invoice-content-${record.allotment_id}-${record.issue_date}`);
    
    if (!input) {
        return message.error("Invoice content not found. Please expand the row first.");
    }

    message.loading({ content: 'Preparing document for PDF...', key: 'pdfGen', duration: 0 });

    // Use a slight delay to ensure all DOM updates are complete
    setTimeout(() => {
        
        html2canvas(input, { 
            scale: 2, // Higher scale for quality
            useCORS: true, // Needed if you had external images (good practice)
            logging: false,
        })
        .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgHeight = canvas.height * pdfWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Handle multi-page content
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`Issue_Report_${record.allotment_id}.pdf`);
            message.success({ content: 'Issue Report PDF downloaded!', key: 'pdfGen', duration: 3 });
        })
        .catch(err => {
            console.error("PDF Generation Error:", err);
            message.error({ content: 'PDF generation failed. Check console for details.', key: 'pdfGen', duration: 5 });
        });
    }, 100); // 100ms delay
};


const IssuedItemsList = () => {
  const [issuedItems, setIssuedItems] = useState([]);
  const [filteredIssuedItems, setFilteredIssuedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [details, setDetails] = useState({});
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [filterIssuedTo, setFilterIssuedTo] = useState(null);
  
  // Data for Select options (derived from fetched data)
  const [recipientOptions, setRecipientOptions] = useState([]);

  // -----------------------
  // FETCH ALL ISSUED ITEMS (Summary)
  // -----------------------
  const fetchIssuedItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${port}issued-items`); 
      
      const groupedData = groupIssuedItems(res.data);
      
      setIssuedItems(groupedData);
      setFilteredIssuedItems(groupedData);

      const recipients = [...new Set(res.data.map(i => i.issued_to).filter(Boolean))];
      setRecipientOptions(recipients);

    } catch (error) {
      console.error(error);
      message.error("Failed to load issued items list.");
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to group flat issue records into single transaction rows
  const groupIssuedItems = (data) => {
      const groups = {};
      data.forEach(item => {
          const key = item.allotment_id;
          if (!groups[key]) {
              groups[key] = {
                  key: key,
                  allotment_id: key,
                  issue_date: item.issue_date,
                  issued_to: item.issued_to,
                  department: item.department,
                  issued_by: item.issued_by,
                  total_items: 0,
                  total_quantity: 0,
                  items: [] 
              };
          }
          groups[key].items.push(item);
          groups[key].total_items += 1;
          groups[key].total_quantity += item.quantity;
      });
      return Object.values(groups).sort((a, b) => moment(b.issue_date).diff(moment(a.issue_date)));
  };

  // -----------------------
  // FILTERING LOGIC
  // -----------------------
  useEffect(() => {
    let data = issuedItems;

    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        data = data.filter(item => 
            item.allotment_id?.toLowerCase().includes(lowerSearch) ||
            item.issued_to?.toLowerCase().includes(lowerSearch) ||
            item.issued_by?.toLowerCase().includes(lowerSearch) ||
            item.department?.toLowerCase().includes(lowerSearch)
        );
    }

    if (dateRange && dateRange.length === 2) {
        const start = dateRange[0].format("YYYY-MM-DD");
        const end = dateRange[1].format("YYYY-MM-DD");
        data = data.filter(item => item.issue_date >= start && item.issue_date <= end);
    }

    if (filterIssuedTo) {
        data = data.filter(item => item.issued_to === filterIssuedTo);
    }

    setFilteredIssuedItems(data);
  }, [issuedItems, searchTerm, dateRange, filterIssuedTo]);
  
  // Initial fetch
  useEffect(() => {
    fetchIssuedItems();
  }, []);
  
  // -----------------------
  // HANDLE ROW EXPANSION (FIXED UX ISSUE)
  // -----------------------
  const handleExpand = (expanded, record) => {
    const allotmentId = record.allotment_id;

    if (expanded) {
      setExpandedRows((prev) => [...new Set([...prev, allotmentId])]);
      // 🔥 Set the details cache using the items already fetched (No second API call needed)
      setDetails((prev) => ({ ...prev, [allotmentId]: { items: record.items } }));
    } else {
      setExpandedRows((prev) => prev.filter((id) => id !== allotmentId));
    }
  };

  // -----------------------
  // TABLE COLUMNS
  // -----------------------
  const columns = [
    { 
        title: "Allotment ID", 
        dataIndex: "allotment_id",
        sorter: (a, b) => a.allotment_id.localeCompare(b.allotment_id)
    },
    { 
        title: "Date", 
        dataIndex: "issue_date",
        render: (d) => moment(d).format("DD-MM-YYYY"),
        sorter: (a, b) => moment(a.issue_date).diff(moment(b.issue_date)),
    },
    { title: "Issued To", dataIndex: "issued_to" },
    { title: "Department", dataIndex: "department" },
    { title: "Issued By", dataIndex: "issued_by" },
    { title: "Total Qty", dataIndex: "total_quantity" },
    {
      title: "Action",
      render: (_, record) => {
        // Data is ready if the row is expanded and details are cached
        const isDataReady = expandedRows.includes(record.allotment_id);
          
        return (
          <Button 
              type="primary" 
              icon={<FilePdfOutlined />} 
              onClick={() => generateIssuedInvoicePdf(record)}
              size="small"
              disabled={!isDataReady} // Enable only when expanded/data is ready
          >
              Download PDF
          </Button>
        );
      },
    },
  ];

  // -----------------------
  // EXPANDED ROW RENDER (Invoice Content)
  // -----------------------
  const expandedRowRender = (record) => {
    const issuedData = details[record.allotment_id];
    
    if (!issuedData || !issuedData.items) return <Spin tip="Preparing content..." style={{ margin: 20 }} />;

    const totalQty = issuedData.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div 
        // Ensure this ID is unique and matches the one used in generateIssuedInvoicePdf
        id={`issued-invoice-content-${record.allotment_id}-${record.issue_date}`} 
        style={{ background: "#ffffff", padding: 25, border: '1px solid #ddd' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Title level={4} style={{ margin: 0, color: '#096dd9' }}>STOCK ISSUANCE REPORT</Title>
            <Text type="secondary">Allotment ID: {record.allotment_id} | Date: {moment(record.issue_date).format("DD-MM-YYYY")}</Text>
        </div>
        
        <Row gutter={16} style={{ marginBottom: 15 }}>
            <Col span={8}><Text strong>Issued To:</Text> {record.issued_to}</Col>
            <Col span={8}><Text strong>Department:</Text> {record.department}</Col>
            <Col span={8}><Text strong>Issued By:</Text> {record.issued_by}</Col>
        </Row>
        
        <Table
          dataSource={issuedData.items}
          pagination={false}
          rowKey="id"
          size="small"
          columns={[
            { title: "Item ID", dataIndex: "inventory_item_id" },
            { 
                title: "Item Details", 
                dataIndex: "attributes", 
                render: (text) => <Text code>{text}</Text>
            },
            { 
                title: "Quantity Issued", 
                dataIndex: "quantity",
                render: (qty) => <b style={{ color: '#389e0d' }}>{qty}</b>
            },
            { 
                title: "Qty Returned", 
                dataIndex: "quantity_returned",
                render: (qty) => qty > 0 ? <Tag color="warning">{qty}</Tag> : qty
            },
            { 
                title: "Allotment Ref", 
                dataIndex: "allotment_id", 
            },
          ]}
        />

        <h4 style={{ marginTop: 15, textAlign: 'right', fontWeight: 'bold' }}>
          TOTAL QUANTITY ISSUED: <b style={{ fontSize: '1.4em', color: '#1890ff' }}>{totalQty}</b>
        </h4>
        
      </div>
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateRange([]);
    setFilterIssuedTo(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📤 Issued Items Transactions</h2>

      {/* ---------- FILTER SECTION ---------- */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input.Search
            placeholder="Search Allotment ID, User, or Dept"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={setSearchTerm}
            allowClear
            enterButton={<SearchOutlined />}
          />
        </Col>
        
        <Col span={6}>
          <RangePicker
            format="DD-MM-YYYY"
            value={dateRange}
            onChange={setDateRange}
            style={{ width: "100%" }}
          />
        </Col>

        <Col span={4}>
          <Select
            allowClear
            placeholder="Filter by Issued To"
            value={filterIssuedTo}
            onChange={setFilterIssuedTo}
            style={{ width: "100%" }}
          >
            {recipientOptions.map(name => (
              <Option key={name} value={name}>{name}</Option>
            ))}
          </Select>
        </Col>

        <Col span={8}>
            <Space>
                 <Button type="primary" onClick={resetFilters}>
                    Reset Filters
                </Button>
                 <Button type="default" onClick={fetchIssuedItems} loading={loading}>
                    Refresh List
                </Button>
                <Tag color="blue">Total Transactions: {issuedItems.length}</Tag>
            </Space>
        </Col>
      </Row>

      {/* ---------- TABLE ---------- */}
      <Table
        rowKey="allotment_id"
        loading={loading}
        columns={columns}
        dataSource={filteredIssuedItems}
        pagination={{ pageSize: 10 }}
        
        expandable={{ 
            expandedRowRender,
            onExpand: handleExpand,
            expandedRowKeys: expandedRows,
        }}
      />
    </div>
  );
};

export default IssuedItemsList;