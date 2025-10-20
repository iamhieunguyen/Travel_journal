import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginService from "../service/Login";

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const data = await loginService.login(values.email, values.password);
      const { user, token } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.userId || user.id);
      localStorage.setItem("userInfo", JSON.stringify(user));

      setMessage(`✅ Đăng nhập thành công: ${user.username}`);
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || "Đăng nhập thất bại"}`);
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, message };
}
