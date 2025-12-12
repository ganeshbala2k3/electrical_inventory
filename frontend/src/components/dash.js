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
import IssueItems from "./issue";
import AddItems from "./AddItems";
import Purchases from "./Purchases";
import AddSupplier from "./AddSupplier";
import PurchasesList from "./PurchasesList";
import Users from "./Users";
import Home from "./Home";
import Profile from "./Profile";
import AddCategory from "./categoryadd";
import { port } from "./porturl";
import Recipients from "./Recipients";


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
  const handleIssue=()=>{
    setActivePage('issue');
  }
  const handleAddCategory =() =>{
    setActivePage('addCategory')
  }
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

  const handleAddRecipient =()=>{
    setActivePage("addrec")
  }

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
            icon={<UserOutlined />}
            onClick={handleShowUsers}
          >
            Users
          </Menu.Item>

          <Menu.Item
            key=""
            icon={<ContainerOutlined />}
            onClick={handleIssue}
          >
            Issue
          </Menu.Item>
         


          <Menu.Item
            key="issuedItems"
            icon={<DeliveredProcedureOutlined />}
            onClick={handleShowIssuedItems}
          >
            Issued Items
          </Menu.Item>

          <Menu.Item
            key="addrec"
            icon={<UserOutlined />}
            onClick={handleAddRecipient}
          >
            Add Recipient
          </Menu.Item>
          <Menu.Item
            key="supplier"
            icon={<ContainerOutlined />}
            onClick={handleShowAddSupplier}
          >
            Suppliers
          </Menu.Item>
          <Menu.Item
            key="addCategory"
            icon={<UserOutlined />}
            onClick={handleAddCategory}
          >
            Add Category
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
        ) : activePage === "addCategory" ? (
          <AddCategory />
        ) : activePage === "issue" ? (
          <IssueItems />
        ) : activePage === "issuedItems" ? (
          <IssuedItemsTable />
        ) : activePage === "addItems" ? (
          <AddItems />
        ) : activePage === "purchases" ? (
          <Purchases />
        ) : activePage === "addrec" ? (
          <Recipients/>
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