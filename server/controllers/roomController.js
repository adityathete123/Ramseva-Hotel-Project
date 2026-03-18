const path = require('path');
const fs = require('fs');
const RoomModel = require('../models/roomModel');
const { sendSuccess, sendError, sendCreated, sendBadRequest, sendNotFound } = require('../utils/responseHelper');
const { validateFields, isPositiveNumber } = require('../utils/validators');

/**
 * GET /api/rooms/types
 * Get all room types with availability info.
 */
async function getRoomTypes(req, res) {
  try {
    const roomTypes = await RoomModel.findAllTypes();

    // Attach images for each room type
    const typesWithImages = await Promise.all(
      roomTypes.map(async (rt) => {
        const images = await RoomModel.getImages(rt.id);
        return {
          ...rt,
          amenities: typeof rt.amenities === 'string' ? JSON.parse(rt.amenities) : rt.amenities,
          images,
        };
      })
    );

    return sendSuccess(res, typesWithImages, 'Room types retrieved successfully');
  } catch (error) {
    console.error('Get room types error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * GET /api/rooms/types/:id
 * Get a single room type by ID.
 */
async function getRoomTypeById(req, res) {
  try {
    const { id } = req.params;
    const roomType = await RoomModel.findTypeById(id);

    if (!roomType) {
      return sendNotFound(res, 'Room type not found');
    }

    const images = await RoomModel.getImages(id);
    roomType.amenities = typeof roomType.amenities === 'string'
      ? JSON.parse(roomType.amenities)
      : roomType.amenities;
    roomType.images = images;

    return sendSuccess(res, roomType, 'Room type retrieved successfully');
  } catch (error) {
    console.error('Get room type error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * PUT /api/rooms/types/:id/price
 * Update the base price of a room type (admin only).
 */
async function updatePrice(req, res) {
  try {
    const { id } = req.params;
    const { base_price } = req.body;

    if (!base_price || !isPositiveNumber(Number(base_price))) {
      return sendBadRequest(res, 'base_price must be a positive number');
    }

    const roomType = await RoomModel.findTypeById(id);
    if (!roomType) {
      return sendNotFound(res, 'Room type not found');
    }

    await RoomModel.updatePrice(id, base_price);

    return sendSuccess(res, { id: Number(id), base_price: Number(base_price) }, 'Room price updated successfully');
  } catch (error) {
    console.error('Update price error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * PUT /api/rooms/types/:id/availability
 * Update total rooms count for a room type (admin only).
 */
async function updateAvailability(req, res) {
  try {
    const { id } = req.params;
    const { total_rooms } = req.body;

    if (total_rooms === undefined || total_rooms === null || Number(total_rooms) < 0) {
      return sendBadRequest(res, 'total_rooms must be a non-negative number');
    }

    const roomType = await RoomModel.findTypeById(id);
    if (!roomType) {
      return sendNotFound(res, 'Room type not found');
    }

    await RoomModel.updateAvailability(id, total_rooms);

    return sendSuccess(res, { id: Number(id), total_rooms: Number(total_rooms) }, 'Room availability updated successfully');
  } catch (error) {
    console.error('Update availability error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * PUT /api/rooms/types/:id/discount
 * Set discount percentage and date range for a room type (admin only).
 */
async function setDiscount(req, res) {
  try {
    const { id } = req.params;
    const { discount_percentage, discount_start_date, discount_end_date } = req.body;

    if (discount_percentage === undefined || discount_percentage < 0 || discount_percentage > 100) {
      return sendBadRequest(res, 'discount_percentage must be between 0 and 100');
    }

    const roomType = await RoomModel.findTypeById(id);
    if (!roomType) {
      return sendNotFound(res, 'Room type not found');
    }

    // Validate dates if discount > 0
    if (discount_percentage > 0) {
      if (!discount_start_date || !discount_end_date) {
        return sendBadRequest(res, 'discount_start_date and discount_end_date are required when setting a discount');
      }

      const startDate = new Date(discount_start_date);
      const endDate = new Date(discount_end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return sendBadRequest(res, 'Invalid date format');
      }

      if (endDate <= startDate) {
        return sendBadRequest(res, 'discount_end_date must be after discount_start_date');
      }
    }

    await RoomModel.setDiscount(id, {
      discount_percentage,
      discount_start_date: discount_start_date || null,
      discount_end_date: discount_end_date || null,
    });

    return sendSuccess(res, {
      id: Number(id),
      discount_percentage,
      discount_start_date,
      discount_end_date,
    }, 'Discount set successfully');
  } catch (error) {
    console.error('Set discount error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * POST /api/rooms/types/:id/images
 * Upload one or more images for a room type (admin only).
 * Uses multer middleware attached in router.
 */
async function uploadImages(req, res) {
  try {
    const { id } = req.params;

    const roomType = await RoomModel.findTypeById(id);
    if (!roomType) {
      return sendNotFound(res, 'Room type not found');
    }

    if (!req.files || req.files.length === 0) {
      return sendBadRequest(res, 'No image files provided');
    }

    const isPrimary = req.body.is_primary === 'true' || req.body.is_primary === '1';

    const uploadedImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const imageUrl = `/uploads/${file.filename}`;

      // First image can be set as primary
      await RoomModel.addImage(id, imageUrl, i === 0 && isPrimary);

      uploadedImages.push({
        filename: file.filename,
        url: imageUrl,
        size: file.size,
        mimetype: file.mimetype,
      });
    }

    return sendCreated(res, uploadedImages, 'Images uploaded successfully');
  } catch (error) {
    console.error('Upload images error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * DELETE /api/rooms/images/:imageId
 * Delete a room image (admin only).
 */
async function deleteImage(req, res) {
  try {
    const { imageId } = req.params;

    await RoomModel.deleteImage(imageId);

    return sendSuccess(res, null, 'Image deleted successfully');
  } catch (error) {
    console.error('Delete image error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * POST /api/rooms/types/init
 * Initialize default room types (admin only, for setup).
 */
async function initRoomTypes(req, res) {
  try {
    const defaultTypes = [
      {
        name: 'General Room',
        description: 'Comfortable rooms with basic amenities for budget-friendly stays.',
        base_price: 800,
        max_occupancy: 2,
        total_rooms: 10,
        amenities: ['Wi-Fi', 'Hot Water', 'Fan'],
      },
      {
        name: 'Standard Room',
        description: 'Well-appointed rooms with modern comforts and air conditioning.',
        base_price: 1200,
        max_occupancy: 3,
        total_rooms: 8,
        amenities: ['Wi-Fi', 'Hot Water', 'AC', 'TV'],
      },
      {
        name: 'Deluxe Room',
        description: 'Premium rooms with luxury amenities and personalized room service.',
        base_price: 2000,
        max_occupancy: 4,
        total_rooms: 5,
        amenities: ['Wi-Fi', 'Hot Water', 'AC', 'TV', 'Mini Fridge', 'Room Service'],
      },
    ];

    const results = [];

    for (const type of defaultTypes) {
      try {
        await RoomModel.createType(type);
        results.push({ name: type.name, status: 'created' });
      } catch (err) {
        // Duplicate entry — already exists
        if (err.code === 'ER_DUP_ENTRY') {
          results.push({ name: type.name, status: 'already exists' });
        } else {
          results.push({ name: type.name, status: 'error', message: err.message });
        }
      }
    }

    return sendSuccess(res, { results }, 'Room types initialized');
  } catch (error) {
    console.error('Init room types error:', error);
    return sendError(res, 'Failed to initialize room types');
  }
}

/**
 * GET /api/rooms/availability
 * Check room availability for specific dates and guest count.
 */
async function checkAvailability(req, res) {
  try {
    const { checkIn, checkOut, guests } = req.query;

    if (!checkIn || !checkOut) {
      return sendBadRequest(res, 'checkIn and checkOut dates are required');
    }

    const availableTypes = await RoomModel.checkAvailability({
      checkIn,
      checkOut,
      guests: Number(guests) || 1,
    });

    // Attach images for each available room type
    const typesWithImages = await Promise.all(
      availableTypes.map(async (rt) => {
        const images = await RoomModel.getImages(rt.id);
        return {
          ...rt,
          amenities: typeof rt.amenities === 'string' ? JSON.parse(rt.amenities) : rt.amenities,
          images,
        };
      })
    );

    return sendSuccess(res, typesWithImages, 'Available rooms retrieved successfully');
  } catch (error) {
    console.error('Check availability error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * GET /api/rooms/types/:id/seasonal
 * Get seasonal pricing rules for a room type (admin only).
 */
async function getSeasonalPricing(req, res) {
  try {
    const { id } = req.params;
    const rules = await RoomModel.getSeasonalPricing(id);
    return sendSuccess(res, rules, 'Seasonal pricing rules retrieved successfully');
  } catch (error) {
    console.error('Get seasonal pricing error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * POST /api/rooms/types/:id/seasonal
 * Add a seasonal pricing rule (admin only).
 */
async function addSeasonalPricing(req, res) {
  try {
    const { id } = req.params;
    const { name, start_date, end_date, price_multiplier, fixed_price, priority } = req.body;

    if (!name || !start_date || !end_date) {
      return sendBadRequest(res, 'name, start_date and end_date are required');
    }

    await RoomModel.addSeasonalPricing({
      room_type_id: id,
      name,
      start_date,
      end_date,
      price_multiplier,
      fixed_price,
      priority
    });

    return sendCreated(res, null, 'Seasonal pricing rule added successfully');
  } catch (error) {
    console.error('Add seasonal pricing error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * DELETE /api/rooms/seasonal/:id
 * Delete a seasonal pricing rule (admin only).
 */
async function deleteSeasonalPricing(req, res) {
  try {
    const { id } = req.params;
    await RoomModel.deleteSeasonalPricing(id);
    return sendSuccess(res, null, 'Seasonal pricing rule deleted successfully');
  } catch (error) {
    console.error('Delete seasonal pricing error:', error);
    return sendError(res, 'Internal server error');
  }
}

module.exports = {
  getRoomTypes,
  getRoomTypeById,
  updatePrice,
  updateAvailability,
  setDiscount,
  uploadImages,
  deleteImage,
  initRoomTypes,
  checkAvailability,
  getSeasonalPricing,
  addSeasonalPricing,
  deleteSeasonalPricing,
};
