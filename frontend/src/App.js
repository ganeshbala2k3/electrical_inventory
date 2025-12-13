import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dash from "./components/dash";
import AddItems from "./components/AddItems";
import AddUser from "./components/AddUser";
import ContentSection from "./components/ContentSection";
import IssuedItems from "./components/IssuedItems";
import PurchasesList from "./components/PurchasesList";
import Users from "./components/Users";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Purchases from "./components/Purchases";
import Staffdash from "./components/staff/staffdash";
import IssuerDash from "./components/issuer/IssuerDash";
import ManagerDash from "./components/manager/ManagerDash";
import AddCategory from './components/categoryadd';
import IssueItems from './components/issue';
import Recipients from './components/Recipients';
import ProtectedRoute from './routewrapper';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/addItems" element={<AddItems />} />
         <Route
          path="/dash"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Dash/>
            </ProtectedRoute>
          }
        />
        <Route path="/add-user"  element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AddUser/>
            </ProtectedRoute>
          } />
        <Route path="/content" element={<ContentSection />} />
        <Route path="/issueditems" element={<IssuedItems />} />
        <Route path="/users" element={<Users />} />
        <Route path="/home" element={<Home />} />
        <Route path="/addCategory" element={<AddCategory/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/staffdash" element={<Staffdash />} />
        <Route path="/issuerdash" element={<IssuerDash />} />
        <Route path="/managerdash/*" element={<ManagerDash />} />
        <Route path="/issue" element={<IssueItems />} />
        <Route path="/addrec" element={<Recipients/>} />

        


      </Routes>
    </Router>
  );
}

export default App;
