-- Use the database
USE bighorn_pos;

-- Delete existing admin user if exists
DELETE FROM users WHERE username = 'admin';

-- Insert new admin user with hashed password 'admin123'
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'admin'); 