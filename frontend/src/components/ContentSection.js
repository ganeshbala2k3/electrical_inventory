import React from "react";
import { Spin, Button } from "antd";
import { Outlet } from "react-router-dom";

const ContentSection = ({
  loading,
  showIssuedItems,
  issuedItemsData,
  selectedCategory,
  itemsData,
  handleModify,
  handleIssue,
}) => {
  return (
    <div style={{ padding: 20, flex: 1 }}>
      {loading ? (
        <Spin size="large" />
      ) : showIssuedItems ? (
        <>
          <h2>Issued Items</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>ID</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Item</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Quantity</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Issued By</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Issued To</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Issue Date</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {issuedItemsData.map((item) => (
                <tr key={item.issue_id}>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.issue_id}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.request_id}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.quantity_issued}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.issued_by}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.issued_to}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.issue_date}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.remarks || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : selectedCategory && itemsData.length > 0 ? (
        <>
          <h2>{selectedCategory} Items</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>ID</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Name</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Category Name</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Brand</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Supplier ID</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Quantity</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Units</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Unit Price</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Description</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Domain</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {itemsData.map((item) => (
                <tr key={item.id}>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.id}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.name}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.category_name}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.brand}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.supplier_id}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.quantity}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.units}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>₹{item.unit_price}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.description}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.domain || "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                    <Button
                      type="primary"
                      onClick={() => handleModify(item)}
                      style={{ marginRight: 8 }}
                    >
                      Modify
                    </Button>
                    <Button type="default" onClick={() => handleIssue(item)}>
                      Issue
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <h2>{itemsData.length === 0 ? "No items found for this category" : "Select a category to view items"}</h2>
      )}
      <Outlet />
    </div>
  );
};

export default ContentSection;