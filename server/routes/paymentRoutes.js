const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// ==================== PUBLIC ====================

// GET /api/payment/details — Hotel UPI ID + QR code (no auth needed)
router.get('/details', paymentController.getHotelPaymentDetails);

// ==================== CUSTOMER ====================

// POST /api/payment/submit — Submit transaction ID after UPI payment
router.post(
  '/submit',
  verifyToken,
  authorizeRoles('customer'),
  paymentController.submitPayment
);

// ==================== RECEPTIONIST / ADMIN ====================

// GET /api/payment/pending — List all pending-verification bookings
router.get(
  '/pending',
  verifyToken,
  authorizeRoles('receptionist', 'admin'),
  paymentController.getPendingPayments
);

// POST /api/payment/verify/:bookingId — Approve or reject a payment
router.post(
  '/verify/:bookingId',
  verifyToken,
  authorizeRoles('receptionist', 'admin'),
  paymentController.verifyPayment
);

module.exports = router;
