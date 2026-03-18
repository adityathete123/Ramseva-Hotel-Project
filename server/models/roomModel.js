const { pool } = require('../config/db');

const RoomModel = {
  /**
   * Create room-related tables.
   */
  async createTables() {
    const roomTypesSql = `
      CREATE TABLE IF NOT EXISTS room_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        base_price DECIMAL(10, 2) NOT NULL,
        max_occupancy INT NOT NULL DEFAULT 2,
        total_rooms INT NOT NULL DEFAULT 0,
        amenities JSON,
        discount_percentage DECIMAL(5, 2) DEFAULT 0,
        discount_start_date DATE DEFAULT NULL,
        discount_end_date DATE DEFAULT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const roomsSql = `
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_type_id INT NOT NULL,
        room_number VARCHAR(20) NOT NULL UNIQUE,
        floor INT DEFAULT 1,
        status ENUM('available', 'occupied', 'maintenance', 'blocked') DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
        INDEX idx_room_type (room_type_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const roomImagesSql = `
      CREATE TABLE IF NOT EXISTS room_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_type_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        is_primary TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
        INDEX idx_room_type_img (room_type_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const seasonalPricingSql = `
      CREATE TABLE IF NOT EXISTS seasonal_pricing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_type_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        price_multiplier DECIMAL(5, 2) DEFAULT 1.00,
        fixed_price DECIMAL(10, 2) DEFAULT NULL,
        priority INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
        INDEX idx_room_type_seasonal (room_type_id),
        INDEX idx_dates (start_date, end_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.execute(roomTypesSql);
    await pool.execute(roomsSql);
    await pool.execute(roomImagesSql);
    await pool.execute(seasonalPricingSql);
  },

  // ==================== SEASONAL PRICING ====================

  /**
   * Get seasonal pricing rules for a room type.
   */
  async getSeasonalPricing(roomTypeId) {
    const [rows] = await pool.execute(
      'SELECT * FROM seasonal_pricing WHERE room_type_id = ? ORDER BY priority DESC, created_at DESC',
      [roomTypeId]
    );
    return rows;
  },

  /**
   * Add a seasonal pricing rule.
   */
  async addSeasonalPricing({ room_type_id, name, start_date, end_date, price_multiplier, fixed_price, priority }) {
    const sql = `
      INSERT INTO seasonal_pricing (room_type_id, name, start_date, end_date, price_multiplier, fixed_price, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      room_type_id,
      name,
      start_date,
      end_date,
      price_multiplier || 1.0,
      fixed_price || null,
      priority || 0
    ]);
    return result;
  },

  /**
   * Delete a seasonal pricing rule.
   */
  async deleteSeasonalPricing(id) {
    const [result] = await pool.execute(
      'DELETE FROM seasonal_pricing WHERE id = ?',
      [id]
    );
    return result;
  },

  /**
   * Get active seasonal pricing for a date range.
   */
  async getActiveSeasonalRule(roomTypeId, date) {
    const [rows] = await pool.execute(
      `SELECT * FROM seasonal_pricing 
       WHERE room_type_id = ? 
         AND start_date <= ? 
         AND end_date >= ? 
       ORDER BY priority DESC, created_at DESC LIMIT 1`,
      [roomTypeId, date, date]
    );
    return rows[0] || null;
  },

  // ==================== ROOM TYPES ====================

  /**
   * Get all room types.
   */
  async findAllTypes() {
    const [rows] = await pool.execute(
      `SELECT rt.*, 
        (SELECT COUNT(*) FROM rooms r WHERE r.room_type_id = rt.id) as total_rooms_count
       FROM room_types rt 
       WHERE rt.is_active = 1 
       ORDER BY rt.base_price ASC`
    );
    return rows;
  },

  /**
   * Find room type by ID.
   */
  async findTypeById(id) {
    const [rows] = await pool.execute(
      `SELECT rt.*, 
        (SELECT COUNT(*) FROM rooms r WHERE r.room_type_id = rt.id) as total_rooms_count
       FROM room_types rt 
       WHERE rt.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a room type.
   */
  async createType({ name, description, base_price, max_occupancy, total_rooms, amenities }) {
    const sql = `
      INSERT INTO room_types (name, description, base_price, max_occupancy, total_rooms, amenities)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      name,
      description || null,
      base_price,
      max_occupancy || 2,
      total_rooms || 0,
      JSON.stringify(amenities || []),
    ]);
    return result;
  },

  /**
   * Update room type price.
   */
  async updatePrice(id, base_price) {
    const [result] = await pool.execute(
      'UPDATE room_types SET base_price = ? WHERE id = ?',
      [base_price, id]
    );
    return result;
  },

  /**
   * Update room availability (total_rooms count).
   */
  async updateAvailability(id, total_rooms) {
    const [result] = await pool.execute(
      'UPDATE room_types SET total_rooms = ? WHERE id = ?',
      [total_rooms, id]
    );
    return result;
  },

  /**
   * Set discount for a room type.
   */
  async setDiscount(id, { discount_percentage, discount_start_date, discount_end_date }) {
    const [result] = await pool.execute(
      `UPDATE room_types 
       SET discount_percentage = ?, discount_start_date = ?, discount_end_date = ? 
       WHERE id = ?`,
      [discount_percentage, discount_start_date || null, discount_end_date || null, id]
    );
    return result;
  },

  // ==================== ROOMS ====================

  /**
   * Get rooms by type.
   */
  async findRoomsByType(roomTypeId) {
    const [rows] = await pool.execute(
      'SELECT * FROM rooms WHERE room_type_id = ? ORDER BY room_number',
      [roomTypeId]
    );
    return rows;
  },

  /**
   * Get all rooms with their type info.
   */
  async findAllRoomsWithTypes() {
    const [rows] = await pool.execute(
      `SELECT r.*, rt.name as room_type_name, rt.base_price
       FROM rooms r
       JOIN room_types rt ON r.room_type_id = rt.id
       ORDER BY r.floor, r.room_number`
    );
    return rows;
  },

  /**
   * Update room status.
   */
  async updateStatus(id, status) {
    const [result] = await pool.execute(
      'UPDATE rooms SET status = ? WHERE id = ?',
      [status, id]
    );
    return result;
  },

  // ==================== ROOM IMAGES ====================

  /**
   * Add image for a room type.
   */
  async addImage(roomTypeId, imageUrl, isPrimary = false) {
    // If setting as primary, unset all others first
    if (isPrimary) {
      await pool.execute(
        'UPDATE room_images SET is_primary = 0 WHERE room_type_id = ?',
        [roomTypeId]
      );
    }

    const [result] = await pool.execute(
      'INSERT INTO room_images (room_type_id, image_url, is_primary) VALUES (?, ?, ?)',
      [roomTypeId, imageUrl, isPrimary ? 1 : 0]
    );
    return result;
  },

  /**
   * Get images for a room type.
   */
  async getImages(roomTypeId) {
    const [rows] = await pool.execute(
      'SELECT * FROM room_images WHERE room_type_id = ? ORDER BY is_primary DESC, created_at DESC',
      [roomTypeId]
    );
    return rows;
  },

  /**
   * Delete a room image.
   */
  async deleteImage(imageId) {
    const [result] = await pool.execute(
      'DELETE FROM room_images WHERE id = ?',
      [imageId]
    );
    return result;
  },

  // ==================== AVAILABILITY ====================

  /**
   * Check available rooms for a room type in a date range.
   * available_rooms = total_rooms - active_bookings
   * where active_bookings includes "confirmed" and "checked_in"
   */
  async checkAvailability(roomTypeId, checkIn, checkOut) {
    // Get total rooms for this type
    const roomType = await this.findTypeById(roomTypeId);
    if (!roomType) return null;

    // Count active bookings overlapping with the given date range
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as active_bookings
       FROM bookings 
       WHERE room_type_id = ? 
         AND status IN ('confirmed', 'checked_in')
         AND check_in < ?
         AND check_out > ?`,
      [roomTypeId, checkOut, checkIn]
    );

    const activeBookings = rows[0]?.active_bookings || 0;
    const availableRooms = roomType.total_rooms - activeBookings;

    // Calculate effective price (with seasonal pricing and discounts)
    let basePrice = parseFloat(roomType.base_price);
    const checkInDate = new Date(checkIn);
    
    // 1. Check for seasonal pricing
    const seasonalRule = await this.getActiveSeasonalRule(roomTypeId, checkIn);
    if (seasonalRule) {
      if (seasonalRule.fixed_price) {
        basePrice = parseFloat(seasonalRule.fixed_price);
      } else {
        basePrice = basePrice * parseFloat(seasonalRule.price_multiplier);
      }
    }

    let effectivePrice = basePrice;

    // 2. Apply general discount if applicable
    if (
      roomType.discount_percentage > 0 &&
      roomType.discount_start_date &&
      roomType.discount_end_date
    ) {
      const startDate = new Date(roomType.discount_start_date);
      const endDate = new Date(roomType.discount_end_date);
      if (checkInDate >= startDate && checkInDate <= endDate) {
        effectivePrice = basePrice * (1 - roomType.discount_percentage / 100);
      }
    }

    // Calculate nights
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    return {
      roomType,
      totalRooms: roomType.total_rooms,
      activeBookings,
      availableRooms: Math.max(0, availableRooms),
      isAvailable: availableRooms > 0,
      pricePerNight: effectivePrice,
      nights,
      discountApplied: effectivePrice < parseFloat(roomType.base_price),
    };
  },
};

module.exports = RoomModel;
