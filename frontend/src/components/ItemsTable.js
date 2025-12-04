import React, { useState } from "react";
import { Input, Button, Modal, message } from "antd";
import axios from "axios";
import moment from "moment";
import { port } from "./porturl"; // Import the port from the porturl file  

const ItemsTable = ({ itemsData, setItemsData }) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // Track modal visibility
  const [modalData, setModalData] = useState({}); // Track data for issuing an item
  const [issueQuantity, setIssueQuantity] = useState(""); // Track the quantity to be issued
  const [issuedTo, setIssuedTo] = useState(""); // Track the person to whom the item is issued
  const [issuedBy, setIssuedBy] = useState(localStorage.getItem("username") || "Unknown User"); // Track the person issuing the item
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]); // Track the issue date
  const [editingRow, setEditingRow] = useState(null); // Track the row being edited
  const [updatedRow, setUpdatedRow] = useState({}); // Track the updated row data

  const fetchItems = async (category) => {
    try {
      console.log("Selected category:", category); // Debugging log
      const response = await axios.get(`${port}items`);
      console.log("Fetched items:", response.data); // Debugging log
      // Filter items based on the selected category (case-insensitive)
      const filteredItems = response.data.filter(
        (item) => item.category_name === category
      );
      setItemsData(filteredItems);
      console.log("Filtered items:", filteredItems); // Debugging log
    } catch (error) {
      console.error("Error fetching items:", error);
      message.error("Failed to fetch items. Please try again later.");
    }
  };
  
  // Handle Issue button click
  const handleIssue = (item) => {
    setModalData(item); // Set the item data for the modal
    setIssueQuantity(""); // Reset the issue quantity
    setIssuedTo(""); // Reset the issuedTo field
    setIssuedBy(localStorage.getItem("username") || "Unknown User"); // Reset the issuedBy field
    setIsModalVisible(true); // Show the modal
  };

  // Handle Modal OK button click
  const handleModalOk = async () => {
    if (!issueQuantity || issueQuantity <= 0) {
      message.error("Please enter a valid quantity to issue.");
      return;
    }
  
    if (issueQuantity > modalData.quantity) {
      message.error("Issued quantity cannot exceed available quantity.");
      return;
    }
  
    const payload = {
      item_id: modalData.id,
      item: modalData.name,
      quantity: issueQuantity,
      issued_by: issuedBy,
      issue_date: issueDate,
      issued_to: issuedTo,
      brand: modalData.brand,
      units: modalData.units,
      unit_price: modalData.unit_price,
      domain: modalData.domain,
      category_name: modalData.category_name,
    };
  
    try {
      const response = await axios.post(`${port}issue`, payload);
  
      if (response.data.success) {
        message.success("Item issued successfully!");
        fetchItems(); // Refresh the items table
        setIsModalVisible(false); // Close the modal
      } else {
        message.error(response.data.message || "Failed to issue item. Please try again.");
      }
    } catch (error) {
      console.error("Error issuing item:", error);
      message.error("Failed to issue item. Please try again later.");
    }
  };

  // Handle Modal Cancel button click
  const handleModalCancel = () => {
    setIsModalVisible(false); // Close the modal
  };

  // Handle Modify button click
  const handleModify = (item) => {
    setEditingRow(item.id); // Set the row being edited
    setUpdatedRow(item); // Set the initial data for the row being edited
  };

  // Handle Save button click
  const handleSave = async () => {
    try {
      // Send the updated row data to the backend
      const response = await axios.put(`${port}${editingRow}`, updatedRow);
      if (response.data.success) {
        message.success("Item updated successfully!");
        // Update the itemsData state with the modified row
        setItemsData((prev) =>
          prev.map((item) => (item.id === editingRow ? { ...item, ...updatedRow } : item))
        );
        setEditingRow(null); // Exit editing mode
        setUpdatedRow({});
      } else {
        message.error("Failed to update item. Please try again.");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      message.error("Failed to update item. Please try again later.");
    }
  };

  // Handle Cancel button click for editing
  const handleCancelEdit = () => {
    setEditingRow(null); // Exit editing mode without saving
    setUpdatedRow({});
  };

  return (
    <div>
      <h2>Items</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>ID</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Name</th>
            
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Brand</th>
           
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Quantity</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Units</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Expiry Date</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Description</th>
            
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {itemsData
          .filter((item) => item.quantity >0)
          .map((item) => (
            <tr
              key={item.id}
              style={{
                backgroundColor: item.quantity < 5 ? "#ffcccc" : "transparent", // Red background for low quantity
              }}
            >
              {editingRow === item.id ? (
                <>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.id}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <Input
                      value={updatedRow.name}
                      onChange={(e) => setUpdatedRow({ ...updatedRow, name: e.target.value })}
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <Input
                      value={updatedRow.category_name}
                      onChange={(e) =>
                        setUpdatedRow({ ...updatedRow, category_name: e.target.value })
                      }
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <Input
                      value={updatedRow.brand}
                      onChange={(e) => setUpdatedRow({ ...updatedRow, brand: e.target.value })}
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <Input
                      value={updatedRow.supplier_id}
                      onChange={(e) =>
                        setUpdatedRow({ ...updatedRow, supplier_id: e.target.value })
                      }
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <Input
                      value={updatedRow.quantity}
                      onChange={(e) =>
                        setUpdatedRow({ ...updatedRow, quantity: e.target.value })
                      }
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <Input
                      value={updatedRow.units}
                      onChange={(e) => setUpdatedRow({ ...updatedRow, units: e.target.value })}
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <Input
                      value={updatedRow.unit_price}
                      onChange={(e) =>
                        setUpdatedRow({ ...updatedRow, unit_price: e.target.value })
                      }
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    ₹{(updatedRow.quantity * updatedRow.unit_price).toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <Input
                      value={updatedRow.description}
                      onChange={(e) =>
                        setUpdatedRow({ ...updatedRow, description: e.target.value })
                      }
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <Input
                      value={updatedRow.domain}
                      onChange={(e) => setUpdatedRow({ ...updatedRow, domain: e.target.value })}
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                    <Button type="primary" onClick={handleSave}>
                      Save
                    </Button>
                    <Button type="default" onClick={handleCancelEdit} style={{ marginLeft: 8 }}>
                      Cancel
                    </Button>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.id}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.name}</td>
                  
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.brand}</td>
                  
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.quantity}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.units}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {item.expiry_date ? moment(item.expiry_date).format("DD-MM-YYYY ") : "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.description}</td>
                  
                  <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                      <Button
                        type="primary"
                        onClick={() => handleModify(item)} // Trigger handleModify with the item
                      >
                        Modify
                      </Button>
                      <Button
                        type="default"
                        onClick={() => handleIssue(item)} // Trigger handleIssue with the item
                      >
                        Issue
                      </Button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Issuing Items */}
      <Modal
        title="Issue Item"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Issue"
        cancelText="Cancel"
      >
        <p>
          <strong>Item:</strong> {modalData.name}
        </p>
        <p>
          <strong>Available Quantity:</strong> {modalData.quantity}
        </p>
        <div style={{ marginBottom: "10px" }}>
          <strong>Quantity to Issue:</strong>
          <Input
            placeholder="Enter quantity to issue"
            value={issueQuantity}
            onChange={(e) => setIssueQuantity(Number(e.target.value))}
            type="number"
            style={{ marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <strong>Issued To:</strong>
          <Input
            placeholder="Enter recipient name"
            value={issuedTo}
            onChange={(e) => setIssuedTo(e.target.value)}
            style={{ marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <strong>Issued By:</strong>
          <Input
            placeholder="Enter issuer name"
            value={issuedBy}
            onChange={(e) => setIssuedBy(e.target.value)}
            style={{ marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <strong>Issue Date:</strong>
          <Input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            style={{ marginTop: "5px" }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ItemsTable;