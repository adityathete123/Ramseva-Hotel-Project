const { pool } = require('../config/db');

const UserModel = {
  /**
   * Create the users table if it doesn't exist.
   */
  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'receptionist', 'customer') NOT NULL DEFAULT 'customer',
        phone VARCHAR(20),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.execute(sql);
  },

  /**
   * Find a user by email.
   */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by ID.
   */
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, phone, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new user.
   */
  async create({ id, name, email, password, role = 'customer', phone = null }) {
    const sql = `
      INSERT INTO users (id, name, email, password, role, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [id, name, email, password, role, phone]);
    return result;
  },

  /**
   * Get all employees (admin & receptionist).
   */
  async findAllEmployees() {
    const [rows] = await pool.execute(
      `SELECT id, name, email, role, phone, is_active, created_at, updated_at 
       FROM users 
       WHERE role IN ('admin', 'receptionist') 
       ORDER BY created_at DESC`
    );
    return rows;
  },

  /**
   * Get all users.
   */
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, phone, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  /**
   * Update user role.
   */
  async updateRole(id, role) {
    const [result] = await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );
    return result;
  },

  /**
   * Update user details.
   */
  async update(id, fields) {
    const allowed = ['name', 'phone', 'role', 'is_active'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(sql, values);
    return result;
  },

  /**
   * Check if email already exists.
   */
  async emailExists(email) {
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows.length > 0;
  },
};

module.exports = UserModel;
