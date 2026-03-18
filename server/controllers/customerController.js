const RoomModel = require('../models/roomModel');
const { sendSuccess, sendError, sendBadRequest } = require('../utils/responseHelper');
const { validateFields } = require('../utils/validators');

/**
 * GET /api/customer/categories
 * Get all room categories with pricing and images.
 * Public endpoint — no authentication required.
 */
async function getRoomCategories(req, res) {
  try {
    const roomTypes = await RoomModel.findAllTypes();

    const categories = await Promise.all(
      roomTypes.map(async (rt) => {
        const images = await RoomModel.getImages(rt.id);

        // Calculate effective price
        let effectivePrice = parseFloat(rt.base_price);
        let discountActive = false;
        const now = new Date();

        if (
          rt.discount_percentage > 0 &&
          rt.discount_start_date &&
          rt.discount_end_date
        ) {
          const startDate = new Date(rt.discount_start_date);
          const endDate = new Date(rt.discount_end_date);
          if (now >= startDate && now <= endDate) {
            effectivePrice = effectivePrice * (1 - rt.discount_percentage / 100);
            discountActive = true;
          }
        }

        return {
          id: rt.id,
          name: rt.name,
          description: rt.description,
          base_price: parseFloat(rt.base_price),
          effective_price: Math.round(effectivePrice * 100) / 100,
          max_occupancy: rt.max_occupancy,
          total_rooms: rt.total_rooms,
          amenities: typeof rt.amenities === 'string' ? JSON.parse(rt.amenities) : rt.amenities,
          discount_percentage: parseFloat(rt.discount_percentage) || 0,
          discount_active: discountActive,
          images: images.map((img) => ({
            id: img.id,
            url: img.image_url,
            is_primary: !!img.is_primary,
          })),
        };
      })
    );

    return sendSuccess(res, categories, 'Room categories retrieved successfully');
  } catch (error) {
    console.error('Get categories error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * POST /api/customer/availability
 * Check room availability for given dates and room type.
 * Public endpoint.
 */
async function checkAvailability(req, res) {
  try {
    const errors = validateFields(req.body, [
      { field: 'room_type_id', label: 'Room Type', type: 'number' },
      { field: 'check_in', label: 'Check-in Date', type: 'date' },
      { field: 'check_out', label: 'Check-out Date', type: 'date' },
    ]);

    if (errors.length > 0) {
      return sendBadRequest(res, 'Validation failed', errors);
    }

    const { room_type_id, check_in, check_out, rooms_needed = 1 } = req.body;

    // Validate date logic
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return sendBadRequest(res, 'Check-in date cannot be in the past');
    }

    if (checkOutDate <= checkInDate) {
      return sendBadRequest(res, 'Check-out date must be after check-in date');
    }

    const availability = await RoomModel.checkAvailability(room_type_id, check_in, check_out);

    if (!availability) {
      return sendBadRequest(res, 'Room type not found');
    }

    // Calculate total cost
    const totalCost = availability.pricePerNight * availability.nights * rooms_needed;

    return sendSuccess(res, {
      ...availability,
      rooms_needed,
      canBook: availability.availableRooms >= rooms_needed,
      total_cost: Math.round(totalCost * 100) / 100,
    }, 'Availability checked successfully');
  } catch (error) {
    console.error('Check availability error:', error);
    return sendError(res, 'Internal server error');
  }
}

module.exports = {
  getRoomCategories,
  checkAvailability,
};
