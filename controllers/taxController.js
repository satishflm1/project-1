const pool = require('../config/database');

const getAllTaxes = async (req, res) => {
    try {
        const [taxes] = await pool.query('SELECT * FROM taxes ORDER BY created_at DESC');
        res.json(taxes);
    } catch (error) {
        console.error('Error fetching taxes:', error);
        res.status(500).json({ message: 'Error fetching taxes' });
    }
};

const createTax = async (req, res) => {
    try {
        const { tax_name, percentage } = req.body;
        
        if (!tax_name || !percentage) {
            return res.status(400).json({ message: 'Tax name and percentage are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO taxes (tax_name, percentage) VALUES (?, ?)',
            [tax_name, percentage]
        );

        const [newTax] = await pool.query('SELECT * FROM taxes WHERE id = ?', [result.insertId]);
        res.status(201).json(newTax[0]);
    } catch (error) {
        console.error('Error creating tax:', error);
        res.status(500).json({ message: 'Error creating tax' });
    }
};

const updateTax = async (req, res) => {
    try {
        const { id } = req.params;
        const { tax_name, percentage } = req.body;

        if (!tax_name || !percentage) {
            return res.status(400).json({ message: 'Tax name and percentage are required' });
        }

        const [result] = await pool.query(
            'UPDATE taxes SET tax_name = ?, percentage = ? WHERE id = ?',
            [tax_name, percentage, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tax not found' });
        }

        const [updatedTax] = await pool.query('SELECT * FROM taxes WHERE id = ?', [id]);
        res.json(updatedTax[0]);
    } catch (error) {
        console.error('Error updating tax:', error);
        res.status(500).json({ message: 'Error updating tax' });
    }
};

const deleteTax = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM taxes WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tax not found' });
        }

        res.json({ message: 'Tax deleted successfully' });
    } catch (error) {
        console.error('Error deleting tax:', error);
        res.status(500).json({ message: 'Error deleting tax' });
    }
};

module.exports = {
    getAllTaxes,
    createTax,
    updateTax,
    deleteTax
}; 