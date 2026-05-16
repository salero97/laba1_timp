import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const PAGE_SIZE = 10;
const severityColor = { INFO: "#3b82f6", WARNING: "#f59e0b", CRITICAL: "#ef4444" };
const statusColor = { ACTIVE: "#ef4444", LOCALIZED: "#f59e0b", CLOSED: "#22c55e" };

const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  const pad = (n) => (n < 10 ? "0" + n : "" + n);

  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());

  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
};

const Home = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const role = localStorage.getItem("role") || "user";

  const loadMore = async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const response = await axios.get(
        `/incidents?offset=${offsetRef.current}&limit=${PAGE_SIZE}`
      );
      const data = response.data || [];
      if (data.length < PAGE_SIZE) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
      offsetRef.current += data.length;
      setIncidents((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        return [...prev, ...data.filter((i) => !existingIds.has(i.id))];
      });
    } catch (e) {
      setError(e.response ? `Ошибка: ${e.response.status}` : "Сервер недоступен");
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadMore();
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить инцидент?")) return;
    try {
      await axios.delete(`/incidents/${id}`);
      setIncidents((prev) => prev.filter((item) => item.id !== id));
      offsetRef.current = Math.max(0, offsetRef.current - 1);
    } catch (e) {
      alert("Ошибка при удалении");
    }
  };

  if (initialLoading)
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
        Загрузка...
      </div>
    );

  if (error)
    return (
      <div style={{ padding: "24px", color: "#dc2626" }}>
        {error}
      </div>
    );

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "#1e293b", margin: 0 }}>Инциденты</h2>
        {(role === "admin" || role === "user") && (
          <Link
            to="/add"
            style={{
              padding: "10px 20px",
              background: "#3b82f6",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            + Добавить
          </Link>
        )}
      </div>

      {incidents.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#94a3b8",
            marginTop: "60px",
            fontSize: "16px",
          }}
        >
          Инцидентов пока нет
        </div>
      ) : (
        <div>
          {incidents.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#fff",
                borderRadius: "10px",
                padding: "16px 20px",
                marginBottom: "12px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                border: "1px solid #e2e8f0",
                borderLeftWidth: "4px",
                borderLeftColor: severityColor[item.severity] || "#94a3b8",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      color: "#1e293b",
                      fontWeight: "700",
                      fontSize: "15px",
                    }}
                  >
                    #{item.id} {item.zone}
                  </span>
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: "20px",
                      background:
                        (severityColor[item.severity] || "#94a3b8") + "20",
                      color: severityColor[item.severity] || "#94a3b8",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {item.severity}
                  </span>
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: "20px",
                      background:
                        (statusColor[item.status] || "#94a3b8") + "20",
                      color: statusColor[item.status] || "#94a3b8",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {item.status}
                  </span>
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: "20px",
                      background: "#f1f5f9",
                      color: "#64748b",
                      fontSize: "12px",
                    }}
                  >
                    {item.incident_type}
                  </span>
                </div>
                {role === "admin" && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link
                      to={`/detail/${item.id}`}
                      style={{
                        padding: "6px 14px",
                        background: "#eff6ff",
                        color: "#3b82f6",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      Редактировать
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        padding: "6px 14px",
                        background: "#fef2f2",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
              <p
                style={{
                  color: "#475569",
                  margin: "10px 0 6px",
                  fontSize: "14px",
                }}
              >
                {item.description}
              </p>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "12px",
                  margin: 0,
                }}
              >
                Сообщил:{" "}
                <span
                  style={{
                    color: "#64748b",
                    fontWeight: "500",
                  }}
                >
                  {item.reported_by}
                </span>{" "}
                · {formatDateTime(item.reported_at)}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "16px" }}>
          Загрузка ещё...
        </div>
      )}
      {!hasMore && incidents.length > 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#cbd5e1",
            padding: "16px",
            fontSize: "13px",
          }}
        >
          Все инциденты загружены
        </div>
      )}
    </div>
  );
};

export default Home;
