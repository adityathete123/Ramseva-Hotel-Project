const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// ==================== PROTECTED ROUTES ====================

// GET /api/bookings/my — Get current customer's bookings
router.get(
  '/my',
  verifyToken,
  authorizeRoles('customer'),
  bookingController.getMyBookings
);

// POST /api/bookings — Create a new booking
router.post(
  '/',
  verifyToken,
  authorizeRoles('customer'),
  bookingController.createBooking
);

// GET /api/bookings/:id — Get details of a single booking
router.get(
  '/:id',
  verifyToken,
  bookingController.getBookingById
);

// POST /api/bookings/:id/cancel — Cancel a booking
router.post(
  '/:id/cancel',
  verifyToken,
  bookingController.cancelBooking
);

// GET /api/bookings — List all bookings (Admin/Receptionist)
router.get(
  '/',
  verifyToken,
  authorizeRoles('admin', 'receptionist'),
  bookingController.getAllBookings
);

// PUT /api/bookings/:id/status — Update booking status (Receptionist/Admin)
router.put(
  '/:id/status',
  verifyToken,
  authorizeRoles('admin', 'receptionist'),
  bookingController.updateBookingStatus
);

module.exports = router;
