import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Input, message, Typography, Row, Col, Divider, Spin, Space } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from "axios";
import moment from "moment";
import { port } from "./porturl";

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
      const response = await axios.get(`${port}user/${user_id}`);
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        message.error("Failed to load user data.");
      }
    } catch (error) {
       // Fallback to local storage if API fails
       setUser({
        user_id: user_id,
        username: localStorage.getItem("user_name") || "N/A",
        role: localStorage.getItem("user_role") || "N/A",
        email: "contact@college.edu", // Mock
        phone_number: "N/A", // Mock
        created_at: moment().toISOString(), // Mock
       });
       message.warning("Server error while fetching profile. Showing local data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      const response = await axios.put(`${port}change-password/${user_id}`, values);

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

  // 🔥 NEW: Password validation logic
  const validateNewPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value) {
        return Promise.reject(new Error('Please enter a new password!'));
      }
      if (value.length < 8) {
        return Promise.reject(new Error('Password must be at least 8 characters long.'));
      }
      // Check for at least one uppercase, one lowercase, one number, and one special character
      const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      
      if (!complexityRegex.test(value)) {
        return Promise.reject(new Error('Password must include uppercase, lowercase, number, and special character (@$!%*?&).'));
      }
      return Promise.resolve();
    },
  });

  if (loading) return <Spin style={{ marginTop: "20%" }} size="large" tip="Loading Profile..." />;

  if (!user)
    return <p style={{ textAlign: "center", marginTop: "20%", color: "red" }}>User not found</p>;
    
  // --- Enhanced UI Rendering ---

  const INFO_COLOR = '#096dd9'; 
  const ACTION_COLOR = '#ff4d4f'; 

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Card
        title={
          <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>
            <UserOutlined style={{ marginRight: 10, color: INFO_COLOR }} /> User Profile
          </Title>
        }
        bordered={false}
        style={{ 
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)", 
          borderRadius: "12px",
          backgroundColor: '#ffffff'
        }}
      >

        <Row gutter={[32, 24]} style={{ fontSize: '16px' }}>
          
          {/* Row 1: ID and Username */}
          <Col span={12}>
            <Text strong style={{ color: INFO_COLOR }}>User ID:</Text>
            <p style={{ marginTop: 4, fontWeight: 500 }}>{user.user_id}</p>
          </Col>
          <Col span={12}>
            <Text strong style={{ color: INFO_COLOR }}>Username:</Text>
            <p style={{ marginTop: 4, fontWeight: 700, color: '#333' }}>{user.username}</p>
          </Col>
          
          <Divider style={{ margin: '10px 0' }} />

          {/* Row 2: Email and Phone */}
          <Col span={12}>
            <Text strong><MailOutlined style={{ marginRight: 8, color: INFO_COLOR }} /> Email:</Text>
            <p style={{ marginTop: 4 }}>{user.email}</p>
          </Col>
          <Col span={12}>
            <Text strong><PhoneOutlined style={{ marginRight: 8, color: INFO_COLOR }} /> Phone:</Text>
            <p style={{ marginTop: 4 }}>{user.phone_number}</p>
          </Col>

          {/* Row 3: Role and Created At */}
          <Col span={12}>
            <Text strong><SafetyOutlined style={{ marginRight: 8, color: ACTION_COLOR }} /> Role:</Text>
            <p style={{ marginTop: 4, fontWeight: 600 }}>{user.role}</p>
          </Col>
          <Col span={12}>
            <Text strong><ClockCircleOutlined style={{ marginRight: 8, color: INFO_COLOR }} /> Created At:</Text>
            <p style={{ marginTop: 4 }}>{moment(user.created_at).format("DD-MM-YYYY HH:mm:ss")}</p>
          </Col>
        </Row>

        <Divider style={{ margin: '30px 0 20px 0' }} />

        {/* Change Password Button */}
        <Button 
          type="primary" 
          style={{ 
            width: "100%", 
            height: 45, 
            fontSize: '16px', 
            fontWeight: 'bold',
            backgroundColor: ACTION_COLOR, 
            borderColor: ACTION_COLOR,
          }}
          onClick={() => setIsModalVisible(true)} 
        >
          Change Password
        </Button>
      </Card>

      {/* Password Modal */}
      <Modal 
        title={<Title level={4} style={{ margin: 0, color: ACTION_COLOR }}><SafetyOutlined /> Update Security Credentials</Title>} 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        footer={null}
        destroyOnClose={true} 
      >
        <Form form={form} layout="vertical" onFinish={handleChangePassword} style={{ marginTop: 20 }}>
          <Form.Item 
            name="currentPassword" 
            label="Current Password" 
            rules={[{ required: true, message: 'Please enter your current password' }]}
            hasFeedback
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>
          
          <Form.Item 
            name="newPassword" 
            label={
              <Space>
                New Password
                <Text type="secondary" style={{ fontSize: '0.8em' }}>
                  (Min 8 chars, incl. A-z, 0-9, special)
                </Text>
              </Space>
            } 
            rules={[
              // 1. Basic required check
              { required: true, message: 'Please enter a new password!' },
              // 2. Custom strong password validation
              validateNewPassword,
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          
          <Form.Item
            name="confirmNewPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
          
          <Button type="primary" htmlType="submit" style={{ width: "100%", marginTop: 15 }}>
            Update Password
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;