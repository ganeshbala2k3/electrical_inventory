import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Input, message, Typography, Row, Col, Divider, Spin } from "antd";
import axios from "axios";
import moment from "moment";

const { Title, Text } = Typography;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();


  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
              console.log("Successfully sent the local Storage");
      const response = await axios.get(`http://localhost:4000/user/${user_id}`);
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        message.error("Failed to load user data.");
      }
    } catch (error) {
      message.error("Server error while fetching profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      console.log(values);

      const response = await axios.put(`http://localhost:4000/change-password/${user_id}`, values);

      if (response.data.success) {
        message.success("Password updated successfully!");
        setIsModalVisible(false);
        form.resetFields();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Failed to update password. Try again.");
    }
  };

  if (loading) return <Spin style={{ marginTop: "20%" }} />;

  if (!user)
    return <p style={{ textAlign: "center", marginTop: "20%", color: "red" }}>User not found</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Card
        title={<Title level={3} style={{ margin: 0 }}>User Profile</Title>}
        bordered={false}
        style={{ boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", borderRadius: "10px" }}
      >

        <Row gutter={[16, 16]}>
          <Col span={12}><Text strong>User ID:</Text><p>{user.user_id}</p></Col>
          <Col span={12}><Text strong>Username:</Text><p>{user.username}</p></Col>
          <Col span={12}><Text strong>Email:</Text><p>{user.email}</p></Col>
          <Col span={12}><Text strong>Phone:</Text><p>{user.phone_number}</p></Col>
          <Col span={12}><Text strong>Role:</Text><p>{user.role}</p></Col>
          <Col span={12}>
            <Text strong>Created At:</Text>
            <p>{moment(user.created_at).format("YYYY-MM-DD HH:mm:ss")}</p>
          </Col>
        </Row>

        <Divider />

        <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ width: "100%" }}>
          Change Password
        </Button>
      </Card>

      <Modal title="Change Password" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="New Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>Update</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
