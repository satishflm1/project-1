const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Create a new payment
router.post('/', async (req, res) => {
    const { order_id, payment_method, amount, transaction_id } = req.body;

    try {
        // Start transaction
        await pool.query('START TRANSACTION');

        // Insert payment record
        const [paymentResult] = await pool.query(
            'INSERT INTO payments (order_id, payment_method, amount, transaction_id, status) VALUES (?, ?, ?, ?, ?)',
            [order_id, payment_method, amount, transaction_id, 'completed']
        );

        // Update order status
        await pool.query(
            'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
            ['paid', 'completed', order_id]
        );

        await pool.query('COMMIT');

        res.status(201).json({
            message: 'Payment recorded successfully',
            payment_id: paymentResult.insertId
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error recording payment:', error);
        res.status(500).json({ error: 'Failed to record payment' });
    }
});

// Get payment status
router.get('/:orderId', async (req, res) => {
    try {
        const [payments] = await pool.query(
            'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
            [req.params.orderId]
        );

        if (payments.length === 0) {
            return res.json({ status: 'pending' });
        }

        res.json({
            status: payments[0].status,
            payment_method: payments[0].payment_method,
            amount: payments[0].amount,
            transaction_id: payments[0].transaction_id,
            created_at: payments[0].created_at
        });
    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({ error: 'Failed to fetch payment status' });
    }
});

// Generate UPI payment link
router.post('/upi-link', async (req, res) => {
    const { order_id, amount } = req.body;

    try {
        // Get order details
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [order_id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Generate UPI payment link
        const upiLink = `upi://pay?pa=8484843035@ybl&pn=Dragon Restaurant&am=${amount}&tn=Order ${order_id}&cu=INR`;

        res.json({
            upi_link: upiLink,
            qr_code: upiLink // This can be used to generate QR code on the frontend
        });
    } catch (error) {
        console.error('Error generating UPI link:', error);
        res.status(500).json({ error: 'Failed to generate UPI link' });
    }
});

module.exports = router; 