import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async (formData) => {
    setMessage({ type: "", text: "" });
    setLoading(true);

    const { username, email, password, confirmPassword } = formData;

    // Validate dữ liệu cơ bản
    if (!username || !email || !password || !confirmPassword) {
      setMessage({ type: "error", text: "Vui lòng điền đầy đủ thông tin!" });
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ type: "error", text: "Email không hợp lệ!" });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu phải có ít nhất 6 ký tự!" });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu nhập lại không khớp!" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Đăng ký thất bại!");

      setMessage({ type: "success", text: "Đăng ký thành công! Đang chuyển hướng..." });
      localStorage.setItem("token", data.token);

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, message };
}
