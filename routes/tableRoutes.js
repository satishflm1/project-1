const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const pool = require('../config/database');

// Get all tables
router.get('/', async (req, res) => {
    try {
        const [tables] = await pool.query('SELECT * FROM tables ORDER BY number');
        res.json(tables);
    } catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ error: 'Failed to fetch tables' });
    }
});

// Reset all tables to available
router.post('/reset', tableController.resetTables);

// Get a single table
router.get('/:id', async (req, res) => {
    try {
        const [tables] = await pool.query('SELECT * FROM tables WHERE id = ?', [req.params.id]);
        if (tables.length === 0) {
            return res.status(404).json({ error: 'Table not found' });
        }
        res.json(tables[0]);
    } catch (error) {
        console.error('Error fetching table:', error);
        res.status(500).json({ error: 'Failed to fetch table' });
    }
});

// Update table status
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['available', 'occupied', 'reserved'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        await pool.query('UPDATE tables SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Table status updated successfully' });
    } catch (error) {
        console.error('Error updating table status:', error);
        res.status(500).json({ error: 'Failed to update table status' });
    }
});

// Create a new table
router.post('/', tableController.createTable);

// Update a table
router.put('/:id', tableController.updateTable);

// Delete a table
router.delete('/:id', async (req, res) => {
    try {
        const [table] = await pool.query('SELECT status FROM tables WHERE id = ?', [req.params.id]);
        if (table.length === 0) {
            return res.status(404).json({ error: 'Table not found' });
        }
        if (table[0].status === 'occupied') {
            return res.status(400).json({ error: 'Cannot delete an occupied table' });
        }
        await pool.query('DELETE FROM tables WHERE id = ?', [req.params.id]);
        res.json({ message: 'Table deleted successfully' });
    } catch (error) {
        console.error('Error deleting table:', error);
        res.status(500).json({ error: 'Failed to delete table' });
    }
});

module.exports = router; 