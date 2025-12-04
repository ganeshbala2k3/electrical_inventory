import React, { useState } from "react";
import { Menu, Spin, message } from "antd";
import {
  AppstoreOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  DeliveredProcedureOutlined,
  ContainerOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ItemsTable from "./ItemsTable";
import AddUser from "./AddUser";
import IssuedItemsTable from "./IssuedItems";
import AddItems from "./AddItems";
import Purchases from "./Purchases";
import AddSupplier from "./AddSupplier";
import PurchasesList from "./PurchasesList";
import Users from "./Users";
import Home from "./Home";
import Profile from "./Profile";
import { port } from "./porturl";
const items = [
  {
    key: "domains",
    label: <span style={{ fontSize: "18px", fontWeight: "bold" }}>Domains</span>,
    icon: <AppstoreOutlined />,
    children: [
      {
        key: "Electrical Inventory",
        label: <span style={{ fontSize: "16px", fontWeight: "bold" }}>Electrical Inventory</span>,
        icon:"⚡",
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
      {
        key: "itStationary",
        label: " IT Stationary",
        icon:"✏️",
        children: [{ key: "A4Sheets", label: "A4 Sheets" }],
      },
    ],
  },
];

const Dash = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [itemsData, setItemsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("home");

  // Fetch items based on the selected category
  const fetchItems = async (category) => {
    setLoading(true);
    try {
      const response = await axios.get(`${port}items/${category}`);
      setItemsData(response.data);
      console.log("Fetched items:", response.data);
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
    setActivePage(null); // Reset active page
  };

  // Show Home page
  const handleShowHome = () => {
    setActivePage("home");
  };

  // Show Issued Items page
  const handleShowIssuedItems = () => {
    setActivePage("issuedItems");
  };

  // Show Add User page
  const handleShowAddUser = () => {
    setActivePage("addUser");
  };

  // Show Add Items page
  const handleShowAddItems = () => {
    setActivePage("addItems");
  };

  // Show Purchases page
  const handleShowPurchases = () => {
    setActivePage("purchases");
  };

  // Show Add Supplier page
  const handleShowAddSupplier = () => {
    setActivePage("addSupplier");
  };

  // Show Purchases List page
  const handleShowPurchasesList = () => {
    setActivePage("purchasesList");
  };

  // Show Users page
  const handleShowUsers = () => {
    setActivePage("users");
  };

  // Logout function
  const handleLogout = () => {
    localStorage.clear(); // Clear user session data
    window.location.href = "/"; // Redirect to the login page
  };

  // Show Profile page
  const handleShowProfile = () => {
    setActivePage("profile");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 256, background: "#f0f2f5", padding: 10, overflowY:"auto",maxHeight:"100vh", }}>
        <h3 style={{ textAlign: "center" }}>Inventory</h3>

        <Menu mode="inline">
          <Menu.Item
            key="home"
            icon=<span style={{ fontSize: "24px" }}>{<HomeOutlined />}</span>
            
            onClick={handleShowHome}
          >
            <span style={{ fontSize: "18px", fontWeight:'bold' }}>Home</span>

          </Menu.Item>
        </Menu>
        <Menu onClick={handleClick} mode="inline" items={items} />

        {/* Other menu items */}
        <Menu mode="inline">
          <Menu.Item
            key="profile"
            icon={<UserOutlined />}
            onClick={handleShowProfile}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            key="users"
            icon={<UsergroupAddOutlined />}
            onClick={handleShowUsers}
          >
            Users
          </Menu.Item>
          <Menu.Item
            key="issuedItems"
            icon={<DeliveredProcedureOutlined />}
            onClick={handleShowIssuedItems}
          >
            Issued Items
          </Menu.Item>
          <Menu.Item
            key="supplier"
            icon={<ContainerOutlined />}
            onClick={handleShowAddSupplier}
          >
            Suppliers
          </Menu.Item>
          <Menu.Item
            key="purchases"
            icon={<ContainerOutlined />}
            onClick={handleShowPurchases}
          >
            Purchase
          </Menu.Item>
          <Menu.Item
            key="purchasesList"
            icon={<ContainerOutlined />}
            onClick={handleShowPurchasesList}
          >
            Purchases List
          </Menu.Item>
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Menu.Item>
        </Menu>

        
      </div>

      {/* Content Section */}
      <div style={{ padding: 20, flex: 1 }}>
        {loading ? (
          <Spin size="large" />
        ) : activePage === "home" ? (
          <Home />
        ) : activePage === "addUser" ? (
          <AddUser />
        ) : activePage === "issuedItems" ? (
          <IssuedItemsTable />
        ) : activePage === "addItems" ? (
          <AddItems />
        ) : activePage === "purchases" ? (
          <Purchases />
        ) : activePage === "purchasesList" ? (
          <PurchasesList />
        ) : activePage === "addSupplier" ? (
          <AddSupplier />
        ) : activePage === "users" ? (
          <Users />        ) : activePage === "profile" ? ( // Ensure this condition is checked before rendering items
          <Profile />
        ) : selectedCategory && itemsData.length > 0 ? (
          <ItemsTable itemsData={itemsData} setItemsData={setItemsData} />
        ) : (
          <h2>No items found for this category</h2>
        )}
      </div>
    </div>
  );
};

export default Dash;