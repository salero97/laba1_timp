import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const PAGE_SIZE = 50;

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

const Journal = () => {
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
      setError(
        e.response ? `Ошибка загрузки: ${e.response.status}` : "Сервер недоступен"
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (role !== "admin") return;

    loadMore();

    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [role]);

  if (role !== "admin") {
    return (
      <div style={{ padding: "24px", color: "#dc2626" }}>
        Журнал доступен только администратору
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div style={{ padding: "24px", color: "#94a3b8" }}>
        Загрузка журнала...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", color: "#dc2626" }}>
        {error}
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div style={{ padding: "24px", color: "#94a3b8" }}>
        Журнал пуст
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <h2 style={{ color: "#1e293b", marginBottom: "20px" }}>Журнал действий</h2>
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          border: "1px solid #e2e8f0",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}
        >
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <th
                style={{
                  color: "#64748b",
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                #
              </th>
              <th
                style={{
                  color: "#64748b",
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                Время
              </th>
              <th
                style={{
                  color: "#64748b",
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                Кто информировал
              </th>
              <th
                style={{
                  color: "#64748b",
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                Зона
              </th>
              <th
                style={{
                  color: "#64748b",
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                Тип
              </th>
              <th
                style={{
                  color: "#64748b",
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                Уровень
              </th>
              <th
                style={{
                  color: "#64748b",
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                Статус
              </th>
              <th
                style={{
                  color: "#64748b",
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                Описание
              </th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((item, idx) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  background: idx % 2 === 0 ? "#fff" : "#fafafa",
                }}
              >
                <td style={{ color: "#94a3b8", padding: "10px 16px" }}>
                  {item.id}
                </td>
                <td
                  style={{
                    color: "#64748b",
                    padding: "10px 16px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDateTime(item.reported_at)}
                </td>
                <td
                  style={{
                    color: "#1e293b",
                    padding: "10px 16px",
                    fontWeight: "500",
                  }}
                >
                  {item.reported_by}
                </td>
                <td style={{ color: "#475569", padding: "10px 16px" }}>
                  {item.zone}
                </td>
                <td style={{ color: "#64748b", padding: "10px 16px" }}>
                  {item.incident_type}
                </td>
                <td style={{ color: "#64748b", padding: "10px 16px" }}>
                  {item.severity}
                </td>
                <td style={{ color: "#64748b", padding: "10px 16px" }}>
                  {item.status}
                </td>
                <td
                  style={{
                    color: "#64748b",
                    padding: "10px 16px",
                    maxWidth: "260px",
                  }}
                >
                  {item.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div style={{ padding: "12px", color: "#94a3b8", fontSize: "13px" }}>
          Загрузка ещё...
        </div>
      )}
      {!hasMore && incidents.length > 0 && (
        <div style={{ padding: "12px", color: "#cbd5e1", fontSize: "13px" }}>
          Все записи журнала загружены
        </div>
      )}
    </div>
  );
};

export default Journal;
