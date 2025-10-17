import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "@mui/material";
import HomePage from "./components/page/HomePage";
import Login from "./components/page/Login";
import Register from "./components/page/Register";

function App() {
  return (
    <Router>
      {/* 📌 Phần Header hoặc Layout chung bạn sẽ thêm sau ở đây */}

      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Container>

      {/* 📌 Footer cũng có thể thêm ở đây sau */}
    </Router>
  );
}

export default App;
