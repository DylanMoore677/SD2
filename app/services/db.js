// Load environment variables from .env before any database config is read
require("dotenv").config();

const mysql = require('mysql2/promise');

// Connection config pulled from environment variables defined in .env / docker-compose
const config = {
  db: { /* do not put password or any sensitive info here, done only for demo */
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

// Thin wrapper around pool.execute — returns the rows array directly
// so callers don't need to destructure [rows, fields] every time
async function query(sql, params) {
  const [rows, fields] = await pool.execute(sql, params);
  return rows;
}

module.exports = {
  query,
}
