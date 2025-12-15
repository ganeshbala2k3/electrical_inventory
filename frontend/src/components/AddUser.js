import React, { useState } from "react";
import { Form, Input, Button, Select, message, Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { UserAddOutlined, MailOutlined, PhoneOutlined, LockOutlined, TeamOutlined } from "@ant-design/icons";
import axios from "axios";
import { port } from "./porturl";

const { Title } = Typography;
const { Option } = Select;

const AddUser = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Note: Initial state for formData is now managed by Antd's Form instance

  const handleSubmit = async (values) => {
    setLoading(true);

    // Backend expects 'phone' to be in the payload, but the state uses 'phone' which maps to 'phone_number' in the old code.
    // Ensure the payload structure matches your backend's expected fields:
    const payload = {
      username: values.username,
      email: values.email,
      phone: values.phone, // Assuming backend uses 'phone' or handles the mapping
      password: values.password,
      role: values.role,
    };

    try {
      const response = await axios.post(`${port}adduser`, payload);
      
      if (response.data.success) {
        message.success("User added successfully! Redirecting...");
        form.resetFields();
        // Redirect logic: Adjust this to your required route (e.g., /users list)
        setTimeout(() => navigate("/dash"), 1000); 
      } else {
        message.error(response.data.message || "Failed to add user. Please check credentials.");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      const errorMessage = error.response?.data?.message || "Failed to connect to the server.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <Card
        title={
          <Title level={3} style={{ margin: 0 }}>
            <UserAddOutlined style={{ marginRight: 10, color: '#1890ff' }} /> Add New User
          </Title>
        }
        bordered={false}
        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", borderRadius: "8px" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ role: "Staff" }} // Default Antd form value
        >
          {/* Username */}
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input a username!" }]}
          >
            <Input prefix={<UserAddOutlined />} placeholder="Enter Username" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input an email!" },
              { type: "email", message: "The input is not valid E-mail!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter Email" />
          </Form.Item>

          {/* Phone */}
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              { required: true, message: "Please input the phone number!" },
              { 
                pattern: /^\d{10}$/, 
                message: "Phone must be a valid 10-digit number." 
              },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Enter 10-digit Phone Number" maxLength={10} />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input a password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter Password" />
          </Form.Item>

          {/* Role */}
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select a user role!" }]}
          >
            <Select prefix={<TeamOutlined />} placeholder="Select Role">
              <Option value="Admin">Admin</Option>
              <Option value="Manager">Manager</Option>
              <Option value="Staff">Staff</Option>
            </Select>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ width: "100%", marginTop: 15 }}
          >
            Add User
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default AddUser;