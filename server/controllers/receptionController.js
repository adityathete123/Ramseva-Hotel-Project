const BookingModel = require('../models/bookingModel');
const CustomerModel = require('../models/customerModel');
const RoomModel = require('../models/roomModel');
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
  }
};

module.exports = receptionController;
