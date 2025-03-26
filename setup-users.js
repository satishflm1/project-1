require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupUsersTable() {
  let connection;
  
  try {
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS bighorn_pos');
    console.log('✅ Database checked/created');

    // Use the database
    await connection.execute('USE bighorn_pos');

    // Drop existing users table if any
    await connection.execute('DROP TABLE IF EXISTS users');
    console.log('✅ Cleaned up old users table');

    // Create users table
    await connection.execute(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Insert admin user
    await connection.execute(`
      INSERT INTO users (username, password, role) 
      VALUES (?, ?, ?)
    `, ['admin', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iq.IX1ZqJ9K6', 'admin']);
    console.log('✅ Admin user created');

    // Verify the table and admin user
    const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
    if (tables.length > 0) {
      console.log('✅ Users table exists');
      
      const [users] = await connection.execute('SELECT id, username, role FROM users WHERE username = ?', ['admin']);
      if (users.length > 0) {
        console.log('✅ Admin user verified');
        console.log('Admin details:', users[0]);
      }
    }

    console.log('\n✅ Users table setup completed successfully!');
    console.log('\nYou can now log in with:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Invalid database credentials. Please check your .env file.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Database connection was refused. Is MySQL running?');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupUsersTable(); 