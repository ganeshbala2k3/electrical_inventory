import React, { useEffect, useState } from "react";
import { Table, Button, message } from "antd";
import axios from "axios";
import AddUser from "./AddUser";
import { port } from "./porturl";
const Users = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${port}users`);
      setUsersData(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users. Please try again later.");
    }
    setLoading(false);
  };

  // Show Add User page
  const handleShowAddUser = () => {
    setShowAddUser(true);
  };

  // Hide Add User page
  const handleHideAddUser = () => {
    setShowAddUser(false);
    fetchUsers(); // Refresh users after adding a new user
  };

  useEffect(() => {
    fetchUsers(); // Fetch users when the component is mounted
  }, []);

  return (
    <div>
      {showAddUser ? (
        <AddUser onCancel={handleHideAddUser} />
      ) : (
        <>
          <Button
            type="primary"
            style={{ marginBottom: 16 }}
            onClick={handleShowAddUser}
          >
            + Add User
          </Button>
          <Table
            dataSource={usersData}
            columns={[
              { title: "ID", dataIndex: "user_id", key: "user_id" },
              { title: "Username", dataIndex: "username", key: "username" },
              { title: "Email", dataIndex: "email", key: "email" },
              { title: "Role", dataIndex: "role", key: "role" },
            ]}
            rowKey="user_id"
            loading={loading}
          />
        </>
      )}
    </div>
  );
};

export default Users;