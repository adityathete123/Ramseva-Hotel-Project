const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const BookingModel = {
  /**
   * Create booking-related tables.
   */
  async createTables() {
    const bookingsSql = `
      CREATE TABLE IF NOT EXISTS bookings (
        id CHAR(36) PRIMARY KEY,
        customer_id INT DEFAULT NULL,
        room_id INT DEFAULT NULL,
        room_type_id INT NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'pending_verification') DEFAULT 'pending',
        guests INT DEFAULT 1,
        rooms_booked INT DEFAULT 1,
        special_requests TEXT,
        total_amount DECIMAL(10, 2) DEFAULT 0,
        created_by CHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_check_in (check_in),
        INDEX idx_check_out (check_out),
        INDEX idx_customer (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const paymentsSql = `
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id CHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        method ENUM('upi', 'cash', 'card', 'bank_transfer') DEFAULT 'upi',
        transaction_id VARCHAR(255) DEFAULT NULL,
        status ENUM('pending', 'completed', 'failed', 'refunded', 'pending_verification') DEFAULT 'pending',
        verified_by CHAR(36) DEFAULT NULL,
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        INDEX idx_booking (booking_id),
        INDEX idx_status (status),
        INDEX idx_transaction (transaction_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const hotelPaymentDetailsSql = `
      CREATE TABLE IF NOT EXISTS hotel_payment_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        upi_id VARCHAR(255) DEFAULT NULL,
        qr_code_url VARCHAR(500) DEFAULT NULL,
        bank_name VARCHAR(255) DEFAULT NULL,
        account_holder VARCHAR(255) DEFAULT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.execute(bookingsSql);
    await pool.execute(paymentsSql);
    await pool.execute(hotelPaymentDetailsSql);
  },

  /**
   * Find booking by ID with joined data (including payments).
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT b.*, 
        rt.name as room_type_name, rt.base_price,
        c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
        p.transaction_id, p.method as payment_method, p.status as payment_status, p.amount as paid_amount
       FROM bookings b
       LEFT JOIN room_types rt ON b.room_type_id = rt.id
       LEFT JOIN customers c ON b.customer_id = c.id
       LEFT JOIN payments p ON b.id = p.booking_id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find bookings for a specific user (customer).
   */
  async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT b.*, rt.name as room_type_name
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       LEFT JOIN room_types rt ON b.room_type_id = rt.id
       WHERE c.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return rows;
  },

  /**
   * Find all bookings with details for reception/admin.
   */
  async findAllWithDetails() {
    const [rows] = await pool.execute(
      `SELECT b.*, 
        rt.name as room_type_name,
        c.name as customer_name, c.phone as customer_phone
       FROM bookings b
       LEFT JOIN room_types rt ON b.room_type_id = rt.id
       LEFT JOIN customers c ON b.customer_id = c.id
       ORDER BY b.created_at DESC`
    );
    return rows;
  },

  /**
   * Update booking status.
   */
  async updateStatus(id, status) {
    await pool.execute(
      `UPDATE bookings SET status = ? WHERE id = ?`,
      [status, id]
    );
    return true;
  },

  /**
   * Create a new booking.
   */
  async create({ id, customer_id, room_type_id, check_in, check_out, status, guests, rooms_booked, special_requests, total_amount, created_by }) {
    const sql = `
      INSERT INTO bookings (id, customer_id, room_type_id, check_in, check_out, status, guests, rooms_booked, special_requests, total_amount, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      id || uuidv4(),
      customer_id,
      room_type_id,
      check_in,
      check_out,
      status || 'confirmed',
      guests || 1,
      rooms_booked || 1,
      special_requests || null,
      total_amount || 0,
      created_by || null
    ]);
    return result;
  },

  /**
   * Get dashboard stats.
   */
  async getStats() {
    const [revenueRows] = await pool.execute(
      `SELECT SUM(total_amount) as totalRevenue FROM bookings WHERE status IN ('confirmed', 'checked_in', 'checked_out')`
    );
    
    const [bookingRows] = await pool.execute(
      `SELECT COUNT(*) as totalBookings FROM bookings`
    );
    
    const [todayRows] = await pool.execute(
      `SELECT COUNT(*) as todayBookings FROM bookings WHERE DATE(created_at) = CURDATE()`
    );
    
    const [inHouseRows] = await pool.execute(
      `SELECT COUNT(*) as inHouse FROM bookings WHERE status = 'checked_in'`
    );
    
    const [revenueByTypeRows] = await pool.execute(
      `SELECT rt.name, SUM(b.total_amount) as revenue 
       FROM bookings b 
       JOIN room_types rt ON b.room_type_id = rt.id 
       WHERE b.status IN ('confirmed', 'checked_in', 'checked_out')
       GROUP BY rt.id`
    );

    const revenueByType = {};
    revenueByTypeRows.forEach(row => {
      revenueByType[row.name] = parseFloat(row.revenue) || 0;
    });

    return {
      totalRevenue: parseFloat(revenueRows[0].totalRevenue) || 0,
      totalBookings: bookingRows[0].totalBookings,
      todayBookings: todayRows[0].todayBookings,
      inHouse: inHouseRows[0].inHouse,
      revenueByType
    };
  },

  /**
   * Extend a booking's check-out date and update total amount.
   */
  async extendStay(id, newCheckOut, newTotalAmount) {
    await pool.execute(
      `UPDATE bookings SET check_out = ?, total_amount = ? WHERE id = ?`,
      [newCheckOut, newTotalAmount, id]
    );
    return true;
  },

  /**
   * Find today's check-ins (bookings with check_in = today, not cancelled).
   */
  async findTodayCheckIns() {
    const [rows] = await pool.execute(
      `SELECT b.*,
        rt.name as room_type_name, rt.base_price,
        c.name as customer_name, c.phone as customer_phone, c.email as customer_email
       FROM bookings b
       LEFT JOIN room_types rt ON b.room_type_id = rt.id
       LEFT JOIN customers c ON b.customer_id = c.id
       WHERE DATE(b.check_in) = CURDATE()
         AND b.status NOT IN ('cancelled')
       ORDER BY b.check_in ASC`
    );
    return rows;
  },

  /**
   * Find bookings by status.
   */
  async findByStatus(status) {
    const [rows] = await pool.execute(
      `SELECT b.*,
        rt.name as room_type_name,
        c.name as customer_name, c.phone as customer_phone
       FROM bookings b
       LEFT JOIN room_types rt ON b.room_type_id = rt.id
       LEFT JOIN customers c ON b.customer_id = c.id
       WHERE b.status = ?
       ORDER BY b.created_at DESC`,
      [status]
    );
    return rows;
  },

  /**
   * Get hotel payment details (active UPI + QR).
   */
  async getHotelPaymentDetails() {
    const [rows] = await pool.execute(
      `SELECT * FROM hotel_payment_details WHERE is_active = 1 LIMIT 1`
    );
    return rows[0] || null;
  },

  /**
   * Record a payment submission.
   */
  async recordPayment({ booking_id, amount, method, transaction_id }) {
    const [result] = await pool.execute(
      `INSERT INTO payments (booking_id, amount, method, transaction_id, status)
       VALUES (?, ?, ?, ?, 'pending_verification')
       ON DUPLICATE KEY UPDATE transaction_id = VALUES(transaction_id), status = 'pending_verification', updated_at = CURRENT_TIMESTAMP`,
      [booking_id, amount, method || 'upi', transaction_id]
    );
    return result;
  },

  /**
   * Verify a payment (receptionist action).
   */
  async verifyPayment(bookingId, verifiedBy) {
    await pool.execute(
      `UPDATE payments SET status = 'completed', verified_by = ?, verified_at = NOW() WHERE booking_id = ?`,
      [verifiedBy, bookingId]
    );
    return true;
  }
};

module.exports = BookingModel;
