const db = require('../config/db');

const orderController = {
    // Get all orders
    getAllOrders: async (req, res) => {
        try {
            const [rows] = await db.execute(`
                SELECT o.*, t.table_number, u.username as created_by_name
                FROM orders o
                LEFT JOIN tables t ON o.table_id = t.id
                LEFT JOIN users u ON o.created_by = u.id
                ORDER BY o.created_at DESC
            `);
            res.json(rows);
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ message: 'Error fetching orders' });
        }
    },

    // Get a single order with items
    getOrderById: async (req, res) => {
        try {
            const [order] = await db.execute(`
                SELECT o.*, t.table_number, u.username as created_by_name
                FROM orders o
                LEFT JOIN tables t ON o.table_id = t.id
                LEFT JOIN users u ON o.created_by = u.id
                WHERE o.id = ?
            `, [req.params.id]);

            if (order.length === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }

            const [items] = await db.execute(`
                SELECT oi.*, d.name as dish_name
                FROM order_items oi
                JOIN dishes d ON oi.dish_id = d.id
                WHERE oi.order_id = ?
            `, [req.params.id]);

            res.json({
                ...order[0],
                items
            });
        } catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).json({ message: 'Error fetching order' });
        }
    },

    // Create a new order
    createOrder: async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { table_id, customer_name, order_type, items, total_amount } = req.body;
            
            // Create the order
            const [orderResult] = await connection.execute(
                'INSERT INTO orders (table_id, customer_name, order_type, total_amount, created_by) VALUES (?, ?, ?, ?, ?)',
                [table_id, customer_name, order_type, total_amount, 1] // Using 1 as default created_by
            );

            const orderId = orderResult.insertId;

            // Insert order items
            for (const item of items) {
                await connection.execute(
                    'INSERT INTO order_items (order_id, dish_id, quantity, price, notes) VALUES (?, ?, ?, ?, ?)',
                    [orderId, item.dish_id, item.quantity, item.price, item.notes]
                );
            }

            // Update table status if it's a dine-in order
            if (order_type === 'dine_in' && table_id) {
                await connection.execute(
                    'UPDATE tables SET status = ? WHERE id = ?',
                    ['occupied', table_id]
                );
            }

            await connection.commit();

            // Fetch the created order with items
            const [order] = await connection.execute(`
                SELECT o.*, t.table_number, u.username as created_by_name
                FROM orders o
                LEFT JOIN tables t ON o.table_id = t.id
                LEFT JOIN users u ON o.created_by = u.id
                WHERE o.id = ?
            `, [orderId]);

            const [orderItems] = await connection.execute(`
                SELECT oi.*, d.name as dish_name
                FROM order_items oi
                JOIN dishes d ON oi.dish_id = d.id
                WHERE oi.order_id = ?
            `, [orderId]);

            res.status(201).json({
                ...order[0],
                items: orderItems
            });
        } catch (error) {
            await connection.rollback();
            console.error('Error creating order:', error);
            res.status(500).json({ message: 'Error creating order' });
        } finally {
            connection.release();
        }
    },

    // Update order status
    updateOrderStatus: async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { status } = req.body;
            const orderId = req.params.id;

            // Update order status
            await connection.execute(
                'UPDATE orders SET status = ? WHERE id = ?',
                [status, orderId]
            );

            // If order is completed and it's a dine-in order, update table status
            if (status === 'completed') {
                const [order] = await connection.execute(
                    'SELECT table_id FROM orders WHERE id = ?',
                    [orderId]
                );
                
                if (order[0]?.table_id) {
                    await connection.execute(
                        'UPDATE tables SET status = ? WHERE id = ?',
                        ['available', order[0].table_id]
                    );
                }
            }

            await connection.commit();
            res.json({ message: 'Order status updated successfully' });
        } catch (error) {
            await connection.rollback();
            console.error('Error updating order status:', error);
            res.status(500).json({ message: 'Error updating order status' });
        } finally {
            connection.release();
        }
    },

    // Delete an order
    deleteOrder: async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const orderId = req.params.id;

            // Get order details before deletion
            const [order] = await connection.execute(
                'SELECT table_id FROM orders WHERE id = ?',
                [orderId]
            );

            // Delete order items
            await connection.execute('DELETE FROM order_items WHERE order_id = ?', [orderId]);

            // Delete the order
            await connection.execute('DELETE FROM orders WHERE id = ?', [orderId]);

            // If it was a dine-in order, update table status
            if (order[0]?.table_id) {
                await connection.execute(
                    'UPDATE tables SET status = ? WHERE id = ?',
                    ['available', order[0].table_id]
                );
            }

            await connection.commit();
            res.json({ message: 'Order deleted successfully' });
        } catch (error) {
            await connection.rollback();
            console.error('Error deleting order:', error);
            res.status(500).json({ message: 'Error deleting order' });
        } finally {
            connection.release();
        }
    }
};

module.exports = orderController; 