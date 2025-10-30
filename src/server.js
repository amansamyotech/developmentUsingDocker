import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

// Load env file dynamically
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// health route
app.get("/v1/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

// test DB route
app.get("/v1/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
