import React from "react";
import EntryList from "../service/EntryList";
import { Button } from "react-bootstrap";

export default function HomePage() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🌍 Travel Journal</h1>
        <p style={styles.subtitle}>Ghi lại hành trình và khoảnh khắc đáng nhớ của bạn</p>
        <Button
          variant="primary"
          style={styles.newButton}
          onClick={() => alert("Đi đến trang tạo bài viết mới!")}
        >
          ✏️ Tạo bài viết mới
        </Button>
      </header>

      {/* Content */}
      <main style={styles.content}>
        <EntryList />
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} Travel Journal | Made with ❤️</p>
      </footer>
    </div>
  );
}

// 🎨 Inline styles
const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#f9fafc",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    textAlign: "center",
    padding: "40px 20px 20px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: "100%",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: "1.1rem",
    opacity: 0.9,
  },
  newButton: {
    marginTop: 15,
    fontWeight: "600",
  },
  content: {
    maxWidth: 800,
    width: "100%",
    marginTop: 30,
    padding: "0 20px",
  },
  footer: {
    marginTop: "auto",
    padding: "20px 0",
    fontSize: "0.9rem",
    color: "#555",
  },
};
