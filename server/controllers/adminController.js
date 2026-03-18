const BookingModel = require('../models/bookingModel');

const adminController = {
  /**
   * Get dashboard statistics.
   */
  async getDashboardStats(req, res) {
    try {
      const stats = await BookingModel.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }
};

module.exports = adminController;
