const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserModel = require('../models/userModel');
const { sendSuccess, sendError, sendCreated, sendBadRequest, sendUnauthorized } = require('../utils/responseHelper');
const { validateFields } = require('../utils/validators');

/**
 * POST /api/auth/login
 * Login for Admin and Receptionist (and Customer).
 */
async function login(req, res) {
  try {
    const errors = validateFields(req.body, [
      { field: 'email', label: 'Email', type: 'email' },
      { field: 'password', label: 'Password', type: 'password' },
    ]);

    if (errors.length > 0) {
      return sendBadRequest(res, 'Validation failed', errors);
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      return sendUnauthorized(res, 'Account is deactivated. Contact admin.');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Generate JWT
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user profile.
 */
async function getMe(req, res) {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    return sendSuccess(res, user, 'User profile retrieved');
  } catch (error) {
    console.error('Get me error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * POST /api/auth/register
 * Self-registration for customers only.
 */
async function register(req, res) {
  try {
    const errors = validateFields(req.body, [
      { field: 'name', label: 'Name', type: 'string' },
      { field: 'email', label: 'Email', type: 'email' },
      { field: 'password', label: 'Password', type: 'password' },
      { field: 'phone', label: 'Phone', type: 'phone', required: false },
    ]);

    if (errors.length > 0) {
      return sendBadRequest(res, 'Validation failed', errors);
    }

    const { name, email, password, phone } = req.body;

    // Check if email already exists
    const emailExists = await UserModel.emailExists(email);
    if (emailExists) {
      return sendBadRequest(res, 'Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (customer role only for self-registration)
    const userId = uuidv4();
    await UserModel.create({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: 'customer',
      phone: phone || null,
    });

    return sendCreated(res, {
      id: userId,
      name,
      email,
      role: 'customer',
    }, 'Account created successfully');
  } catch (error) {
    console.error('Register error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * POST /api/auth/init-demo
 * Initialize demo users for testing. Only creates if they don't exist.
 */
async function initDemo(req, res) {
  try {
    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        phone: '9999999999',
      },
      {
        name: 'Reception Desk',
        email: 'reception@test.com',
        password: 'password123',
        role: 'receptionist',
        phone: '8888888888',
      },
      {
        name: 'Test Customer',
        email: 'customer@test.com',
        password: 'password123',
        role: 'customer',
        phone: '7777777777',
      },
    ];

    const results = [];

    for (const demo of demoUsers) {
      const exists = await UserModel.emailExists(demo.email);
      if (exists) {
        results.push({ email: demo.email, status: 'already exists' });
        continue;
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(demo.password, salt);

      await UserModel.create({
        id: uuidv4(),
        name: demo.name,
        email: demo.email,
        password: hashedPassword,
        role: demo.role,
        phone: demo.phone,
      });

      results.push({ email: demo.email, status: 'created' });
    }

    return sendSuccess(res, { results }, 'Demo users initialized');
  } catch (error) {
    console.error('Init demo error:', error);
    return sendError(res, 'Failed to initialize demo users');
  }
}

/**
 * POST /api/admin/employees
 * Create a new employee (admin-only).
 */
async function createEmployee(req, res) {
  try {
    const errors = validateFields(req.body, [
      { field: 'name', label: 'Name', type: 'string' },
      { field: 'email', label: 'Email', type: 'email' },
      { field: 'password', label: 'Password', type: 'password' },
      { field: 'role', label: 'Role', type: 'role' },
      { field: 'phone', label: 'Phone', type: 'phone', required: false },
    ]);

    if (errors.length > 0) {
      return sendBadRequest(res, 'Validation failed', errors);
    }

    const { name, email, password, role, phone } = req.body;

    // Only admin and receptionist roles can be created here
    if (!['admin', 'receptionist'].includes(role)) {
      return sendBadRequest(res, 'Only admin or receptionist roles can be assigned to employees');
    }

    // Check if email already exists
    const emailExists = await UserModel.emailExists(email);
    if (emailExists) {
      return sendBadRequest(res, 'Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = uuidv4();
    await UserModel.create({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || null,
    });

    return sendCreated(res, {
      id: userId,
      name,
      email,
      role,
      phone,
    }, 'Employee created successfully');
  } catch (error) {
    console.error('Create employee error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * PUT /api/admin/employees/:id/role
 * Update employee role (admin-only).
 */
async function updateEmployeeRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const errors = validateFields(req.body, [
      { field: 'role', label: 'Role', type: 'role' },
    ]);

    if (errors.length > 0) {
      return sendBadRequest(res, 'Validation failed', errors);
    }

    // Check if user exists
    const user = await UserModel.findById(id);
    if (!user) {
      return sendBadRequest(res, 'User not found');
    }

    // Prevent changing own role
    if (id === req.user.id) {
      return sendBadRequest(res, 'Cannot change your own role');
    }

    await UserModel.updateRole(id, role);

    return sendSuccess(res, { id, role }, 'Employee role updated successfully');
  } catch (error) {
    console.error('Update role error:', error);
    return sendError(res, 'Internal server error');
  }
}

/**
 * GET /api/admin/employees
 * List all employees (admin-only).
 */
async function getEmployees(req, res) {
  try {
    const employees = await UserModel.findAllEmployees();
    return sendSuccess(res, employees, 'Employees retrieved successfully');
  } catch (error) {
    console.error('Get employees error:', error);
    return sendError(res, 'Internal server error');
  }
}

module.exports = {
  login,
  getMe,
  register,
  initDemo,
  createEmployee,
  updateEmployeeRole,
  getEmployees,
};
