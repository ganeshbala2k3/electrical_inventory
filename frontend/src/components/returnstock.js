import React, { useState } from "react";
import { Form, Input, Button, DatePicker, Table, message, Card, Row, Col, Typography, Space, Divider, Spin } from "antd";
import { SearchOutlined, ShoppingCartOutlined, CheckCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import axios from "axios";
import { port } from "./porturl";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ReturnItems = () => {
  const [form] = Form.useForm();
  const [allotmentItems, setAllotmentItems] = useState([]); 
  const [returnCart, setReturnCart] = useState([]);      
  const [loading, setLoading] = useState(false);
  
  const [allotmentInfo, setAllotmentInfo] = useState({
    issued_to: "",
    issue_date: ""
  });
  
  const [allotmentId, setAllotmentId] = useState("");

  // Function to fetch issued items for a specific Allotment ID
  const fetchIssuedItems = async (id) => {
    if (!id) {
        return message.error("Please enter an Allotment ID to fetch items.");
    }

    try {
        setLoading(true);
        setAllotmentItems([]);
        setReturnCart([]);
        setAllotmentInfo({ issued_to: "", issue_date: "" });

        const res = await axios.get(`${port}issued-items-by-allotment/${id}`);
        
        const { issued_to, issue_date, items } = res.data;

        if (!items || items.length === 0) {
            message.warning(`No outstanding items found for Allotment ID: ${id}`);
        }
        
        setAllotmentInfo({ 
            issued_to: issued_to || 'N/A', 
            issue_date: issue_date ? dayjs(issue_date).format("DD-MM-YYYY") : 'N/A' 
        });
        
        setAllotmentItems(items.map(item => ({
            ...item,
            // Use the actual remaining quantity if provided, otherwise use the original issued quantity
            max_return_qty: item.remaining_qty_to_return !== undefined ? item.remaining_qty_to_return : item.quantity, 
            return_qty: item.remaining_qty_to_return !== undefined ? item.remaining_qty_to_return : item.quantity, 
            key: item.issued_item_id 
        })));
        
    } catch (error) {
        message.error("Failed to fetch issued items. Check the Allotment ID or network connection.");
        setAllotmentInfo({}); // Reset info on failure
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  // Handles updating the quantity inside the table item's state
  const handleQtyChange = (itemId, value) => {
    const qty = parseInt(value, 10) || 0;
    setAllotmentItems(prevItems =>
        prevItems.map(item =>
            item.issued_item_id === itemId ? { ...item, return_qty: qty } : item
        )
    );
  };

  // Adds/Updates the selected item to the final return cart
  const handleAddToReturnCart = (item) => {
    const returnQty = item.return_qty;
    const qty = parseInt(returnQty, 10);
    
    if (qty <= 0) return message.error("Return quantity must be greater than zero.");
    if (qty > item.max_return_qty) return message.error(`Cannot return more than the remaining quantity (${item.max_return_qty}).`);

    // Ensure the item label is clean for the cart
    const itemLabel = item.item_label || `Item ID: ${item.item_id}`; 

    // Check if item is already in cart to update quantity
    const existingIndex = returnCart.findIndex(i => i.issued_item_id === item.issued_item_id);

    if (existingIndex > -1) {
        // Update existing item
        const newCart = [...returnCart];
        newCart[existingIndex].quantity_returned = qty;
        setReturnCart(newCart);
    } else {
        // Add new item to cart
        setReturnCart(prev => [
            ...prev,
            {
                issued_item_id: item.issued_item_id, 
                item_id: item.item_id,
                item_label: itemLabel,
                quantity_returned: qty,
                return_date: dayjs().format("YYYY-MM-DD")
            }
        ]);
    }
    message.success(`${qty} units of ${itemLabel} added to return cart.`);
  };

  const handleRemoveFromCart = (issuedItemId) => {
      setReturnCart(returnCart.filter(i => i.issued_item_id !== issuedItemId));
  };


  const submitReturn = async (values) => {
    if (!returnCart.length) return message.error("Return cart is empty.");

    try {
        setLoading(true);
        
        const payload = {
            allotment_id: allotmentId, // Use the state ID
            returned_by: allotmentInfo.issued_to,
            return_date: values.return_date.format("YYYY-MM-DD"),
            returned_items: returnCart.map(item => ({
                issued_item_id: item.issued_item_id,
                item_id: item.item_id,
                quantity: item.quantity_returned,
            }))
        };
        
        await axios.post(`${port}return-items`, payload);

        message.success("Items restocked successfully!");
        // Reset all states and forms
        setReturnCart([]);
        setAllotmentItems([]);
        setAllotmentInfo({});
        setAllotmentId("");
        form.resetFields();
    } catch (error) {
        message.error("Return failed. Ensure backend logic is complete.");
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  // Columns for displaying items fetched by Allotment ID
  const issuedItemsColumns = [
    { title: "Item Details", dataIndex: "item_label", key: "item_label" },
    { title: "Issued Qty", dataIndex: "quantity", key: "issued_qty" },
    { title: "Remaining Qty", dataIndex: "max_return_qty", key: "max_return_qty", render: (qty) => <Text strong>{qty}</Text> },
    {
        title: "Return Qty",
        key: "return_qty_input",
        width: 150,
        render: (record) => (
            <Input
                type="number"
                min={0}
                max={record.max_return_qty}
                value={record.return_qty} // Use value to ensure controlled input
                onChange={(e) => handleQtyChange(record.issued_item_id, e.target.value)}
                style={{ width: 100 }}
            />
        )
    },
    {
        title: "Action",
        key: "action",
        width: 120,
        render: (record) => (
            <Button
                type="dashed"
                icon={<RollbackOutlined />}
                onClick={() => handleAddToReturnCart(record)}
                disabled={record.return_qty <= 0 || record.return_qty > record.max_return_qty}
            >
                Add
            </Button>
        )
    }
  ];

  // Columns for displaying items in the Return Cart
  const returnCartColumns = [
    { title: "Item", dataIndex: "item_label", key: "cart_item" },
    { title: "Quantity Returning", dataIndex: "quantity_returned", key: "cart_qty", render: (qty) => <Text strong type="success">{qty}</Text> },
    { title: "Return Date", dataIndex: "return_date", key: "cart_date" },
    {
        title: "Remove",
        key: "cart_remove",
        render: (_, r) => (
            <Button danger size="small" onClick={() => handleRemoveFromCart(r.issued_item_id)}>
                Remove
            </Button>
        )
    }
  ];

  const hasFetched = allotmentItems.length > 0;
  const isCartReady = returnCart.length > 0;

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}><RollbackOutlined style={{ color: '#faad14' }} /> Stock Return / Restock</Title>
      <Divider />

      <Form
        form={form}
        layout="vertical"
        onFinish={submitReturn}
        initialValues={{ return_date: dayjs() }}
      >
          {/* 1. Allotment ID Search Card */}
          <Card 
            title={<Space><SearchOutlined /> Step 1: Find Issued Items</Space>}
            style={{ marginBottom: 20 }}
            headStyle={{ backgroundColor: '#e6f7ff' }}
          >
              <Row gutter={16} align="bottom">
                  <Col span={6}>
                      <Form.Item name="allotment_id" label="Enter Allotment ID" rules={[{ required: true, message: "Required" }]}>
                          <Input
                              placeholder="e.g., ALLOT-2025-001"
                              value={allotmentId}
                              onChange={(e) => setAllotmentId(e.target.value)}
                          />
                      </Form.Item>
                  </Col>
                  <Col span={4}>
                      <Button 
                          type="primary" 
                          icon={<SearchOutlined />}
                          onClick={() => fetchIssuedItems(allotmentId)}
                          loading={loading}
                          style={{ marginBottom: 24 }} // Align with input
                      >
                          Fetch Items
                      </Button>
                  </Col>
                  <Col span={14}>
                      {hasFetched && allotmentInfo.issued_to && (
                          <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', padding: 8, borderRadius: 4 }}>
                              <Text strong style={{ color: '#389e0d' }}>Issued To:</Text> {allotmentInfo.issued_to} | 
                              <Text strong style={{ color: '#389e0d', marginLeft: 15 }}>Original Issue Date:</Text> {allotmentInfo.issue_date}
                          </div>
                      )}
                  </Col>
              </Row>
          </Card>
          
          {/* 2. List of Issued Items for Return Selection */}
          <Card 
            title={<Space><ShoppingCartOutlined /> Step 2: Select Quantities for Return</Space>}
            style={{ marginBottom: 20 }}
            headStyle={{ backgroundColor: hasFetched ? '#fffbe6' : '#f0f0f0' }}
            bodyStyle={{ opacity: hasFetched ? 1 : 0.5 }}
          >
            {hasFetched ? (
                <Table
                    dataSource={allotmentItems}
                    columns={issuedItemsColumns}
                    rowKey="issued_item_id"
                    pagination={false}
                    size="middle"
                />
            ) : (
                <div style={{ textAlign: 'center', padding: 30 }}><Text type="secondary">Fetch an Allotment ID above to see items here.</Text></div>
            )}
          </Card>

          {/* 3. Return Cart and Submit */}
          <Card
            title={<Space><CheckCircleOutlined /> Step 3: Finalize Return Cart</Space>}
            headStyle={{ backgroundColor: isCartReady ? '#f0f9ff' : '#f0f0f0' }}
            bodyStyle={{ opacity: isCartReady ? 1 : 0.5 }}
          >
              <Row gutter={24}>
                  <Col span={18}>
                      <Table
                          dataSource={returnCart}
                          columns={returnCartColumns}
                          rowKey="issued_item_id"
                          pagination={false}
                          style={{ marginBottom: 20 }}
                          locale={{ emptyText: 'No items added to the return cart.' }}
                      />
                  </Col>
                  <Col span={6}>
                      <Form.Item name="return_date" label="Return Date" rules={[{ required: true }]}>
                          <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
                      </Form.Item>

                      <Button 
                          type="primary" 
                          htmlType="submit" 
                          icon={<RollbackOutlined />}
                          disabled={!isCartReady} 
                          loading={loading}
                          style={{ width: '100%', height: 40 }}
                      >
                          Finalize Return and Restock ({returnCart.length} Items)
                      </Button>
                  </Col>
              </Row>
          </Card>
      </Form>
    </div>
  );
};

export default ReturnItems;