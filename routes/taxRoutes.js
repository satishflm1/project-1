const express = require('express');
const router = express.Router();
const db = require('../config/database');
const {
    getAllTaxes,
    createTax,
    updateTax,
    deleteTax
} = require('../controllers/taxController');

// Get all taxes
router.get('/', async (req, res) => {
    try {
        const [taxes] = await db.query('SELECT * FROM taxes ORDER BY tax_name');
        res.json(taxes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching taxes', error: error.message });
    }
});

// Calculate total with taxes
router.post('/calculate', async (req, res) => {
    try {
        const { subtotal } = req.body;
        const [taxes] = await db.query('SELECT * FROM taxes ORDER BY tax_name');
        
        let total = subtotal;
        const taxDetails = taxes.map(tax => {
            const taxAmount = (subtotal * tax.percentage) / 100;
            total += taxAmount;
            return {
                name: tax.tax_name,
                percentage: tax.percentage,
                amount: taxAmount
            };
        });

        res.json({
            subtotal,
            taxes: taxDetails,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating taxes', error: error.message });
    }
});

// Create a new tax
router.post('/', createTax);

// Update a tax
router.put('/:id', updateTax);

// Delete a tax
router.delete('/:id', deleteTax);

module.exports = router; 