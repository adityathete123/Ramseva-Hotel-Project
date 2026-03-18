const { pool } = require('../config/db');

const CustomerModel = {
  /**
   * Create the customers table if it doesn't exist.
   */
  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id CHAR(36) DEFAULT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        id_type ENUM('aadhaar', 'passport', 'driving_license', 'voter_id', 'pan_card') DEFAULT NULL,
        id_number VARCHAR(100) DEFAULT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_email (email),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(sql);
  },

  /**
   * Find by user ID.
   */
  async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM customers WHERE user_id = ? LIMIT 1',
      [userId]
    );
    return rows[0] || null;
  },

  /**
   * Find by ID.
   */
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM customers WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a customer record.
   */
  async create({ user_id, name, email, phone, id_type, id_number, address }) {
    const sql = `
      INSERT INTO customers (user_id, name, email, phone, id_type, id_number, address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      user_id || null,
      name,
      email || null,
      phone || null,
      id_type || null,
      id_number || null,
      address || null,
    ]);
    return result;
  },

  /**
   * Get all customers.
   */
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
    return rows;
  },
};

module.exports = CustomerModel;
