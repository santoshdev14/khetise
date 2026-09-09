import pg from "pg";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from server folder
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

// Ensure uploads folder exists in server
const uploadsDir = path.join(__dirname, "uploads/product-images");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Parse PostgreSQL numeric and bigint types to standard JavaScript numbers
pg.types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val))); // NUMERIC / DECIMAL
pg.types.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10)));  // BIGINT / INT8 / COUNT(*)

// Dynamic SSL detection for CockroachDB and production PostgreSQL
const requiresSsl =
  process.env.NODE_ENV === "production" ||
  (process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.includes("cockroachlabs.cloud") ||
      process.env.DATABASE_URL.includes("sslmode=require") ||
      process.env.DATABASE_URL.includes("sslmode=verify-full")));

const sslConfig = requiresSsl ? { rejectUnauthorized: false } : false;

// Configure PostgreSQL connection pool
export const pool = new pg.Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: sslConfig
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432", 10),
        database: process.env.DB_NAME || "test_db",
        user: process.env.DB_USER || "postgres",
        password: String(process.env.DB_PASSWORD || "123456"),
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: sslConfig
      }
);

pool.on("connect", () => {
  // Client connected to PostgreSQL pool
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err.message);
});

/**
 * Universal query runner for PostgreSQL
 * Converts '?' placeholders to '$1, $2...'
 * Automatically appends 'RETURNING *' to INSERT statements if not present
 */
export async function query(sql, params = []) {
  let index = 1;
  let pgSql = sql.replace(/\?/g, () => `$${index++}`);

  // If it's an INSERT statement without RETURNING, append RETURNING * so result[0] has ID and row fields
  const trimmed = pgSql.trim();
  if (
    trimmed.toUpperCase().startsWith("INSERT INTO") &&
    !trimmed.toUpperCase().includes("RETURNING")
  ) {
    pgSql = `${trimmed} RETURNING *`;
  }

  const res = await pool.query(pgSql, params);
  return res.rows;
}

/**
 * Verify PostgreSQL Database Connection & Initialize Tables
 */
export async function initDb() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected successfully. Server time:", res.rows[0]?.now);

    // Ensure admin_otps table exists for email OTP verification
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_otps (
        id SERIAL PRIMARY KEY,
        admin_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        purpose VARCHAR(50) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error("❌ PostgreSQL Connection Failed:", err.message);
    throw err;
  }
}

export default pool;
