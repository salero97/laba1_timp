import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const USERS = [
  { login: "admin",     password: "admin",    role: "admin" },
  { login: "observer1", password: "ivanov",    role: "user"  },
  { login: "observer2", password: "ilyushin",  role: "user"  },
  { login: "observer3", password: "petrov",    role: "user"  },
  { login: "observer4", password: "sidorov",   role: "user"  },
  { login: "observer5", password: "kuznetsov", role: "user"  },
];

function checkLogin(login, password) {
  const user = USERS.find(
    (u) => u.login === login && u.password === password
  );
  return user ? user.role : null;
}

function getPublicUsers() {
  return USERS.filter((u) => u.login !== "admin").map(({ login, password }) => ({
    login,
    password,
  }));
}

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const publicUsers = getPublicUsers();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) {
      setError("Логин и пароль не должны быть пустыми");
      return;
    }
    const role = checkLogin(login, password);
    if (!role) {
      setError("Неверный логин или пароль");
      return;
    }
    localStorage.setItem("auth", "true");
    localStorage.setItem("role", role);
    localStorage.setItem("login", login);
    navigate("/");
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#1e293b",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  };

  const labelStyle = {
    color: "#475569",
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "500",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "12px",
          width: "420px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          border: "1px solid #e2e8f0",
        }}
      >
        <h1
          style={{
            color: "#1e293b",
            textAlign: "center",
            marginBottom: "4px",
            fontSize: "22px",
          }}
        >
          Система безопасности
        </h1>
        <p
          style={{
            color: "#94a3b8",
            textAlign: "center",
            marginBottom: "28px",
            fontSize: "14px",
          }}
        >
          Войдите в систему
        </p>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              padding: "10px 14px",
              color: "#dc2626",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Логин</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#3b82f6",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Войти
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <p
            style={{
              color: "#64748b",
              marginBottom: "10px",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            Учётные записи наблюдателей:
          </p>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    color: "#475569",
                    textAlign: "left",
                    paddingBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Логин
                </th>
                <th
                  style={{
                    color: "#475569",
                    textAlign: "left",
                    paddingBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Пароль
                </th>
              </tr>
            </thead>
            <tbody>
              {publicUsers.map((u) => (
                <tr key={u.login}>
                  <td
                    style={{
                      color: "#1e293b",
                      padding: "3px 0",
                      fontWeight: "500",
                    }}
                  >
                    {u.login}
                  </td>
                  <td style={{ color: "#64748b", padding: "3px 0" }}>
                    {u.password}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Login;
