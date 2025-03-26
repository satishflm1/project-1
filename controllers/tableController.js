const db = require('../config/database');

const tableController = {
    // Get all tables
    getAllTables: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM tables ORDER BY number');
            res.json(rows);
        } catch (error) {
            console.error('Error fetching tables:', error);
            res.status(500).json({ message: 'Error fetching tables' });
        }
    },

    // Reset all tables to available
    resetTables: async (req, res) => {
        try {
            const [result] = await db.query(
                'UPDATE tables SET status = ?',
                ['available']
            );
            res.json({ 
                message: 'All tables reset to available',
                affectedRows: result.affectedRows 
            });
        } catch (error) {
            console.error('Error resetting tables:', error);
            res.status(500).json({ message: 'Error resetting tables' });
        }
    },

    // Get a single table
    getTableById: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM tables WHERE id = ?', [req.params.id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Table not found' });
            }
            res.json(rows[0]);
        } catch (error) {
            console.error('Error fetching table:', error);
            res.status(500).json({ message: 'Error fetching table' });
        }
    },

    // Update table status
    updateTableStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const [result] = await db.query(
                'UPDATE tables SET status = ? WHERE id = ?',
                [status, req.params.id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Table not found' });
            }
            res.json({ message: 'Table status updated successfully' });
        } catch (error) {
            console.error('Error updating table status:', error);
            res.status(500).json({ message: 'Error updating table status' });
        }
    },

    // Create a new table
    createTable: async (req, res) => {
        try {
            const { table_number, capacity } = req.body;

            // Validate input
            if (!table_number || !capacity) {
                return res.status(400).json({ 
                    message: 'Table number and capacity are required' 
                });
            }

            if (capacity <= 0) {
                return res.status(400).json({ 
                    message: 'Capacity must be greater than 0' 
                });
            }

            // Check if table number already exists
            const [existing] = await db.query(
                'SELECT id FROM tables WHERE number = ?',
                [table_number]
            );

            if (existing.length > 0) {
                return res.status(400).json({ 
                    message: 'Table number already exists' 
                });
            }

            // Create the table
            const [result] = await db.query(
                'INSERT INTO tables (number, capacity, status) VALUES (?, ?, ?)',
                [table_number, capacity, 'available']
            );

            // Get the created table
            const [newTable] = await db.query(
                'SELECT * FROM tables WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json(newTable[0]);
        } catch (error) {
            console.error('Error creating table:', error);
            res.status(500).json({ 
                message: 'Error creating table',
                details: error.message
            });
        }
    },

    // Update a table
    updateTable: async (req, res) => {
        try {
            const { table_number, capacity, status } = req.body;
            const [result] = await db.query(
                'UPDATE tables SET number = ?, capacity = ?, status = ? WHERE id = ?',
                [table_number, capacity, status, req.params.id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Table not found' });
            }
            res.json({ message: 'Table updated successfully' });
        } catch (error) {
            console.error('Error updating table:', error);
            res.status(500).json({ message: 'Error updating table' });
        }
    },

    // Delete a table
    deleteTable: async (req, res) => {
        try {
            const [result] = await db.query('DELETE FROM tables WHERE id = ?', [req.params.id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Table not found' });
            }
            res.json({ message: 'Table deleted successfully' });
        } catch (error) {
            console.error('Error deleting table:', error);
            res.status(500).json({ message: 'Error deleting table' });
        }
    }
};

module.exports = tableController; 