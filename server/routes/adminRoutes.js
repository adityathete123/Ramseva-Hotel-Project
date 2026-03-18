const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// ==================== ADMIN-ONLY ROUTES ====================

// GET /api/admin/stats — Get dashboard statistics
router.get(
  '/stats',
  verifyToken,
  authorizeRoles('admin'),
  adminController.getDashboardStats
);

// POST /api/admin/employees — Create a new employee
router.post(
  '/employees',
  verifyToken,
  authorizeRoles('admin'),
  authController.createEmployee
);

// PUT /api/admin/employees/:id/role — Assign/change employee role
router.put(
  '/employees/:id/role',
  verifyToken,
  authorizeRoles('admin'),
  authController.updateEmployeeRole
);

// GET /api/admin/employees — List all employees
router.get(
  '/employees',
  verifyToken,
  authorizeRoles('admin'),
  authController.getEmployees
);

module.exports = router;
