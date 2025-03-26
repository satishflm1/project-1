const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdminUser() {
    console.log('Resetting admin user...');
    console.log('Connection details:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        hasPassword: !!process.env.DB_PASSWORD
    });
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Connected to database');

        // Hash the password
        const password = 'admin123';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('✅ Password hashed:', {
            originalPassword: password,
            hashLength: hashedPassword.length,
            hashPrefix: hashedPassword.substring(0, 7)
        });

        // Delete existing admin user
        await connection.execute('DELETE FROM users WHERE username = ?', ['admin']);
        console.log('✅ Deleted existing admin user');

        // Insert new admin user
        await connection.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            ['admin', hashedPassword, 'admin']
        );
        console.log('✅ Created new admin user');

        // Verify the new admin user
        const [adminUser] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            ['admin']
        );
        console.log('\nNew admin user details:', adminUser);

        await connection.end();
        console.log('\n✅ Admin user reset complete');
        console.log('You can now log in with:');
        console.log('Username: admin');
        console.log('Password: admin123');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n⚠️ Database access denied. Please check your credentials in .env file');
            console.log('Current credentials:', {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                database: process.env.DB_NAME
            });
        }
    }
}

resetAdminUser(); 