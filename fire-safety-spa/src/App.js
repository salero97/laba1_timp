import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Detail from "./pages/Detail";
import Form from "./pages/Form";
import Login from "./pages/Login";

const PrivateRoute = ({ element }) => {
  const isAuth = localStorage.getItem("auth");
  return isAuth ? element : <Navigate to="/login" />;
};

function NavBar() {
  const role = localStorage.getItem("role") || "user";
  const login = localStorage.getItem("login") || "";
  const location = useLocation();

  if (location.pathname === "/login") return null;

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("role");
    localStorage.removeItem("login");
    window.location.href = "/login";
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      style={{
        color: location.pathname === to ? "#3b82f6" : "#475569",
        textDecoration: "none",
        padding: "6px 14px",
        borderRadius: "6px",
        background: location.pathname === to ? "#eff6ff" : "transparent",
        fontSize: "14px",
        fontWeight: location.pathname === to ? "600" : "400",
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav
      style={{
        background: "#fff",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <span
        style={{
          color: "#1e293b",
          fontWeight: "700",
          marginRight: "16px",
          fontSize: "15px",
        }}
      >
         Пожарная безопасность
      </span>
      {navLink("/", "Инциденты")}
      {(role === "admin" || role === "user") && navLink("/add", "Добавить")}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
          {login} ·{" "}
          <span style={{ color: role === "admin" ? "#3b82f6" : "#64748b" }}>
            {role}
          </span>
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 14px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            color: "#dc2626",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
          }}
        >
          Выйти
        </button>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
        <NavBar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute element={<Home />} />} />
          <Route path="/detail/:id" element={<PrivateRoute element={<Detail />} />} />
          <Route path="/add" element={<PrivateRoute element={<Form />} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
