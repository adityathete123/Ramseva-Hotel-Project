const jwt = require('jsonwebtoken');
const { sendUnauthorized, sendForbidden } = require('../utils/responseHelper');

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches decoded user to req.user.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendUnauthorized(res, 'Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token has expired. Please login again.');
    }
    return sendUnauthorized(res, 'Invalid token.');
  }
}

/**
 * Middleware factory: Restrict access to specific roles.
 * Must be used AFTER verifyToken middleware.
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'receptionist')
 */
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return sendForbidden(res, `Access denied. Required role(s): ${roles.join(', ')}`);
    }

    next();
  };
}

module.exports = {
  verifyToken,
  authorizeRoles,
};
