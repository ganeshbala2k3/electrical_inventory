import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import axios from "axios";
import { port } from "./porturl";
import dayjs from "dayjs";


export default function ViewIssuedItems() {
  const [issuedItems, setIssuedItems] = useState([]);
  const [loading, setLoading] = useState(false);



  // -----------------------
  // LOAD ISSUED ITEMS
  // -----------------------
  useEffect(() => {
    fetchIssuedItems();
  }, []);

  const fetchIssuedItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${port}issued-items`);
      setIssuedItems(res.data);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load issued items");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // TABLE COLUMNS
  // -----------------------
  const columns = [
    { 
      title: "Issue Date", 
      dataIndex: "issue_date", 
      key: "issue_date",
      render: d => dayjs(d).format("DD-MM-YYYY")
    },
        { title: "Item Details", dataIndex: "attributes", key: "attributes" },

    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Issued To", dataIndex: "issued_to", key: "issued_to" },
    { title: "Issued By", dataIndex: "issued_by", key: "issued_by" },
    { title: "Allotment ID", dataIndex: "allotment_id", key: "allotment_id" },

    
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>📄 Issued Items</h2>
      <Table
        columns={columns}
        dataSource={issuedItems}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
