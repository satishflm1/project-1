const db = require('../config/database');

const categoryController = {
    // Get all categories
    getAllCategories: async (req, res) => {
        try {
            const [rows] = await db.execute('SELECT * FROM categories');
            res.json(rows);
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ message: 'Error fetching categories' });
        }
    },

    // Get a single category
    getCategoryById: async (req, res) => {
        try {
            const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [req.params.id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.json(rows[0]);
        } catch (error) {
            console.error('Error fetching category:', error);
            res.status(500).json({ message: 'Error fetching category' });
        }
    },

    // Create a new category
    createCategory: async (req, res) => {
        try {
            const { name } = req.body;
            const [result] = await db.execute(
                'INSERT INTO categories (name) VALUES (?)',
                [name]
            );
            res.status(201).json({ 
                id: result.insertId, 
                name 
            });
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({ message: 'Error creating category' });
        }
    },

    // Update a category
    updateCategory: async (req, res) => {
        try {
            const { name } = req.body;
            await db.execute(
                'UPDATE categories SET name = ? WHERE id = ?',
                [name, req.params.id]
            );
            res.json({ message: 'Category updated successfully' });
        } catch (error) {
            console.error('Error updating category:', error);
            res.status(500).json({ message: 'Error updating category' });
        }
    },

    // Delete a category
    deleteCategory: async (req, res) => {
        try {
            await db.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
            res.json({ message: 'Category deleted successfully' });
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({ message: 'Error deleting category' });
        }
    }
};

module.exports = categoryController; 