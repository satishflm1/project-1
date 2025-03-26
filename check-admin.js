const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAdminUser() {
    console.log('Checking admin user...');
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

        // Check users table
        const [users] = await connection.execute('SELECT * FROM users');
        console.log('\nAll users in database:', users);

        // Check specifically for admin user
        const [adminUser] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            ['admin']
        );
        console.log('\nAdmin user details:', adminUser);

        // Check if password is properly hashed
        if (adminUser.length > 0) {
            const admin = adminUser[0];
            console.log('\nPassword hash details:', {
                hashLength: admin.password.length,
                hashPrefix: admin.password.substring(0, 7)
            });
        }

        await connection.end();
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

checkAdminUser(); 