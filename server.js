const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const db = require('./config/database');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Dragon POS API' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/taxes', require('./routes/taxRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/dishes', require('./routes/dishRoutes'));
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
