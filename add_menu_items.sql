-- Use the dragon database
USE dragon;

-- Insert additional dishes for each category
INSERT INTO dishes (name, category_id, price, description, available) VALUES 
-- Appetizers (category_id: 1)
('Mozzarella Sticks', 1, 249.00, 'Crispy breaded mozzarella sticks served with marinara sauce', true),
('Calamari', 1, 299.00, 'Crispy fried calamari rings with garlic aioli', true),
('Nachos', 1, 279.00, 'Tortilla chips topped with cheese, beans, and guacamole', true),

-- Main Course (category_id: 2)
('Chicken Alfredo', 2, 449.00, 'Creamy pasta with grilled chicken and parmesan', true),
('Shrimp Scampi', 2, 549.00, 'Garlic butter shrimp with linguine pasta', true),
('Mushroom Risotto', 2, 399.00, 'Creamy risotto with mixed mushrooms', true),
('Butter Chicken', 2, 449.00, 'Tender chicken in rich tomato sauce with rice', true),
('Paneer Tikka', 2, 399.00, 'Grilled cottage cheese in spiced yogurt marinade', true),

-- Desserts (category_id: 3)
('Tiramisu', 3, 299.00, 'Classic Italian coffee-flavored dessert', true),
('Cheesecake', 3, 279.00, 'New York style cheesecake with berry compote', true),
('Gulab Jamun', 3, 199.00, 'Sweet milk dumplings in sugar syrup', true),
('Mango Ice Cream', 3, 149.00, 'Homemade mango ice cream', true),

-- Beverages (category_id: 4)
('Mango Smoothie', 4, 199.00, 'Fresh mango blended with yogurt', true),
('Iced Tea', 4, 149.00, 'Refreshing iced tea with lemon', true),
('Mojito', 4, 249.00, 'Fresh mint and lime mocktail', true),
('Hot Chocolate', 4, 179.00, 'Rich and creamy hot chocolate', true); 