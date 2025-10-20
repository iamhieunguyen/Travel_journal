import React from "react";
import { Form, Input, Button, Typography } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import useRegister from "../../../hooks/useRegister";
import "./RegisterPage.css"

const { Title, Text } = Typography;

export default function RegisterPage() {
    const { handleRegister, loading, message } = useRegister();

    const onFinish = (values) => {
        handleRegister(values);
    };

    return (
        <div className="register-background">
            <div className="background-title">Welcome to Travel Journal</div>

            <div className="register-card">
                <div className="register-logo">
                    <img src="" alt="logo" />
                </div>

                <Title level={3} className="register-title">
                    Sign up
                </Title>

                <Form layout="vertical" onFinish={onFinish} className="register-form">
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true, message: "Please enter your username!" }]}
                    >
                        <Input prefix={<UserOutlined/>} placeholder="Enter your username..." size="large" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, message: "Please enter you email!" }]}
                    >
                        <Input prefix={<MailOutlined/>} placeholder="Enter your email..." size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: "Please enter your password!" }]}
                    >
                        <Input.Password prefix={<LockOutlined/>} placeholder="Create a password" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Confirm password"
                        rules={[{ required: true, message: "Please enter your pass word again to confirm!" }]}
                    >
                        <Input.Password prefix={<LockOutlined/>} placeholder="Enter your password again" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            className="register-btn"
                        >
                            Sign up
                        </Button>
                    </Form.Item>
                </Form>

                {message.text && (
                    <p className={`register-message ${message.type}`}>{message.text}</p>
                )}
                <div className="signin-link">
                    You already have an account? <a href="/">Sign in</a>
                </div>
            </div>
        </div>
    );
}
