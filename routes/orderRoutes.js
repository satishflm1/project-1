const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const PDFDocument = require('pdfkit');

// Get all orders
router.get('/', async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT o.*, t.number as table_number
            FROM orders o
            LEFT JOIN tables t ON o.table_id = t.id
            ORDER BY o.created_at DESC
        `);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get a single order
router.get('/:id', async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT o.*, t.number as table_number
            FROM orders o
            LEFT JOIN tables t ON o.table_id = t.id
            WHERE o.id = ?
        `, [req.params.id]);

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const [items] = await pool.query(`
            SELECT oi.*, d.name as dish_name
            FROM order_items oi
            JOIN dishes d ON oi.dish_id = d.id
            WHERE oi.order_id = ?
        `, [req.params.id]);

        res.json({
            ...orders[0],
            items
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Create a new order
router.post('/', async (req, res) => {
    const { table_id, customer_name, order_type, items, total_amount } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    try {
        // Start transaction
        await pool.query('START TRANSACTION');

        // Insert order
        const [orderResult] = await pool.query(
            'INSERT INTO orders (table_id, customer_name, order_type, total_amount, status) VALUES (?, ?, ?, ?, ?)',
            [table_id, customer_name, order_type, total_amount, 'pending']
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, dish_id, quantity, price, notes) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.dish_id, item.quantity, item.price, item.notes || '']
            );
        }

        // Update table status if it's a dine-in order
        if (order_type === 'dine_in' && table_id) {
            await pool.query(
                'UPDATE tables SET status = ? WHERE id = ?',
                ['occupied', table_id]
            );
        }

        await pool.query('COMMIT');
        res.status(201).json({ id: orderId, message: 'Order created successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get orders by table
router.get('/table/:tableId', async (req, res) => {
    try {
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE table_id = ? ORDER BY created_at DESC',
            [req.params.tableId]
        );
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'completed'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Delete an order
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
});

// Generate bill for an order
router.get('/:id/bill', async (req, res) => {
    try {
        const orderId = req.params.id;
        
        // Get order details
        const [orders] = await pool.query(`
            SELECT o.*, t.number as table_number
            FROM orders o
            LEFT JOIN tables t ON o.table_id = t.id
            WHERE o.id = ?
        `, [orderId]);
        
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];

        // Get order items with dish details
        const [items] = await pool.query(`
            SELECT oi.*, d.name as dish_name
            FROM order_items oi
            JOIN dishes d ON oi.dish_id = d.id
            WHERE oi.order_id = ?
        `, [orderId]);

        if (items.length === 0) {
            return res.status(400).json({ error: 'Order has no items' });
        }

        // Calculate tax (10%)
        const taxRate = 0.10;
        const subtotal = parseFloat(order.total_amount);
        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        // Format the bill
        const bill = {
            orderId: order.id,
            orderType: order.order_type,
            customerName: order.customer_name,
            tableNumber: order.table_number || 'N/A',
            date: order.created_at,
            items: items.map(item => ({
                name: item.dish_name,
                quantity: item.quantity,
                price: parseFloat(item.price),
                subtotal: parseFloat(item.price) * item.quantity,
                notes: item.notes || ''
            })),
            subtotal: subtotal,
            tax: tax,
            total: total
        };

        // Generate PDF
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4'
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=bill-${orderId}.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);

        // Add Restaurant Logo/Name
        doc.font('Helvetica-Bold')
           .fontSize(24)
           .text('Dragon Restaurant', { align: 'center' })
           .moveDown(0.5);

        // Add Bill Title
        doc.fontSize(16)
           .text('BILL', { align: 'center' })
           .moveDown();

        // Add horizontal line
        doc.lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown();

        // Add order details in two columns
        const leftColumnX = 50;
        const rightColumnX = 300;
        const startY = doc.y;

        // Left column details
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .text('Order Details:', leftColumnX, startY)
           .font('Helvetica')
           .moveDown(0.5)
           .text(`Order ID: ${order.id}`, leftColumnX)
           .text(`Date: ${new Date(order.created_at).toLocaleString()}`, leftColumnX);

        // Right column details
        doc.font('Helvetica-Bold')
           .text('Customer Information:', rightColumnX, startY)
           .font('Helvetica')
           .moveDown(0.5)
           .text(`Name: ${order.customer_name}`, rightColumnX)
           .text(`Type: ${order.order_type.replace('_', ' ').toUpperCase()}`, rightColumnX);

        // Move down after both columns
        doc.moveDown(2);

        // Add horizontal line
        doc.lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown();

        // Add items table header
        const tableTop = doc.y;
        const itemX = 50;
        const qtyX = 350;
        const priceX = 400;
        const totalX = 480;

        // Add table headers with background
        doc.font('Helvetica-Bold')
           .fontSize(10);

        // Draw header background
        doc.rect(itemX - 5, tableTop - 5, 505, 20)
           .fill('#f3f4f6');

        // Add header text
        doc.fillColor('black')
           .text('ITEM', itemX, tableTop)
           .text('QTY', qtyX, tableTop)
           .text('PRICE', priceX, tableTop)
           .text('TOTAL', totalX, tableTop)
           .moveDown();

        // Reset font
        doc.font('Helvetica');

        // Add items
        let currentY = doc.y;
        let alternate = false;

        bill.items.forEach(item => {
            // Alternate row background
            if (alternate) {
                doc.rect(itemX - 5, currentY - 5, 505, 20)
                   .fill('#f9fafb');
            }
            alternate = !alternate;

            doc.fillColor('black')
               .fontSize(10)
               .text(item.name, itemX, currentY, { width: 280 })
               .text(item.quantity.toString(), qtyX, currentY)
               .text(`₹${Number(item.price).toFixed(2)}`, priceX, currentY)
               .text(`₹${(Number(item.price) * item.quantity).toFixed(2)}`, totalX, currentY);
            
            currentY = doc.y + 15;
            doc.moveDown();
        });

        // Add horizontal line
        doc.lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown();

        // Add summary box
        const summaryX = 350;
        const summaryWidth = 200;
        const summaryStartY = doc.y;

        // Draw summary box
        doc.rect(summaryX - 5, summaryStartY - 5, summaryWidth + 5, 80)
           .fill('#f8fafc');

        // Add summary details
        doc.fillColor('black')
           .font('Helvetica')
           .text('Subtotal:', summaryX, summaryStartY)
           .text(`₹${Number(bill.subtotal).toFixed(2)}`, summaryX + 120)
           .moveDown(0.5)
           .text('Tax (10%):', summaryX)
           .text(`₹${Number(bill.tax).toFixed(2)}`, summaryX + 120)
           .moveDown(0.5);

        // Add final total with bold formatting
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .text('Total Amount:', summaryX)
           .text(`₹${Number(bill.total).toFixed(2)}`, summaryX + 120)
           .moveDown(2);

        // Add Payment Options title
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .text('Payment Options', { align: 'center' })
           .moveDown();

        // Add UPI Details in a box
        const boxWidth = 300;
        const boxX = (doc.page.width - boxWidth) / 2;
        const boxHeight = 120;
        
        // Draw box with light background
        doc.rect(boxX, doc.y, boxWidth, boxHeight)
           .fill('#f8fafc')
           .stroke();

        // Add UPI details
        doc.fillColor('black')
           .font('Helvetica-Bold')
           .fontSize(11)
           .text('Scan to Pay via UPI', boxX, doc.y, { align: 'center', width: boxWidth })
           .moveDown()
           .font('Helvetica')
           .fontSize(10)
           .text('UPI ID:', boxX + 20, doc.y)
           .font('Helvetica-Bold')
           .text('8484843035@ybl', boxX + 70)
           .moveDown()
           .font('Helvetica')
           .text('Accepted Apps:', boxX + 20)
           .font('Helvetica-Bold')
           .text('PhonePe / Google Pay / BHIM', boxX + 100)
           .moveDown()
           .text(`Amount: ₹${Number(bill.total).toFixed(2)}`, boxX, doc.y, { align: 'center', width: boxWidth });

        doc.moveDown(5);

        // Add footer with a line above
        doc.lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown();

        // Add footer
        doc.font('Helvetica')
           .fontSize(10)
           .text('Thank you for dining with us!', { align: 'center' })
           .moveDown(0.5)
           .text('Please visit us again', { align: 'center' })
           .moveDown(0.5)
           .fillColor('#666666')
           .text('For feedback and queries: +91 1234567890', { align: 'center' });

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('Error generating bill:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Error generating bill',
                details: error.message
            });
        }
    }
});

module.exports = router; 