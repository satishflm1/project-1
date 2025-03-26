const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'bighorn_pos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

// Test the connection immediately
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    console.log('Connected as:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    // Test if we can query
    const [result] = await connection.query('SELECT 1');
    console.log('✅ Database query successful');
    
    connection.release();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('Connection details:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      // Not logging password for security
    });
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('The provided MySQL credentials are incorrect. Please verify your password.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('Could not connect to MySQL server. Please verify it is running.');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist. Please run setup-db.js first.');
    }
  }
};

testConnection();

module.exports = pool; 