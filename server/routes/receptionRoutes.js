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

// GET /api/reception/bookings — Dashboard data (all bookings + rooms + stats)
router.get(
  '/bookings',
  verifyToken,
  authorizeRoles('receptionist', 'admin'),
  receptionController.getDashboardData
);

// PUT /api/reception/extend-stay/:id — Extend a guest's stay
router.put(
  '/extend-stay/:id',
  verifyToken,
  authorizeRoles('receptionist', 'admin'),
  receptionController.extendStay
);

// GET /api/reception/guests — Full guest list with payment info
router.get(
  '/guests',
  verifyToken,
  authorizeRoles('receptionist', 'admin'),
  receptionController.getGuestList
);

// GET /api/reception/today-checkins — Today's check-ins
router.get(
  '/today-checkins',
  verifyToken,
  authorizeRoles('receptionist', 'admin'),
  receptionController.getTodayCheckIns
);

// GET /api/reception/pending — Bookings pending payment verification
router.get(
  '/pending',
  verifyToken,
  authorizeRoles('receptionist', 'admin'),
  receptionController.getPendingVerification
);

module.exports = router;

