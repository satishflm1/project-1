-- Make sure we're using the right database
USE dragon;

-- Delete existing orders first (to handle foreign key constraints)
DELETE FROM order_items;
DELETE FROM orders;

-- Delete existing tables
DELETE FROM tables;

-- Reset auto increment
ALTER TABLE tables AUTO_INCREMENT = 1;

-- Insert 10 tables with different capacities
INSERT INTO tables (table_number, capacity, status) VALUES
('T1', 2, 'available'),
('T2', 4, 'available'),
('T3', 4, 'available'),
('T4', 6, 'available'),
('T5', 6, 'available'),
('T6', 8, 'available'),
('T7', 8, 'available'),
('T8', 10, 'available'),
('T9', 12, 'available'),
('T10', 16, 'available'); 