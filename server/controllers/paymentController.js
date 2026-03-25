const BookingModel = require('../models/bookingModel');
const { pool } = require('../config/db');

const paymentController = {
  /**
   * GET /api/payment/details
   * Returns the hotel's active UPI ID and QR code URL.
   * Public — no auth needed so customers can see before logging in.
   */
  async getHotelPaymentDetails(req, res) {
    try {
      const details = await BookingModel.getHotelPaymentDetails();

      if (!details) {
        return res.json({
          success: true,
          data: {
            upi_id: null,
            qr_code_url: null,
            bank_name: null,
            account_holder: null
          },
          message: 'No payment details configured yet'
        });
      }

      // Build full QR URL if stored as relative path
      const apiBase = `${req.protocol}://${req.get('host')}`;
      const qrUrl = details.qr_code_url
        ? (details.qr_code_url.startsWith('http') ? details.qr_code_url : `${apiBase}${details.qr_code_url}`)
        : null;

      res.json({
        success: true,
        data: {
          upi_id: details.upi_id,
          qr_code_url: qrUrl,
          bank_name: details.bank_name,
          account_holder: details.account_holder
        }
      });
    } catch (error) {
      console.error('Get hotel payment details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment details'
      });
    }
  },

  /**
   * POST /api/payment/submit
   * Customer submits a transaction ID after making UPI payment.
   * Body: { bookingId, transactionId, amount, method }
   */
  async submitPayment(req, res) {
    try {
      const { bookingId, transactionId, amount, method } = req.body;

      if (!bookingId || !transactionId) {
        return res.status(400).json({
          success: false,
          message: 'bookingId and transactionId are required'
        });
      }

      // Verify booking exists
      const booking = await BookingModel.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      if (booking.status === 'confirmed' || booking.status === 'checked_in') {
        return res.status(400).json({
          success: false,
          message: 'Payment already confirmed for this booking'
        });
      }

      // Record payment
      await BookingModel.recordPayment({
        booking_id: bookingId,
        amount: amount || booking.total_amount * 0.3, // 30% advance default
        method: method || 'upi',
        transaction_id: transactionId
      });

      // Set booking status to pending_verification
      await BookingModel.updateStatus(bookingId, 'pending_verification');

      res.json({
        success: true,
        message: 'Payment submitted. Awaiting receptionist verification.',
        data: { bookingId, transactionId }
      });
    } catch (error) {
      console.error('Submit payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit payment'
      });
    }
  },

  /**
   * POST /api/payment/verify/:bookingId
   * Receptionist verifies/confirms a pending payment.
   * Marks payment as completed and booking as confirmed.
   */
  async verifyPayment(req, res) {
    try {
      const { bookingId } = req.params;
      const { action } = req.body; // 'approve' or 'reject'

      const booking = await BookingModel.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      if (booking.status !== 'pending_verification') {
        return res.status(400).json({
          success: false,
          message: `Cannot verify booking in status: ${booking.status}`
        });
      }

      if (action === 'approve') {
        await BookingModel.verifyPayment(bookingId, req.user.id);
        await BookingModel.updateStatus(bookingId, 'confirmed');
        res.json({
          success: true,
          message: 'Payment verified. Booking confirmed.'
        });
      } else if (action === 'reject') {
        await pool.execute(
          `UPDATE payments SET status = 'failed' WHERE booking_id = ?`,
          [bookingId]
        );
        await BookingModel.updateStatus(bookingId, 'cancelled');
        res.json({
          success: true,
          message: 'Payment rejected. Booking cancelled.'
        });
      } else {
        res.status(400).json({
          success: false,
          message: "action must be 'approve' or 'reject'"
        });
      }
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment'
      });
    }
  },

  /**
   * GET /api/payment/pending
   * Receptionist — list all bookings pending payment verification.
   */
  async getPendingPayments(req, res) {
    try {
      const bookings = await BookingModel.findByStatus('pending_verification');

      // Also fetch payment records for each booking
      const enriched = await Promise.all(
        bookings.map(async (b) => {
          const [payments] = await pool.execute(
            `SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1`,
            [b.id]
          );
          return { ...b, payment: payments[0] || null };
        })
      );

      res.json({
        success: true,
        data: enriched
      });
    } catch (error) {
      console.error('Get pending payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending payments'
      });
    }
  }
};

module.exports = paymentController;
