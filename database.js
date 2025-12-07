const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create optimized connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  maxIdle: 10,
  idleTimeout: 60000,
  timezone: '+00:00'
});

// Create connection promise wrapper
const promisePool = pool.promise();

// Test database connection
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Execute query helper
const query = async (sql, values) => {
  try {
    const [rows] = await promisePool.query(sql, values);
    return rows;
  } catch (error) {
    throw error;
  }
};

// Execute query with fields
const queryWithFields = async (sql, values) => {
  try {
    const [rows, fields] = await promisePool.query(sql, values);
    return { rows, fields };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  pool: promisePool,
  query,
  queryWithFields,
  testConnection
};