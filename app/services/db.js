// Shared MySQL helper used by the live student/admin routes.
// Route files import this module instead of creating their own
// connections so the app reuses one consistent connection pool.

// Load environment variables from .env before any database config is read
require("dotenv").config();

const mysql = require('mysql2/promise');

// Connection config pulled from environment variables defined in .env / docker-compose.
// Keeping the host/port external makes the same code work for:
// - local Node + Docker MySQL
// - fully containerised runs
// - classroom/dev-machine setups with custom port mapping
const config = {
  db: {
    host: process.env.DB_CONTAINER,       // Docker service name (e.g. "db") or hostname
    port: process.env.DB_PORT,            // MySQL port, default 3306
    user: process.env.MYSQL_ROOT_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 2,                   // Small pool suitable for a low-traffic project
    queueLimit: 0,
  },
};

// Create a shared connection pool so the app reuses connections across requests
const pool = mysql.createPool(config.db);

// Thin wrapper around pool.execute — returns only the row payload so
// route handlers stay focused on page logic instead of driver details.
async function query(sql, params) {
  const [rows, fields] = await pool.execute(sql, params);
  return rows;
}

module.exports = {
  query,
}
