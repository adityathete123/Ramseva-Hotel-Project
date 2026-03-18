const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// ==================== PUBLIC CUSTOMER ROUTES ====================

// GET /api/customer/categories — Get all room categories with pricing
router.get('/categories', customerController.getRoomCategories);

// POST /api/customer/availability — Check room availability for dates
router.post('/availability', customerController.checkAvailability);

module.exports = router;
