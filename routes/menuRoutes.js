const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        // Set cache control headers
        res.set('Cache-Control', 'no-store');
        const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

// Get all dishes
router.get('/dishes', async (req, res) => {
    try {
        // Set cache control headers
        res.set('Cache-Control', 'no-store');
        const [dishes] = await db.query(
            'SELECT d.*, c.name as category_name FROM dishes d LEFT JOIN categories c ON d.category_id = c.id WHERE d.available = true ORDER BY c.name, d.name'
        );
        res.json(dishes);
    } catch (error) {
        console.error('Error fetching dishes:', error);
        res.status(500).json({ message: 'Error fetching dishes', error: error.message });
    }
});

// Get dishes by category
router.get('/dishes/:categoryId', async (req, res) => {
    try {
        // Set cache control headers
        res.set('Cache-Control', 'no-store');
        const [dishes] = await db.query(
            'SELECT * FROM dishes WHERE category_id = ? AND available = true ORDER BY name',
            [req.params.categoryId]
        );
        res.json(dishes);
    } catch (error) {
        console.error('Error fetching dishes by category:', error);
        res.status(500).json({ message: 'Error fetching dishes', error: error.message });
    }
});

// Get single dish
router.get('/dish/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM dishes WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Dish not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching dish:', error);
        res.status(500).json({ message: 'Error fetching dish' });
    }
});

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM menu_items');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu items' });
  }
});

// Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu item' });
  }
});

// Create menu item
router.post('/', async (req, res) => {
  try {
    const { name, category_id, price, description, is_available } = req.body;
    const [result] = await db.execute(
      'INSERT INTO menu_items (name, category_id, price, description, is_available) VALUES (?, ?, ?, ?, ?)',
      [name, category_id, price, description, is_available]
    );
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      category_id, 
      price, 
      description, 
      is_available 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating menu item' });
  }
});

// Update menu item
router.put('/:id', async (req, res) => {
  try {
    const { name, category_id, price, description, is_available } = req.body;
    await db.execute(
      'UPDATE menu_items SET name = ?, category_id = ?, price = ?, description = ?, is_available = ? WHERE id = ?',
      [name, category_id, price, description, is_available, req.params.id]
    );
    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating menu item' });
  }
});

// Delete menu item
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting menu item' });
  }
});

module.exports = router; 