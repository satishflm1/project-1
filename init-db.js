const db = require('./config/database');

async function initializeDatabase() {
    try {
        // Drop existing tables in correct order
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('DROP TABLE IF EXISTS order_items');
        await db.query('DROP TABLE IF EXISTS orders');
        await db.query('DROP TABLE IF EXISTS tables');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        // Create tables table
        await db.query(`
            CREATE TABLE tables (
                id INT PRIMARY KEY AUTO_INCREMENT,
                table_number VARCHAR(10) NOT NULL UNIQUE,
                capacity INT NOT NULL,
                status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create orders table
        await db.query(`
            CREATE TABLE orders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                table_id INT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (table_id) REFERENCES tables(id)
            )
        `);

        // Create order_items table
        await db.query(`
            CREATE TABLE order_items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT NOT NULL,
                dish_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )
        `);

        // Insert sample tables
        await db.query(`
            INSERT INTO tables (table_number, capacity, status) VALUES
            ('T1', 4, 'available'),
            ('T2', 6, 'available'),
            ('T3', 4, 'available'),
            ('T4', 8, 'available')
        `);

        console.log('Database initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase(); 