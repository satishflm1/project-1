require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
  let connection;
  
  try {
    // First connect without database
    console.log('Attempting to connect to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD
    });
    
    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    console.log('Creating database...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'bighorn_pos'}`);
    console.log('✅ Database created/verified');

    // Switch to the database
    await connection.execute(`USE ${process.env.DB_NAME || 'bighorn_pos'}`);
    console.log('✅ Using database');

    // Create users table
    console.log('Creating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Check if admin user exists
    const [existingAdmin] = await connection.execute('SELECT id FROM users WHERE username = ?', ['admin']);
    
    if (existingAdmin.length === 0) {
      // Insert admin user if not exists
      console.log('Creating admin user...');
      await connection.execute(`
        INSERT INTO users (username, password, role) 
        VALUES (?, ?, ?)
      `, ['admin', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iq.IX1ZqJ9K6', 'admin']);
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Read and execute SQL file
    const sqlFile = await fs.readFile(path.join(__dirname, 'database.sql'), 'utf8');
    const statements = sqlFile.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log('✅ Database tables and sample data created successfully');

    console.log('\n✅ Database setup completed successfully!');
    console.log('\nYou can now log in with:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Invalid database credentials. Please check your .env file and make sure the password is correct.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Database connection was refused. Make sure MySQL is running (check Windows Services).');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist. Will attempt to create it.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase(); 