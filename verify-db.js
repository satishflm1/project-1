require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function verifyDatabase() {
  let connection;
  try {
    // Connect to MySQL with the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Connected to database successfully');

    // Check if users table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      console.log('❌ Users table does not exist');
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
      console.log('✅ Created users table');
    } else {
      console.log('✅ Users table exists');
    }

    // Check admin user
    const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    if (users.length === 0) {
      console.log('❌ Admin user does not exist');
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('✅ Created admin user');
    } else {
      console.log('✅ Admin user exists');
      console.log('Admin user details:', {
        id: users[0].id,
        username: users[0].username,
        role: users[0].role
      });
      
      // Test password verification
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, users[0].password);
      console.log('Password verification test:', isValid ? '✅ Valid' : '❌ Invalid');
      
      if (!isValid) {
        console.log('Resetting admin password...');
        const newHashedPassword = await bcrypt.hash('admin123', 10);
        await connection.execute(
          'UPDATE users SET password = ? WHERE username = ?',
          [newHashedPassword, 'admin']
        );
        console.log('✅ Admin password reset');
      }
    }

    console.log('\nYou can now log in with:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyDatabase(); 