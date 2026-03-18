const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const roomController = require('../controllers/roomController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// ==================== MULTER CONFIG ====================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `room_${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5, // Max 5 images at once
  },
});

// ==================== PUBLIC ROUTES ====================

// GET /api/rooms/types — Get all room types (public)
router.get('/types', roomController.getRoomTypes);

// GET /api/rooms/types/:id — Get single room type (public)
router.get('/types/:id', roomController.getRoomTypeById);

// GET /api/rooms/availability — Get available room types for dates (public)
router.get('/availability', roomController.checkAvailability);

// ==================== ADMIN-ONLY ROUTES ====================

// POST /api/rooms/types/init — Initialize default room types (admin)
router.post(
  '/types/init',
  verifyToken,
  authorizeRoles('admin'),
  roomController.initRoomTypes
);

// PUT /api/rooms/types/:id/price — Update room price (admin)
router.put(
  '/types/:id/price',
  verifyToken,
  authorizeRoles('admin'),
  roomController.updatePrice
);

// PUT /api/rooms/types/:id/availability — Update room availability (admin)
router.put(
  '/types/:id/availability',
  verifyToken,
  authorizeRoles('admin'),
  roomController.updateAvailability
);

// PUT /api/rooms/types/:id/discount — Set discount (admin)
router.put(
  '/types/:id/discount',
  verifyToken,
  authorizeRoles('admin'),
  roomController.setDiscount
);

// GET /api/rooms/types/:id/seasonal — Get seasonal pricing rules (admin)
router.get(
  '/types/:id/seasonal',
  verifyToken,
  authorizeRoles('admin'),
  roomController.getSeasonalPricing
);

// POST /api/rooms/types/:id/seasonal — Add seasonal pricing rule (admin)
router.post(
  '/types/:id/seasonal',
  verifyToken,
  authorizeRoles('admin'),
  roomController.addSeasonalPricing
);

// DELETE /api/rooms/seasonal/:id — Delete seasonal pricing rule (admin)
router.delete(
  '/seasonal/:id',
  verifyToken,
  authorizeRoles('admin'),
  roomController.deleteSeasonalPricing
);

// POST /api/rooms/types/:id/images — Upload room images (admin)
router.post(
  '/types/:id/images',
  verifyToken,
  authorizeRoles('admin'),
  (req, res, next) => {
    upload.array('images', 5)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds the 5MB limit',
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Maximum 5 images allowed per upload',
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  roomController.uploadImages
);

// DELETE /api/rooms/images/:imageId — Delete a room image (admin)
router.delete(
  '/images/:imageId',
  verifyToken,
  authorizeRoles('admin'),
  roomController.deleteImage
);

module.exports = router;
