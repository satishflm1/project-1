const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (user) => {
  try {
    return jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'bighorn_secret_key_2024',
      { expiresIn: '24h' }
    );
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('\n--- Login Attempt ---');
    console.log('Login request for username:', username);

    if (!username || !password) {
      console.log('Missing credentials - Username or password not provided');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findByUsername(username);
    
    if (!user) {
      console.log('Authentication failed - User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', { id: user.id, username: user.username, role: user.role });
    console.log('Stored password hash:', user.password);
    
    // For debugging, let's create a hash of the provided password
    const testHash = await bcrypt.hash(password, 10);
    console.log('Test hash of provided password:', testHash);

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isValidPassword);

    if (!isValidPassword) {
      console.log('Authentication failed - Invalid password for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    console.log('Login successful - Token generated for user:', username);
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const userId = await User.create({ username, password, role });
    const user = await User.findById(userId);
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

module.exports = {
  login,
  register
}; 