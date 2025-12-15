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
import ViewStock from './components/viewStock';
import ReturnItems from './components/returnstock';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/addItems" element={<AddItems />} />
         <Route
          path="/dash"
          element={
            <ProtectedRoute allowedRoles={["Admin","Manager","Staff"]}>
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
        <Route path="/issueditems"  element={
            <ProtectedRoute allowedRoles={["Admin","Manager","Staff"]}>
              <IssueItems/>
            </ProtectedRoute>
          } />
        <Route path="/users"  element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Users/>
            </ProtectedRoute>
          } />
        <Route path="/home" element={<Home />} />
        <Route path="/addCategory"  element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AddCategory/>
            </ProtectedRoute>
          } />
        <Route path="/profile"  element={
            <ProtectedRoute allowedRoles={["Admin","Manager","Staff"]}>
              <Profile/>
            </ProtectedRoute>
          } />
        <Route path="/issue"  element={
            <ProtectedRoute allowedRoles={["Admin","Manager"]}>
              <IssueItems/>
            </ProtectedRoute>
          } />
        <Route path="/addrec"  element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Recipients/>
            </ProtectedRoute>
          } />
        <Route path="/viewstock"  element={
            <ProtectedRoute allowedRoles={["Admin","Manager","Staff"]}>
              <ViewStock/>
            </ProtectedRoute>
          } />
         <Route path="/returnstock"  element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <ReturnItems/>
            </ProtectedRoute>
          } />

          


        


      </Routes>
    </Router>
  );
}

export default App;
