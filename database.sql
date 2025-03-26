-- Create database
CREATE DATABASE IF NOT EXISTS dragon;
USE dragon;

-- Drop users table if exists to avoid conflicts
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tables table
CREATE TABLE IF NOT EXISTS tables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    number VARCHAR(10) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create dishes table
CREATE TABLE IF NOT EXISTS dishes (
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
CREATE TABLE IF NOT EXISTS taxes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tax_name VARCHAR(50) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_id INT,
    items JSON NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables(id)
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