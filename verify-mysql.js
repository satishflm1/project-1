const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyMySQL() {
    console.log('Verifying MySQL connection...');
    console.log('Connection details:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME
    });

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Successfully connected to MySQL');
        
        // Check if database exists
        const [rows] = await connection.execute('SHOW DATABASES');
        const databases = rows.map(row => row.Database);
        console.log('Available databases:', databases);

        // Check if our database exists
        if (databases.includes(process.env.DB_NAME)) {
            console.log(`✅ Database ${process.env.DB_NAME} exists`);
            
            // Check users table
            const [users] = await connection.execute('SELECT * FROM users');
            console.log('Users in database:', users);
        } else {
            console.log(`❌ Database ${process.env.DB_NAME} does not exist`);
        }

        await connection.end();
    } catch (error) {
        console.error('❌ MySQL connection error:', error.message);
        console.error('Full error:', error);
    }
}

verifyMySQL(); 