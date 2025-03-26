-- Use existing dragon database
USE dragon;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS dishes;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS taxes;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS payments;

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tables table
CREATE TABLE tables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    number VARCHAR(10) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create dishes table
CREATE TABLE dishes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category_id INT,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Create taxes table
CREATE TABLE taxes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tax_name VARCHAR(50) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_id INT,
    customer_name VARCHAR(100),
    order_type ENUM('dine_in', 'takeaway') NOT NULL,
    status ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create order_items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    dish_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (dish_id) REFERENCES dishes(id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Insert initial admin user (password: admin123)
INSERT INTO users (username, password, role) VALUES 
('admin', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iq.IX1ZqJ9K6', 'admin');

-- Insert sample categories
INSERT INTO categories (name) VALUES 
('Appetizers'),
('Main Course'),
('Desserts'),
('Beverages');

-- Insert sample dishes
INSERT INTO dishes (name, category_id, price, description, available) VALUES 
-- Appetizers
('Spring Rolls', 1, 199.00, 'Crispy vegetable rolls served with sweet chili sauce', true),
('Chicken Wings', 1, 299.00, 'Spicy chicken wings with blue cheese dip', true),
('Bruschetta', 1, 249.00, 'Toasted bread with tomatoes, garlic, and basil', true),

-- Main Course
('Grilled Salmon', 2, 599.00, 'Fresh salmon with seasonal vegetables', true),
('Beef Tenderloin', 2, 799.00, 'Premium beef with mushroom sauce', true),
('Vegetable Curry', 2, 399.00, 'Mixed vegetables in coconut curry sauce', true),

-- Desserts
('Chocolate Cake', 3, 299.00, 'Rich chocolate cake with ganache', true),
('Ice Cream Sundae', 3, 199.00, 'Vanilla ice cream with hot fudge and nuts', true),
('Apple Pie', 3, 249.00, 'Warm apple pie with cinnamon', true),

-- Beverages
('Fresh Juice', 4, 149.00, 'Daily fresh fruit juice', true),
('Coffee', 4, 199.00, 'Premium coffee with milk', true),
('Green Tea', 4, 149.00, 'Japanese green tea', true);

-- Insert sample taxes
INSERT INTO taxes (tax_name, percentage) VALUES 
('GST', 5.00),
('Service Tax', 10.00);

-- Insert sample tables
INSERT INTO tables (number, capacity) VALUES 
('T1', 4),
('T2', 6),
('T3', 4),
('T4', 8); 