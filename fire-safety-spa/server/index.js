const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Список инцидентов с пагинацией
app.get("/incidents", async (req, res) => {
  try {
    const offset = parseInt(req.query.offset, 10);
    const limit = parseInt(req.query.limit, 10);

    const safeOffset = Number.isNaN(offset) || offset < 0 ? 0 : offset;
    const safeLimit =
      Number.isNaN(limit) || limit <= 0 || limit > 1000 ? 1000 : limit;

    const result = await pool.query(
      "SELECT * FROM incidents ORDER BY id LIMIT $1 OFFSET $2",
      [safeLimit, safeOffset]
    );

    res.json(result.rows);
  } catch (e) {
    console.error("GET /incidents error:", e);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Один инцидент по id
app.get("/incidents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM incidents WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Инцидент не найден" });
    }

    res.json(result.rows[0]);
  } catch (e) {
    console.error("GET /incidents/:id error:", e);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Создание инцидента
app.post("/incidents", async (req, res) => {
  try {
    const {
      zone,
      severity,
      status,
      description,
      incident_type,
      reported_at,
    } = req.body;

    // Явно читаем reported_by, без танцев с trim и null
    const reported_by = req.body.reported_by || "";

    console.log("POST /incidents body:", req.body);
    console.log("reported_by value to insert:", reported_by);

    const result = await pool.query(
      `INSERT INTO incidents
       (zone, severity, status, description, incident_type, reported_at, reported_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [zone, severity, status, description, incident_type, reported_at, reported_by]
    );

    console.log("Inserted row:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (e) {
    console.error("POST /incidents error:", e);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Обновление инцидента
app.put("/incidents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      zone,
      severity,
      status,
      description,
      incident_type,
      reported_at,
    } = req.body;
    const reported_by = req.body.reported_by || "";

    const result = await pool.query(
      `UPDATE incidents
       SET zone = $1,
           severity = $2,
           status = $3,
           description = $4,
           incident_type = $5,
           reported_at = $6,
           reported_by = $7
       WHERE id = $8
       RETURNING *`,
      [zone, severity, status, description, incident_type, reported_at, reported_by, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Инцидент не найден" });
    }

    res.json(result.rows[0]);
  } catch (e) {
    console.error("PUT /incidents/:id error:", e);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Удаление инцидента
app.delete("/incidents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await pool.query("SELECT * FROM incidents WHERE id = $1", [
      id,
    ]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Инцидент не найден" });
    }

    const incident = existing.rows[0];
    await pool.query("DELETE FROM incidents WHERE id = $1", [id]);

    res.json(incident);
  } catch (e) {
    console.error("DELETE /incidents/:id error:", e);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.listen(5000, () => {
  console.log("Сервер запущен на http://localhost:5000");
});
