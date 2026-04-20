import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [zone, setZone] = useState("");
  const [severity, setSeverity] = useState("INFO");
  const [status, setStatus] = useState("ACTIVE");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/incidents/${id}`
        );
        const data = response.data;
        setZone(data.zone || "");
        setSeverity(data.severity || "INFO");
        setStatus(data.status || "ACTIVE");
        setDescription(data.description || "");
      } catch (e) {
        setError("Ошибка загрузки инцидента");
        console.error("Ошибка загрузки:", e);
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedIncident = {
      zone,
      severity,
      status,
      description
    };

    try {
      await axios.put(
        `http://localhost:5000/incidents/${id}`,
        updatedIncident
      );
      navigate("/");
    } catch (e) {
      console.error("Ошибка обновления:", e);
      alert("Не удалось обновить инцидент");
    }
  };

  if (loading) return <div>Загрузка данных инцидента...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Редактирование инцидента</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Зона:
          <input
            type="text"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Уровень опасности:
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </label>
        <br />
        <label>
          Статус:
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="LOCALIZED">LOCALIZED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </label>
        <br />
        <label>
          Описание:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Сохранить</button>
      </form>
    </div>
  );
};

export default Detail;
