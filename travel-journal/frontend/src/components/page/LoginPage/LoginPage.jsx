import React from "react";
import { Form, Input, Button, Typography, Checkbox } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import useLogin from "../../../hooks/useLogin";
import "./LoginPage.css";

const { Title, Text } = Typography;

export default function LoginPage() {
  const { handleLogin, loading, message } = useLogin();

  const onFinish = (values) => {
    handleLogin(values);
  };

  return (
    <div className="login-background">
      {/* Tiêu đề trên nền */}
      <h1 className="background-title">Welcome to Travel Journal</h1>

      {/* Khung đăng nhập */}
      <div className="login-card">
        <div className="login-logo">
          <img src="" alt="logo" />
        </div>

        <Title level={4} className="login-title">
          Welcome back
        </Title>
        <Text className="login-subtitle">
          Please enter your details to sign in.
        </Text>

        <Form layout="vertical" onFinish={onFinish} className="login-form">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter your email!" }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email..."
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <div className="login-options">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <a href="/forgot-password" className="forgot-link">
              Forgot password?
            </a>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="signin-btn"
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>

        {message && <p className="login-message">{message}</p>}

        <div className="signup-link">
          Don’t have an account yet? <a href="/register">Sign up</a>
        </div>
      </div>
    </div>
  );
}
