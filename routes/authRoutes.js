const express = require('express');
const { login, register } = require('../controllers/authController');
const { body } = require('express-validator');

const router = express.Router();

const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const registerValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'staff']).withMessage('Invalid role')
];

router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);

module.exports = router; 