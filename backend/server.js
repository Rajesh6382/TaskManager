require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// PostgreSQL Connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Check if the database is connected
pool.connect((err, client, release) => {
    if (err) {
        console.error(" Database connection failed:", err.stack);
    } else {
        console.log(" Database connected successfully!");
        release(); // Release the client
    }
});

// Middleware
app.use(cors());
app.use(express.json());

//  POST /task - Add a new task
app.post("/task", async (req, res) => {
    try {
        const { description } = req.body;
        const result = await pool.query(
            "INSERT INTO task (description, completed) VALUES ($1, $2) RETURNING *",
            [description, false]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

//  GET /task - Get all tasks
app.get("/task", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM task ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

//  PUT /task/:id - Mark a task as done
app.put("/task/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE task SET completed = TRUE WHERE id = $1 RETURNING *",
            [id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

//  DELETE /task/:id - Delete a task
app.delete("/task/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM task WHERE id = $1", [id]);
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});
