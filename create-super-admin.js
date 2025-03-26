const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

async function createSuperAdmin() {
    console.log('Creating super admin user...');
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Connected to database');

        // Super admin credentials
        const username = 'superadmin';
        const password = 'superadmin123';
        const role = 'super_admin';

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);
        console.log('✅ Password hashed');

        // Delete existing super admin if exists
        await connection.execute('DELETE FROM users WHERE username = ?', [username]);
        console.log('✅ Cleaned up any existing super admin user');

        // Create super admin user
        await connection.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );
        console.log('✅ Super admin user created');

        // Create regular admin user as well
        const adminUsername = 'admin';
        const adminPassword = 'admin123';
        const adminHashedPassword = await bcryptjs.hash(adminPassword, saltRounds);

        await connection.execute('DELETE FROM users WHERE username = ?', [adminUsername]);
        await connection.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [adminUsername, adminHashedPassword, 'admin']
        );
        console.log('✅ Regular admin user created');

        // Verify users
        const [users] = await connection.execute('SELECT id, username, role FROM users');
        console.log('\nCreated users:', users);

        await connection.end();
        console.log('\n✅ User setup completed successfully');
        console.log('\nSuper Admin Credentials:');
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('\nRegular Admin Credentials:');
        console.log('Username:', adminUsername);
        console.log('Password:', adminPassword);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

createSuperAdmin(); 