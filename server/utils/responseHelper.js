/**
 * Standardized API response helpers.
 * All API responses follow: { success, message, data }
 */

function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, message = 'Internal server error', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
}

function sendCreated(res, data = null, message = 'Created successfully') {
  return sendSuccess(res, data, message, 201);
}

function sendNotFound(res, message = 'Resource not found') {
  return sendError(res, message, 404);
}

function sendUnauthorized(res, message = 'Unauthorized') {
  return sendError(res, message, 401);
}

function sendForbidden(res, message = 'Forbidden') {
  return sendError(res, message, 403);
}

function sendBadRequest(res, message = 'Bad request', errors = null) {
  return sendError(res, message, 400, errors);
}

module.exports = {
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendBadRequest,
};
