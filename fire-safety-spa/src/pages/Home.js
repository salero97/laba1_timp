import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/incidents");
      setIncidents(response.data);
    } catch (e) {
      setError("Ошибка загрузки данных с сервера");
      console.error("Ошибка запроса:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteIncident = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/incidents/${id}`);
      setIncidents((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error("Ошибка удаления:", e);
      alert("Не удалось удалить инцидент");
    }
  };

  if (loading) {
    return <div>Загрузка списка инцидентов...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Список инцидентов пожара</h1>
      {incidents.length === 0 && <p>Инцидентов пока нет.</p>}
      <ul>
        {incidents.map((item) => (
          <li key={item.id}>
            <Link to={`/detail/${item.id}`}>
              {item.zone} – {item.severity} – {item.status}
            </Link>
            <button
              onClick={() => deleteIncident(item.id)}
              style={{ marginLeft: "10px" }}
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
      <Link to="/add">Добавить инцидент</Link>
    </div>
  );
};

export default Home;
