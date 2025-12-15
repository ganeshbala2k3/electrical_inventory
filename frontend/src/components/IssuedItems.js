import React, { useEffect, useState } from "react";
import { Table, message, DatePicker, Select, Row, Col, Button } from "antd";
import axios from "axios";
import moment from "moment";
import { port } from "./porturl";

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function ViewIssuedItems() {
  const [issuedItems, setIssuedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState([]);
  const [issuedTo, setIssuedTo] = useState(null);
  const [issuedBy, setIssuedBy] = useState(null);

  useEffect(() => {
    fetchIssuedItems();
  }, []);

  const fetchIssuedItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${port}issued-items`);
      setIssuedItems(res.data);
      setFilteredItems(res.data);
    } catch {
      message.error("Failed to load issued items");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- APPLY FILTERS ----------------
  const applyFilters = () => {
    let data = [...issuedItems];

    // ✅ DATE FILTER (STRING SAFE)
    if (dateRange.length === 2) {
      const start = dateRange[0].format("YYYY-MM-DD");
      const end = dateRange[1].format("YYYY-MM-DD");

      data = data.filter(
        (item) => item.issue_date >= start && item.issue_date <= end
      );
    }

    // ✅ ISSUED TO
    if (issuedTo) {
      data = data.filter((i) => i.issued_to === issuedTo);
    }

    // ✅ ISSUED BY
    if (issuedBy) {
      data = data.filter((i) => i.issued_by === issuedBy);
    }

    setFilteredItems(data);
  };

  const resetFilters = () => {
    setDateRange([]);
    setIssuedTo(null);
    setIssuedBy(null);
    setFilteredItems(issuedItems);
  };

  const columns = [
    {
      title: "Issue Date",
      dataIndex: "issue_date",
      render: (d) => moment(d, "YYYY-MM-DD").format("DD-MM-YYYY"),
    },
    { title: "Item Details", dataIndex: "attributes" },
    { title: "Quantity", dataIndex: "quantity" },
    { title: "Issued To", dataIndex: "issued_to" },
    { title: "Issued By", dataIndex: "issued_by" },
    { title: "Allotment ID", dataIndex: "allotment_id" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>📄 Issued Items</h2>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <RangePicker
            format="DD-MM-YYYY"
            value={dateRange}
            onChange={(dates) => setDateRange(dates || [])}
            style={{ width: "100%" }}
          />
        </Col>

        <Col span={5}>
          <Select
            allowClear
            placeholder="Issued To"
            value={issuedTo}
            onChange={setIssuedTo}
            style={{ width: "100%" }}
          >
            {[...new Set(issuedItems.map(i => i.issued_to))].map(v => (
              <Option key={v} value={v}>{v}</Option>
            ))}
          </Select>
        </Col>

        <Col span={5}>
          <Select
            allowClear
            placeholder="Issued By"
            value={issuedBy}
            onChange={setIssuedBy}
            style={{ width: "100%" }}
          >
            {[...new Set(issuedItems.map(i => i.issued_by))].map(v => (
              <Option key={v} value={v}>{v}</Option>
            ))}
          </Select>
        </Col>

        <Col span={4}>
          <Button type="primary" onClick={applyFilters} block>
            Apply
          </Button>
        </Col>

        <Col span={4}>
          <Button danger onClick={resetFilters} block>
            Reset
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
