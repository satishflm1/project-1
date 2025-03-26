const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkMySQLConnection() {
    console.log('Checking MySQL connection...');
    console.log('Connection details:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        hasPassword: !!process.env.DB_PASSWORD
    });

    try {
        // First try without database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('✅ Successfully connected to MySQL server');
        
        // Try to create database
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`✅ Database ${process.env.DB_NAME} created or already exists`);
        
        // Switch to the database
        await connection.execute(`USE ${process.env.DB_NAME}`);
        console.log('✅ Successfully switched to database');

        await connection.end();
        console.log('✅ Connection test completed successfully');
    } catch (error) {
        console.error('❌ MySQL connection error:', error.message);
        console.error('Error code:', error.code);
        console.error('Error number:', error.errno);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\nTroubleshooting steps:');
            console.log('1. Verify MySQL is running');
            console.log('2. Try these commands in MySQL command line:');
            console.log('   ALTER USER \'root\'@\'localhost\' IDENTIFIED WITH mysql_native_password BY \'\';');
            console.log('   FLUSH PRIVILEGES;');
            console.log('3. Or set a new root password:');
            console.log('   ALTER USER \'root\'@\'localhost\' IDENTIFIED WITH mysql_native_password BY \'your_new_password\';');
            console.log('   FLUSH PRIVILEGES;');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\nTroubleshooting steps:');
            console.log('1. Make sure MySQL server is running');
            console.log('2. Check MySQL service in Windows Services');
            console.log('3. Try restarting MySQL service');
        }
    }
}

checkMySQLConnection(); 