const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');

// Get all dishes
router.get('/', dishController.getAllDishes);

// Get a single dish
router.get('/:id', dishController.getDishById);

// Create a new dish
router.post('/', dishController.createDish);

// Update a dish
router.put('/:id', dishController.updateDish);

// Delete a dish
router.delete('/:id', dishController.deleteDish);

// Toggle dish availability
router.patch('/:id/toggle-availability', dishController.toggleAvailability);

module.exports = router; 