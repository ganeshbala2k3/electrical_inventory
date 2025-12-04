import React, { useState, useEffect } from "react";
import { Menu, Spin, message } from "antd";
import {
  LogoutOutlined,
  DeliveredProcedureOutlined,
  AppstoreOutlined,
  UserOutlined, // Import UserOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ItemsTable from "../ItemsTable";
import IssuedItemsTable from "../IssuedItems";
import Profile from "../Profile"; // Import Profile component
import { port } from "../porturl";

const IssuerDash = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [itemsData, setItemsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("welcome"); // Track active page

  useEffect(() => {
    // No need to fetch items on initial load, just display welcome message
  }, []);

  const fetchItems = async (category) => {
    setLoading(true);
    try {
      const response = await axios.get(`${port}items/${category}`);
      setItemsData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch items. Please try again later.");
    }
    setLoading(false);
  };

  // Handle category selection
  const handleClick = (e) => {
    setSelectedCategory(e.key);
    fetchItems(e.key);
    setActivePage("itemsTable"); // Set active page to itemsTable
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleShowIssuedItems = () => {
    setActivePage("issuedItems"); // Set active page to issuedItems
  };

  const handleShowProfile = () => {
    setActivePage("profile"); // Set active page to profile
  };

  const items = [
    {
      key: "domains",
      label: <span style={{ fontSize: "18px", fontWeight: "bold" }}>Domains</span>,
      icon: <AppstoreOutlined />,
      children: [
        {
          key: "Electrical Inventory",
          label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Electrical Inventory</span>,
          icon: "⚡",
          children: [
            { key: "Wire Coils", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Wire Coils</span> },
            { key: "Cables", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Cables</span> },
            { key: "Cable joint kit", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Cable joint kit</span> },
            { key: "MCBs", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>MCBs</span> },
            { key: "Enclosures", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Enclosures</span> },
            { key: "DB's", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>DB's</span> },
            { key: "Busbars", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Busbars</span> },
            { key: "Fuses", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Fuses</span> },
            { key: "Switches", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Switches</span> },
            { key: "Sockets", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Sockets</span> },
            { key: "Plug Tops", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Plug Tops</span> },
            { key: "Modular metals boxes", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Modular metals boxes</span> },
            { key: "Plates", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Plates</span> },
            { key: "Connectors", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Connectors</span> },
            { key: "Dummies gang boxes", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Dummies gang boxes</span> },
            { key: "PVC tape rolls", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>PVC tape rolls</span> },
            { key: "Street lights", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Street lights</span> },
            { key: "Tube lights", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Tube lights</span> },
            { key: "Chokes", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Chokes</span> },
            { key: "Ceiling fans", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Ceiling fans</span> },
            { key: "Wall mounted fan", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Wall mounted fan</span> },
            { key: "Exhaust fans", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Exhaust fans</span> },
            { key: "Ceiling roses", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Ceiling roses</span> },
            { key: "Fan Regulators", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Fan Regulators</span> },
            { key: "Fan Capacitors", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Fan Capacitors</span> },
            { key: "Trunking Materials", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Trunking Materials</span> },
            { key: "PVC Pipes", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>PVC Pipes</span> },
            { key: "Bends", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Bends</span> },
            { key: "Junction boxes", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Junction boxes</span> },
            { key: "PVC Tap rolls", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>PVC Tap rolls</span> },
            { key: "Casing", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Casing</span> },
            { key: "Packing tapes", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Packing tapes</span> },
            { key: "End caps", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>End caps</span> },
            { key: "Glands", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Glands</span> },
            { key: "Legs", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Legs</span> },
            { key: "Earth pipes", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Earth pipes</span> },
            { key: "Copper strips", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Copper strips</span> },
            { key: "Earth copper plates", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Earth copper plates</span> },
            { key: "Drilling Machine", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Drilling Machine</span> },
            { key: "Spare parts", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Spare parts</span> },
            { key: "Drill bits", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Drill bits</span> },
            { key: "Crimping Tool", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Crimping Tool</span> },
            { key: "Cutting blades", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Cutting blades</span> },
            { key: "Nails", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Nails</span> },
            { key: "Air Curtains", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Air Curtains</span> },
            { key: "Other", label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Other</span> },
          ],
        },
      ],
    },
    {
      key: "issuedItems",
      label: <span style={{ fontSize: "18px", fontWeight: "bold" }}>Issued Items</span>,
      icon: <DeliveredProcedureOutlined />,
    },
    {
      key: "profile", // Add profile key
      label: <span style={{ fontSize: "18px", fontWeight: "bold" }}>Profile</span>,
      icon: <UserOutlined />, // Add profile icon
    },
  ];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 256, background: "#f0f2f5", padding: 10, overflowY: "auto" }}>
        <h3 style={{ textAlign: "center" }}>Issuer Dashboard</h3>

        <Menu
          mode="inline"
          items={items}
          onClick={(e) => {
            if (e.key === "issuedItems") {
              handleShowIssuedItems();
            } else if (e.key === "profile") {
              handleShowProfile(); // Handle profile click
            } else {
              handleClick(e);
            }
          }}
        />

        {/* Logout */}
        <Menu mode="inline">
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </div>

      {/* Content Section */}
      <div style={{ padding: 20, flex: 1 }}>
        {loading ? (
          <Spin size="large" />
        ) : activePage === "itemsTable" ? (
          <ItemsTable itemsData={itemsData} setItemsData={setItemsData} />
        ) : activePage === "issuedItems" ? (
          <IssuedItemsTable />
        ) : activePage === "profile" ? (
          <Profile /> // Render Profile component
        ) : (
          <h2>Welcome to the Issuer Dashboard!</h2>
        )}
      </div>
    </div>
  );
};

export default IssuerDash;