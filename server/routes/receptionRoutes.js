const express = require('express');
const router = express.Router();
const receptionController = require('../controllers/receptionController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// ==================== PROTECTED STAFF ROUTES ====================

// POST /api/reception/walk-in — Create walk-in booking
router.post(
  '/walk-in',
  verifyToken,
  authorizeRoles('receptionist', 'admin'),
  receptionController.walkIn
);

// POST /api/reception/check-in/:id — Confirm guest check-in
router.post(
  '/check-in/:id',
  verifyToken,
  authorizeRoles('receptionist', 'admin'),
  receptionController.checkIn
);

// POST /api/reception/check-out/:id — Process guest check-out
router.post(
  '/check-out/:id',
  verifyToken,
  authorizeRoles('receptionist', 'admin'),
  receptionController.checkOut
);

// GET /api/reception/bookings — List all hotel bookings
router.get(
  '/bookings',
  verifyToken,
  authorizeRoles('receptionist', 'admin'),
  receptionController.getDashboardData
);

module.exports = router;
