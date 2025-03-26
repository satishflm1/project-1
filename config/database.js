const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '603035',
    database: process.env.DB_NAME || 'dragon',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connection successful');
        console.log('Connected as:', connection.config.user);
        console.log('Database:', connection.config.database);
        console.log('Host:', connection.config.host);
        console.log('Port:', connection.config.port);
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection error:');
        console.log('Connection details:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            port: 3306
        });
        console.error('Could not connect to MySQL server. Please verify it is running.');
        console.error('❌ Error connecting to the database:', err);
        process.exit(1); // Exit if database connection fails
    });

module.exports = pool; 