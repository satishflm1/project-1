const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    console.log('Setting up database...');
    
    try {
        // First connect without database to create it
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('✅ Connected to MySQL');

        // Create database if not exists
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`✅ Database ${process.env.DB_NAME} created or already exists`);

        // Use the database
        await connection.execute(`USE ${process.env.DB_NAME}`);

        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('super_admin', 'admin', 'staff') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created');

        // Create tables table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS tables (
                id INT PRIMARY KEY AUTO_INCREMENT,
                table_number VARCHAR(10) UNIQUE NOT NULL,
                capacity INT NOT NULL,
                status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tables table created');

        // Create categories table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(50) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Categories table created');

        // Create dishes table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS dishes (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category_id INT,
                is_available BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
        `);
        console.log('✅ Dishes table created');

        // Create orders table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                table_id INT,
                customer_name VARCHAR(100),
                order_type ENUM('dine_in', 'takeaway') NOT NULL,
                status ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
                total_amount DECIMAL(10,2) NOT NULL,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (table_id) REFERENCES tables(id),
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);
        console.log('✅ Orders table created');

        // Create order_items table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT NOT NULL,
                dish_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (dish_id) REFERENCES dishes(id)
            )
        `);
        console.log('✅ Order items table created');

        await connection.end();
        console.log('\n✅ Database setup completed successfully');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

setupDatabase(); 