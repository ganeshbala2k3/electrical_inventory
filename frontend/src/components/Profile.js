import React, { useState } from "react";
import { Card, Button, Modal, Form, Input, message, Typography, Row, Col, Divider } from "antd";
import axios from "axios";
import moment from "moment";

const { Title, Text } = Typography;

const Profile = () => {
  // Get user details from localStorage
  const user = {
    user_id: localStorage.getItem("user_id"),
    username: localStorage.getItem("username"),
    email: localStorage.getItem("email"),
    phone: localStorage.getItem("phone"),
    role: localStorage.getItem("role"),
    created_at: localStorage.getItem("created_at"),
    login_time: localStorage.getItem("login_time"),
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Show the Change Password modal
  const showModal = () => setIsModalVisible(true);

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Handle password change
  const handleChangePassword = async (values) => {
    try {
      const response = await axios.put(`http://localhost:5000/user/${user.user_id}`, values);
      if (response.data.success) {
        message.success("Password updated successfully!");
        setIsModalVisible(false);
        form.resetFields();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Failed to update password. Please try again.");
    }
  };

  // If user_id is not present, show error
  if (!user.user_id) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <p style={{ color: "red" }}>User profile could not be loaded.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Card
        title={<Title level={3} style={{ margin: 0 }}>User Profile</Title>}
        bordered={false}
        style={{ boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", borderRadius: "10px" }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>User ID:</Text>
            <p>{user.user_id}</p>
          </Col>
          <Col span={12}>
            <Text strong>Username:</Text>
            <p>{user.username}</p>
          </Col>
          <Col span={12}>
            <Text strong>Email:</Text>
            <p>{user.email}</p>
          </Col>
          <Col span={12}>
            <Text strong>Phone:</Text>
            <p>{user.phone}</p>
          </Col>
          <Col span={12}>
            <Text strong>Role:</Text>
            <p>{user.role}</p>
          </Col>
          <Col span={12}>
            <Text strong>Created At:</Text>
            <p>{user.created_at ? moment(user.created_at).format("YYYY-MM-DD HH:mm:ss") : "N/A"}</p>
          </Col>
          <Col span={12}>
            <Text strong>Login Time:</Text>
            <p>{user.login_time ? moment(user.login_time).format("YYYY-MM-DD HH:mm:ss") : "N/A"}</p>
          </Col>
        </Row>
        <Divider />
        <Button type="primary" onClick={showModal} style={{ width: "100%" }}>
          Change Password
        </Button>
      </Card>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        style={{ borderRadius: "10px" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: "Please enter your current password!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[{ required: true, message: "Please enter your new password!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;