import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const validateDateTime = (value) => {
  // Исправленное регулярное выражение: без двойных слешей
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

const getDefaultReportedAt = () => {
  const d = new Date();
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

const Form = () => {
  const [zone, setZone] = useState("");
  const [severity, setSeverity] = useState("INFO");
  const [status, setStatus] = useState("ACTIVE");
  const [incidentType, setIncidentType] = useState("FIRE");
  const [reportedAt, setReportedAt] = useState(getDefaultReportedAt());
  const [reportedBy, setReportedBy] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "user";

  if (role !== "admin" && role !== "user") {
    return (
      <div style={{ padding: "24px", color: "#dc2626" }}>
        Добавление инцидентов доступно только авторизованным пользователям
      </div>
    );
  }

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
      setValidationError("Время сообщения должно быть в формате ДД.ММ.ГГГГ ЧЧ:ММ");
      return;
    }

    setValidationError("");
    setError("");

    const newIncident = {
      zone: zone.trim(),
      severity,
      status,
      description: description.trim(),
      incident_type: incidentType,
      reported_by: reportedBy.trim(),
      reported_at: isoReportedAt,
    };

    try {
      await axios.post("/incidents", newIncident);
      navigate("/");
    } catch (e) {
      if (e.response) {
        if (e.response.status === 500) {
          setError("Ошибка сервера (500). Попробуйте позже");
        } else {
          setError(`Ошибка: ${e.response.status}`);
        }
      } else {
        setError("Сервер недоступен. Проверьте, запущен ли Express-сервер");
      }
    }
  };

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
        <h2 style={{ color: "#1e293b", marginBottom: "20px" }}>
          Добавление инцидента
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

export default Form;
