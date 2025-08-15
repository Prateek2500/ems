import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // up to 10 simultaneous connections
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection pool error:", err);
  } else {
    console.log("✅ Connected to Clever Cloud MySQL database (Pool Ready).");
    connection.release();
  }
});

export default pool;
