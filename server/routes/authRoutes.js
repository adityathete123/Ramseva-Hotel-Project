const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// ==================== PUBLIC AUTH ROUTES ====================

// POST /api/auth/login — Login (admin, receptionist, customer)
router.post('/login', authController.login);

// POST /api/auth/register — Self-registration (customer only)
router.post('/register', authController.register);

// POST /api/auth/init-demo — Initialize demo users (one-time setup)
router.post('/init-demo', authController.initDemo);

// ==================== PROTECTED AUTH ROUTES ====================

// GET /api/auth/me — Get current user profile
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
