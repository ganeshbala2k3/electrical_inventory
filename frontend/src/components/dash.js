import React, { useState } from "react";
import { Menu, Spin, message, Button } from "antd";
import { useNavigate } from "react-router-dom";

import {
  AppstoreOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  DeliveredProcedureOutlined,
  ContainerOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  // Imported Icons
} from "@ant-design/icons";
import axios from "axios";

// Import all necessary components (List remains unchanged)
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
import ViewStock from "./viewStock";
import ReturnItems from "./returnstock";

const Dash = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [itemsData, setItemsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [collapsed, setCollapsed] = useState(false); 
  
  const navigate = useNavigate();
  
  // User Role Logic (Retained)
  const AdminAccess = ["Admin"];
  const ManagerAccess=["Manager","Admin"];
  const StaffAccess=["Staff","Admin","Manager"];
  const role = localStorage.getItem("user_role");
  const hasAdmin = AdminAccess.includes(role);
  const hasManager = ManagerAccess.includes(role);
  const hasStaff = StaffAccess.includes(role);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // --- Helper Functions (Navigation handlers remain unchanged) ---
  const fetchItems = async (category) => {
    setLoading(true);
    try {
      const response = await axios.get(`${port}items/${category}`);
      setItemsData(response.data);
    } catch (error) {
      message.error("Failed to fetch items.");
    }
    setLoading(false);
  };

  const handleClick = (e) => {
    setSelectedCategory(e.key);
    fetchItems(e.key);
    setActivePage(null); 
  };

  const handleReturnStock = () => setActivePage('returnstock');
  const handleViewStock = () => setActivePage('viewstock');
  const handleIssue = () => setActivePage('issue');
  const handleAddCategory = () => setActivePage('addCategory');
  const handleShowHome = () => setActivePage("home");
  const handleShowIssuedItems = () => setActivePage("issuedItems");
  const handleShowAddUser = () => setActivePage("addUser"); // Not directly used in menu structure now, but kept
  const handleShowAddItems = () => setActivePage("addItems"); // Not directly used in menu structure now, but kept
  const handleShowPurchases = () => setActivePage("purchases");
  const handleAddRecipient = () => setActivePage("addrec");
  const handleShowAddSupplier = () => setActivePage("addSupplier");
  const handleShowPurchasesList = () => setActivePage("purchasesList");
  const handleShowUsers = () => setActivePage("users");
  const handleShowProfile = () => setActivePage("profile");

  const handleLogout = async () => {
    try {
      await axios.post(`${port}logout`, {}, { withCredentials: true });
      localStorage.clear();
      alert('Session Cleared Logged out!!');
      navigate("/");
    } catch {
      console.log("Logout API failed");
    }
  };


  // --- Render Content (Unchanged) ---
  const renderContent = () => {
    if (loading) return <Spin size="large" />;
    
    switch (activePage) {
      case "home":
        return <Home />;
      case "viewstock":
        return <ViewStock />;
      case "returnstock":
        return <ReturnItems />;
      case "addUser":
        return <AddUser />;
      case "addCategory":
        return <AddCategory />;
      case "issue":
        return <IssueItems />;
      case "issuedItems":
        return <IssuedItemsTable />;
      case "addItems":
        return <AddItems />;
      case "purchases":
        return <Purchases />;
      case "addrec":
        return <Recipients />;
      case "purchasesList":
        return <PurchasesList />;
      case "addSupplier":
        return <AddSupplier />;
      case "users":
        return <Users />;
      case "profile":
        return <Profile />;
      default:
        if (selectedCategory && itemsData.length > 0) {
          return <ItemsTable itemsData={itemsData} setItemsData={setItemsData} />;
        }
        return <h2>No items found for this category or page not selected.</h2>;
    }
  };


  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div 
        style={{ 
          width: collapsed ? 80 : 256,
          background: "#f0f2f5", 
          padding: 10, 
          overflowY:"auto",
          maxHeight:"100vh", 
          transition: 'width 0.2s',
        }}
      >
        <h3 style={{ textAlign: "center", display: collapsed ? 'none' : 'block' }}>Inventory</h3>
        
        {/* Collapse Button */}
        <Button
          type="primary"
          onClick={toggleCollapsed}
          style={{ marginBottom: 16, width: '100%', padding: 0 }}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        >
          {collapsed ? null : 'Collapse Menu'}
        </Button>
        

        {/* Menu Section */}
        <Menu 
          mode="inline"
          inlineCollapsed={collapsed}
        >
          {/* ==================================== */}
          {/* 1. HOME & PROFILE */}
          {/* ==================================== */}
          <Menu.Item
            key="home"
            icon={<HomeOutlined />}
            onClick={handleShowHome}
          >
            Home
          </Menu.Item>

          <Menu.Item
            key="profile"
            icon={<UserOutlined />}
            onClick={handleShowProfile}
          >
            Profile
          </Menu.Item>
          
          <Menu.Divider />

          {/* ==================================== */}
          {/* 2. TRANSACTIONS (Purchase, Issue, Return) */}
          {/* ==================================== */}
          <Menu.ItemGroup key="grp-trans" title={!collapsed && "Transactions"}>
            {hasManager && (
              <Menu.Item key="purchases" icon={<ContainerOutlined />} onClick={handleShowPurchases}>
                Purchase Stock
              </Menu.Item>
            )}

            {hasManager && (
              <Menu.Item key="issue" icon={<ContainerOutlined />} onClick={handleIssue}>
                Issue Items
              </Menu.Item>
            )}
            
            {hasAdmin && (
              <Menu.Item key="returnstock" icon={<DeliveredProcedureOutlined />} onClick={handleReturnStock}>
                Return Stock
              </Menu.Item>
            )}
          </Menu.ItemGroup>
          
          <Menu.Divider />

          {/* ==================================== */}
          {/* 3. REPORTS & VIEWS */}
          {/* ==================================== */}
          <Menu.ItemGroup key="grp-reports" title={!collapsed && "Reports & Stock"}>
            {hasStaff && (
              <Menu.Item key="viewstock" icon={<DeliveredProcedureOutlined/>} onClick={handleViewStock}>
                View Available Stock
              </Menu.Item>
            )}

            {hasStaff && (
              <Menu.Item key="issuedItems" icon={<DeliveredProcedureOutlined />} onClick={handleShowIssuedItems}>
                Issued Items List
              </Menu.Item>
            )}
            
            {hasStaff && (
              <Menu.Item key="purchasesList" icon={<ContainerOutlined />} onClick={handleShowPurchasesList}>
                Purchases History
              </Menu.Item>
            )}
          </Menu.ItemGroup>

          <Menu.Divider />
          
          {/* ==================================== */}
          {/* 4. MASTER SETUP (Admin) */}
          {/* ==================================== */}
          <Menu.ItemGroup key="grp-admin" title={!collapsed && "Admin/Setup"}>
            { hasAdmin && (
              <Menu.Item key="users" icon={<UserOutlined />} onClick={handleShowUsers}>
                Manage Users
              </Menu.Item>
            )}
            
            {hasAdmin && (
              <Menu.Item key="addrec" icon={<UserOutlined />} onClick={handleAddRecipient}>
                Manage Recipients
              </Menu.Item>
            )}

            {hasAdmin && (
              <Menu.Item key="supplier" icon={<ContainerOutlined />} onClick={handleShowAddSupplier}>
                Manage Suppliers
              </Menu.Item>
            )}

            {hasAdmin && (
              <Menu.Item key="addCategory" icon={<AppstoreOutlined />} onClick={handleAddCategory}>
                Manage Categories
              </Menu.Item>
            )}
          </Menu.ItemGroup>
          
          <Menu.Divider />

          {/* ==================================== */}
          {/* 5. LOGOUT (Always Last) */}
          {/* ==================================== */}
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ marginTop: 'auto', borderTop: '1px solid #ccc' }} 
          >
            Logout
          </Menu.Item>
        </Menu>

        
      </div>

      {/* Content Section (Unchanged) */}
      <div style={{ padding: 20, flex: 1 }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dash;