const BookingModel = require('../models/bookingModel');
const CustomerModel = require('../models/customerModel');
const RoomModel = require('../models/roomModel');
const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const receptionController = {
  /**
   * Handle walk-in booking.
   */
  async walkIn(req, res) {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        idType,
        idNumber,
        address,
        roomTypeId,
        checkIn,
        checkOut,
        guests,
        roomsBooked,
        totalAmount,
        specialRequests
      } = req.body;

      // 1. Create or find customer
      // For walk-in, we just create a record
      const customerResult = await CustomerModel.create({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        id_type: idType,
        id_number: idNumber,
        address: address
      });

      const customerId = customerResult.insertId;

      // 2. Create booking
      const bookingId = uuidv4();
      await BookingModel.create({
        id: bookingId,
        customer_id: customerId,
        room_type_id: roomTypeId,
        check_in: checkIn,
        check_out: checkOut,
        status: 'confirmed',
        guests: guests,
        rooms_booked: roomsBooked,
        total_amount: totalAmount,
        special_requests: specialRequests,
        created_by: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Walk-in booking created successfully',
        data: { bookingId }
      });
    } catch (error) {
      console.error('Walk-in error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process walk-in booking'
      });
    }
  },

  /**
   * Handle check-in.
   */
  async checkIn(req, res) {
    try {
      const { id } = req.params;
      const { roomId } = req.body; // Room assigned during check-in

      const booking = await BookingModel.findById(id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Update booking status and assign room
      await BookingModel.updateStatus(id, 'checked_in');
      
      // Update room status to occupied
      if (roomId) {
        await RoomModel.updateStatus(roomId, 'occupied');
        // Update booking with the specific room_id
        // (Assuming we have a way to update other fields in booking)
        // For now, let's keep it simple as the DB schema shows room_id in bookings
      }

      res.json({
        success: true,
        message: 'Guest checked in successfully'
      });
    } catch (error) {
      console.error('Check-in error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process check-in'
      });
    }
  },

  /**
   * Handle check-out.
   */
  async checkOut(req, res) {
    try {
      const { id } = req.params;

      const booking = await BookingModel.findById(id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Update booking status
      await BookingModel.updateStatus(id, 'checked_out');

      // If booking had a room assigned, mark it as available or maintenance
      if (booking.room_id) {
        await RoomModel.updateStatus(booking.room_id, 'available');
      }

      res.json({
        success: true,
        message: 'Guest checked out successfully'
      });
    } catch (error) {
      console.error('Check-out error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process check-out'
      });
    }
  },

  /**
   * Get reception dashboard data.
   */
  async getDashboardData(req, res) {
    try {
      const bookings = await BookingModel.findAllWithDetails();
      const rooms = await RoomModel.findAllRoomsWithTypes();
      
      // Calculate real-time stats for reception
      const todayCheckIns = bookings.filter(b => {
        const today = new Date().toISOString().split('T')[0];
        const checkIn = new Date(b.check_in).toISOString().split('T')[0];
        return checkIn === today && b.status !== 'cancelled';
      }).length;

      const availableRooms = rooms.filter(r => r.status === 'available').length;
      const totalCheckIns = bookings.filter(b => b.status === 'checked_in' || b.status === 'checked_out').length;

      res.json({
        success: true,
        data: {
          bookings,
          rooms,
          stats: {
            todayCheckIns,
            totalCheckIns,
            availableRooms
          }
        }
      });
    } catch (error) {
      console.error('Reception dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data'
      });
    }
  },

  /**
   * Extend a booking's stay.
   * PUT /api/reception/extend-stay/:id
   * Body: { newCheckOut }
   */
  async extendStay(req, res) {
    try {
      const { id } = req.params;
      const { newCheckOut } = req.body;

      if (!newCheckOut) {
        return res.status(400).json({
          success: false,
          message: 'newCheckOut date is required'
        });
      }

      const booking = await BookingModel.findById(id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (!['confirmed', 'checked_in'].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot extend a booking with status: ${booking.status}`
        });
      }

      const newCheckOutDate = new Date(newCheckOut);
      const oldCheckOutDate = new Date(booking.check_out);

      if (newCheckOutDate <= oldCheckOutDate) {
        return res.status(400).json({
          success: false,
          message: 'New check-out date must be after current check-out date'
        });
      }

      // Recalculate total amount based on new duration
      const checkIn = new Date(booking.check_in);
      const diffTime = Math.abs(newCheckOutDate.getTime() - checkIn.getTime());
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      const subtotal = booking.base_price * nights;
      const gst = subtotal * 0.12;
      const newTotal = subtotal + gst;

      await BookingModel.extendStay(id, newCheckOut, newTotal);

      res.json({
        success: true,
        message: 'Stay extended successfully',
        data: {
          bookingId: id,
          oldCheckOut: booking.check_out,
          newCheckOut,
          nights,
          newTotal
        }
      });
    } catch (error) {
      console.error('Extend stay error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to extend stay'
      });
    }
  },

  /**
   * Get full guest list with payment info.
   * GET /api/reception/guests
   */
  async getGuestList(req, res) {
    try {
      const [rows] = await pool.execute(
        `SELECT b.*,
          rt.name as room_type_name, rt.base_price,
          c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
          c.id_type, c.id_number, c.address,
          r.room_number,
          p.transaction_id, p.method as payment_method, p.status as payment_status, p.amount as paid_amount
         FROM bookings b
         LEFT JOIN room_types rt ON b.room_type_id = rt.id
         LEFT JOIN customers c ON b.customer_id = c.id
         LEFT JOIN rooms r ON b.room_id = r.id
         LEFT JOIN payments p ON b.id = p.booking_id
         WHERE b.status NOT IN ('cancelled')
         ORDER BY b.check_in DESC`
      );

      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Get guest list error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch guest list' });
    }
  },

  /**
   * Get today's check-ins.
   * GET /api/reception/today-checkins
   */
  async getTodayCheckIns(req, res) {
    try {
      const bookings = await BookingModel.findTodayCheckIns();
      res.json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      console.error('Get today check-ins error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch today\'s check-ins' });
    }
  },

  /**
   * Get pending verification bookings.
   * GET /api/reception/pending
   */
  async getPendingVerification(req, res) {
    try {
      const bookings = await BookingModel.findByStatus('pending_verification');

      const enriched = await Promise.all(
        bookings.map(async (b) => {
          const [payments] = await pool.execute(
            `SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1`,
            [b.id]
          );
          return { ...b, payment: payments[0] || null };
        })
      );

      res.json({ success: true, data: enriched, count: enriched.length });
    } catch (error) {
      console.error('Get pending verification error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch pending bookings' });
    }
  }
};

module.exports = receptionController;

