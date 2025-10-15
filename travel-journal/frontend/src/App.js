import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Box, AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import Login from "./components/Login.jsx";
import HomePage from "./components/HomePage.jsx";
import Register from "./components/Register.jsx";

function App() {
  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        {/* Thanh điều hướng */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              🌍 Travel Journal
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </Toolbar>
        </AppBar>

        {/* Nội dung chính */}
        <Container sx={{ mt: 4 }}>
          <Routes>
            {/* Trang chủ */}
            <Route path="/" element={<HomePage />} />

            {/* Trang đăng nhập / đăng ký */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;
