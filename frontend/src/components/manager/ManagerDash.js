import React from "react";
import { Menu } from "antd";
import {
  LogoutOutlined,
  DeliveredProcedureOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, Route, Routes } from "react-router-dom";
import Purchases from "../Purchases";
import PurchasesList from "../PurchasesList";
import Profile from "../Profile"; // Import Profile component

const ManagerDash = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 256, background: "#f0f2f5", padding: 10, overflowY: "auto" }}>
        <h3 style={{ textAlign: "center" }}>Manager Dashboard</h3>

        <Menu mode="inline">
          <Menu.Item key="purchases" icon={<DeliveredProcedureOutlined />} onClick={() => navigate("/managerdash/purchases")}>
            Purchases
          </Menu.Item>
          <Menu.Item key="purchasesList" icon={<DeliveredProcedureOutlined />} onClick={() => navigate("/managerdash/purchaselist")}>
            Purchases List
          </Menu.Item>
          <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate("/managerdash/profile")}>
            Profile
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </div>

      {/* Content Section */}
      <div style={{ padding: 20, flex: 1 }}>
        <Routes>
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/purchaselist" element={<PurchasesList />} />
          <Route path="/profile" element={<Profile />} /> {/* Add profile route */}
          <Route path="/" element={<h2>Welcome to the Manager Dashboard!</h2>} />
        </Routes>
      </div>
    </div>
  );
};

export default ManagerDash;