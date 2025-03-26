require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function checkUsers() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'bighorn_pos'
    });
    
    console.log('✅ Connected to database');

    // Check users table
    const [users] = await connection.execute('SELECT * FROM users');
    console.log('\nUsers in database:', users.length);
    
    // Check admin user specifically
    const [adminUser] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (adminUser.length > 0) {
      console.log('\nAdmin user found:');
      console.log('Username:', adminUser[0].username);
      console.log('Role:', adminUser[0].role);
      
      // Test if password matches
      const testPassword = 'admin123';
      const passwordMatch = await bcrypt.compare(testPassword, adminUser[0].password);
      console.log('\nPassword test (admin123):', passwordMatch ? '✅ Valid' : '❌ Invalid');
    } else {
      console.log('\n❌ Admin user not found');
      
      // Create admin user
      console.log('\nCreating new admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('✅ Admin user created');
      console.log('\nYou can now log in with:');
      console.log('Username: admin');
      console.log('Password: admin123');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUsers(); 