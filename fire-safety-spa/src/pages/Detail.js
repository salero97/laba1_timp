import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const validateDateTime = (value) => {
  const re = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/;
  const match = value.match(re);
  if (!match) return null;

  const [, dd, mm, yyyy, hh, min] = match;
  const d = parseInt(dd, 10);
  const m = parseInt(mm, 10);
  const y = parseInt(yyyy, 10);
  const h = parseInt(hh, 10);
  const mn = parseInt(min, 10);

  if (d < 1 || d > 31 || m < 1 || m > 12 || h < 0 || h > 23 || mn < 0 || mn > 59) {
    return null;
  }

  return `${y}-${mm}-${dd} ${hh}:${min}:00`;
};

const formatFromIso = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
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
};

const selectStyle = { ...inputStyle };
const labelStyle = {
  color: "#475569",
  display: "block",
  marginBottom: "6px",
  fontSize: "14px",
  fontWeight: "500",
};

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "user";
  const login = localStorage.getItem("login") || "unknown";

  const [zone, setZone] = useState("");
  const [severity, setSeverity] = useState("INFO");
  const [status, setStatus] = useState("ACTIVE");
  const [incidentType, setIncidentType] = useState("FIRE");
  const [reportedBy, setReportedBy] = useState("");
  const [reportedAt, setReportedAt] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    const loadItem = async () => {
      try {
        const response = await axios.get(`/incidents/${id}`);
        const data = response.data;
        setZone(data.zone || "");
        setSeverity(data.severity || "INFO");
        setStatus(data.status || "ACTIVE");
        setIncidentType(data.incident_type || "FIRE");
        setReportedBy(data.reported_by || "");
        setReportedAt(formatFromIso(data.reported_at));
        setDescription(data.description || "");
      } catch (e) {
        setError(
          e.response?.status === 404
            ? "Инцидент не найден (404)"
            : "Ошибка загрузки"
        );
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!zone.trim()) {
      setValidationError("Поле «Зона» не должно быть пустым");
      return;
    }
    if (!reportedBy.trim()) {
      setValidationError("Поле «Кто информирует» не должно быть пустым");
      return;
    }
    if (!description.trim()) {
      setValidationError("Поле «Описание» не должно быть пустым");
      return;
    }
    const isoReportedAt = validateDateTime(reportedAt);
    if (!isoReportedAt) {
      setValidationError("Время должно быть в формате ДД.ММ.ГГГГ ЧЧ:ММ");
      return;
    }
    setValidationError("");

    try {
      await axios.put(
        `/incidents/${id}`,
        {
          zone: zone.trim(),
          severity,
          status,
          description: description.trim(),
          incident_type: incidentType,
          reported_by: reportedBy.trim(),
          reported_at: isoReportedAt,
        },
        { headers: { "x-user": login } }
      );
      navigate("/");
    } catch (e) {
      setValidationError(
        e.response?.status === 404
          ? "Инцидент не найден (404)"
          : "Ошибка сервера"
      );
    }
  };

  if (role !== "admin") {
    return (
      <div style={{ padding: "24px", color: "#dc2626" }}>
        Редактирование доступно только администратору
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "24px", color: "#94a3b8" }}>Загрузка...</div>
    );
  }

  if (error) {
    return <div style={{ padding: "24px", color: "#dc2626" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "28px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          border: "1px solid #e2e8f0",
        }}
      >
        <h2 style={{ color: "#1e293b", marginBottom: "24px" }}>
          Редактирование инцидента #{id}
        </h2>
        {validationError && (
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
            {validationError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Зона</label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Кто информирует</label>
            <input
              type="text"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Уровень опасности</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              style={selectStyle}
            >
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={selectStyle}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="LOCALIZED">LOCALIZED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Тип инцидента</label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              style={selectStyle}
            >
              <option value="FIRE">FIRE</option>
              <option value="SMOKE">SMOKE</option>
              <option value="ALARM">ALARM</option>
              <option value="TEST">TEST</option>
            </select>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Время сообщения (ДД.ММ.ГГГГ ЧЧ:ММ)</label>
            <input
              type="text"
              value={reportedAt}
              onChange={(e) => setReportedAt(e.target.value)}
              placeholder="16.05.2026 21:40"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "12px 28px",
              background: "#3b82f6",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: "600",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
};

export default Detail;
