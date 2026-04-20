import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Form = () => {
  const [zone, setZone] = useState("");
  const [severity, setSeverity] = useState("INFO");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!zone.trim()) {
      alert("Зона не должна быть пустой");
      return;
    }

    const newIncident = {
      zone,
      severity,
      status: "ACTIVE",
      description
    };

    try {
      await axios.post("http://localhost:5000/incidents", newIncident);
      navigate("/");
    } catch (e) {
      console.error("Ошибка создания:", e);
      alert("Не удалось создать инцидент");
    }
  };

  return (
    <div>
      <h1>Добавление инцидента</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Зона:
          <input
            type="text"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="Пример: Этаж 3, коридор"
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
          Описание:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Краткое описание ситуации"
          />
        </label>
        <br />
        <button type="submit">Сохранить</button>
      </form>
    </div>
  );
};

export default Form;
