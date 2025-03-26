require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDatabase() {
  let connection;
  
  try {
    // First try to connect without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    console.log('✅ Successfully connected to MySQL server');

    // Check if database exists
    const [rows] = await connection.execute('SHOW DATABASES LIKE ?', ['bighorn_pos']);
    if (rows.length > 0) {
      console.log('✅ Database "bighorn_pos" exists');
      
      // Connect to the database
      await connection.changeUser({ database: 'bighorn_pos' });
      
      // Check tables
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('\nTables in database:');
      tables.forEach(table => {
        console.log(`- ${Object.values(table)[0]}`);
      });

      // Check admin user
      const [users] = await connection.execute('SELECT id, username, role FROM users WHERE username = ?', ['admin']);
      if (users.length > 0) {
        console.log('\n✅ Admin user exists');
        console.log('Admin details:', users[0]);
      } else {
        console.log('\n❌ Warning: Admin user not found');
      }

      // Check sample data
      const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
      const [tables_count] = await connection.execute('SELECT COUNT(*) as count FROM tables');
      const [taxes] = await connection.execute('SELECT COUNT(*) as count FROM taxes');

      console.log('\nSample data status:');
      console.log(`- Categories: ${categories[0].count} entries`);
      console.log(`- Tables: ${tables_count[0].count} entries`);
      console.log(`- Taxes: ${taxes[0].count} entries`);

    } else {
      console.log('❌ Database "bighorn_pos" does not exist');
    }
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

checkDatabase(); 