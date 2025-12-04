import React, { useEffect, useState } from "react";
import { Table, Spin, message } from "antd";
import axios from "axios";
import moment from "moment";
import { port } from "./porturl";

const IssuedItemsTable = () => {
  const [issuedItemsData, setIssuedItemsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch issued items data
  const fetchIssuedItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${port}issued_items`);
      console.log("Issued Items Data:", response.data); // Log the data
      setIssuedItemsData(response.data);
    } catch (error) {
      console.error("Error fetching issued items:", error);
      message.error("Failed to fetch issued items. Please try again later.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIssuedItems(); // Fetch issued items when the component mounts
  }, []);

  // Columns for the issued items table
  const issuedItemsColumns = [
    {
      title: "Issue ID",
      dataIndex: "issue_id",
      key: "issue_id",
    },
    {
      title: "Item",
      dataIndex: "item",
      key: "item",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Issued By",
      dataIndex: "issued_by",
      key: "issued_by",
    },
    {
      title: "Issue Date",
      dataIndex: "issue_date",
      key: "issue_date",
      render: (date) => moment(date).format('DD-MM-YYYY'), // Format the date
    },
    {
      title: "Issued To",
      dataIndex: "issued_to",
      key: "issued_to",
    },
    {
      title: "Item ID",
      dataIndex: "item_id",
      key: "item_id",
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "Units",
      dataIndex: "units",
      key: "units",
    },
    {
      title: "Unit Price",
      dataIndex: "unit_price",
      key: "unit_price",
      render: (text) => `₹${text}`, // Format as currency
    },
    {
      title: "Domain",
      dataIndex: "domain",
      key: "domain",
    },
    {
      title: "Category Name",
      dataIndex: "category_name",
      key: "category_name",
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={issuedItemsData}
          columns={issuedItemsColumns}
          rowKey={(record) => record.issue_id} // Assuming `issue_id` is the unique key
        />
      )}
    </div>
  );
};

export default IssuedItemsTable;