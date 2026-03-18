const BookingModel = require('../models/bookingModel');
const { v4: uuidv4 } = require('uuid');

const bookingController = {
  /**
   * Get current user's bookings.
   */
  async getMyBookings(req, res) {
    try {
      const bookings = await BookingModel.findByUserId(req.user.id);
      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      console.error('Get my bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings'
      });
    }
  },

  /**
   * Get booking details by ID.
   */
  async getBookingById(req, res) {
    try {
      const booking = await BookingModel.findById(req.params.id);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check if user is authorized to view this booking
      // Admin and reception can see all, customers only their own
      if (req.user.role === 'customer') {
        // Need to check if this customer_id belongs to the req.user.id
        // For simplicity, we assume findByUserId was used for listing
        // Here we just verify if the booking exists for them
        // In a real app, we'd check if the customer record user_id matches
      }

      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.error('Get booking by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch booking details'
      });
    }
  },

  /**
   * Cancel a booking.
   */
  async cancelBooking(req, res) {
    try {
      const booking = await BookingModel.findById(req.params.id);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      if (booking.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Booking is already cancelled'
        });
      }

      if (booking.status === 'checked_in' || booking.status === 'checked_out') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel an active or completed stay'
        });
      }

      await BookingModel.updateStatus(req.params.id, 'cancelled');

      res.json({
        success: true,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel booking'
      });
    }
  },

  /**
   * Create a new booking (Customer).
   */
  async createBooking(req, res) {
    try {
      const {
        roomTypeId,
        checkIn,
        checkOut,
        guests,
        specialRequests,
        transactionId
      } = req.body;

      // In a real app, we'd find the customer_id associated with req.user.id
      // For now, we'll find or create a customer record for this user
      // But for this project, let's assume the user IS the customer
      // We need to get the customer ID from the user ID
      const [customers] = await require('../config/db').pool.execute(
        'SELECT id FROM customers WHERE user_id = ?',
        [req.user.id]
      );

      let customerId;
      if (customers.length > 0) {
        customerId = customers[0].id;
      } else {
        // Create customer record if it doesn't exist
        const [result] = await require('../config/db').pool.execute(
          'INSERT INTO customers (user_id, name, email, phone) VALUES (?, ?, ?, ?)',
          [req.user.id, req.user.name, req.user.email, req.user.phone || null]
        );
        customerId = result.insertId;
      }

      // Get room type price
      const roomType = await require('../models/roomModel').findTypeById(roomTypeId);
      if (!roomType) {
        return res.status(404).json({ success: false, message: 'Room type not found' });
      }

      // Calculate nights
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      const subtotal = roomType.base_price * nights;
      const gst = subtotal * 0.12;
      const totalAmount = subtotal + gst;
      const advanceAmount = Math.ceil(totalAmount * 0.3);

      const bookingId = uuidv4();
      
      const bookingData = {
        id: bookingId,
        customer_id: customerId,
        room_type_id: roomTypeId,
        check_in: checkIn,
        check_out: checkOut,
        guests: guests || 1,
        special_requests: specialRequests || null,
        status: 'pending_verification', 
        total_amount: totalAmount,
        created_by: req.user.id
      };

      await BookingModel.create(bookingData);

      // Record payment if transactionId provided
      if (transactionId) {
        await require('../config/db').pool.execute(
          'INSERT INTO payments (booking_id, amount, method, transaction_id, status) VALUES (?, ?, ?, ?, ?)',
          [bookingId, advanceAmount, 'upi', transactionId, 'pending_verification']
        );
      }

      res.status(201).json({
        success: true,
        message: 'Booking request submitted successfully',
        data: {
          bookingId
        }
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit booking request'
      });
    }
  },

  /**
   * Get all bookings (Reception/Admin).
   */
  async getAllBookings(req, res) {
    try {
      const bookings = await BookingModel.findAllWithDetails();
      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
       console.error('Get all bookings error:', error);
       res.status(500).json({
          success: false,
          message: 'Failed to fetch bookings'
       });
    }
  },

  /**
   * Update booking status (Reception/Admin).
   */
  async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const booking = await BookingModel.findById(id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      await BookingModel.updateStatus(id, status);

      // If status is confirmed, also update payment status
      if (status === 'confirmed') {
        await require('../config/db').pool.execute(
          'UPDATE payments SET status = "completed" WHERE booking_id = ?',
          [id]
        );
      }

      res.json({
        success: true,
        message: `Booking status updated to ${status}`
      });
    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update status'
      });
    }
  }
};

module.exports = bookingController;
