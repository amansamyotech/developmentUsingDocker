import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pkg from "pg";
import { createClient } from "redis"; // ✅ Added

const { Pool } = pkg;

// Load env file dynamically
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

const app = express();
app.use(cors());
app.use(express.json());

// --- PostgreSQL setup ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- ✅ Redis setup ---
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

await redisClient.connect();

// --- Routes ---
app.get("/v1/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

app.get("/v1/test", (req, res) => {
  res.json({ status: "ok", message: "server is running fine" });
});

// --- DB test route with caching ---
app.get("/v1/db", async (req, res) => {
  try {
    const cacheKey = "db:time";
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("✅ Redis cache hit");
      return res.json({ success: true, fromCache: true, time: cached });
    }

    console.log("❌ Cache miss → querying Postgres...");
    const result = await pool.query("SELECT NOW()");
    const now = result.rows[0].now;

    await redisClient.setEx(cacheKey, 10, now); // cache for 10s
    res.json({ success: true, fromCache: false, time: now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
