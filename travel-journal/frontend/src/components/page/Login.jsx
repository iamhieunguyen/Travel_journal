import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginService from "../../service/Login"; // ✅ import từ file service

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // ✅ gọi service thay vì gọi trực tiếp api
      const data = await loginService.login(email, password);

      const { user, token } = data;

      // ✅ Lưu token & user vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.userId || user.id);
      localStorage.setItem("userInfo", JSON.stringify(user));

      setMessage(`✅ Đăng nhập thành công: ${user.username}`);
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || "Đăng nhập thất bại"}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Đăng nhập</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" style={styles.button}>
          🔐 Đăng nhập
        </button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "80px auto",
    padding: "30px",
    backgroundColor: "#fff",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    borderRadius: "12px",
    textAlign: "center",
  },
  title: { marginBottom: "20px", color: "#007bff" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "1rem",
  },
  button: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  message: { marginTop: "15px" },
};
