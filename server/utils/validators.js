/**
 * Input validation helpers for request bodies.
 */

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  // Minimum 6 characters
  return typeof password === 'string' && password.length >= 6;
}

function isValidPhone(phone) {
  // Allows +91XXXXXXXXXX, 10 digits, or formatted variants
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value) {
  return typeof value === 'number' && value > 0;
}

function isValidRole(role) {
  const validRoles = ['admin', 'receptionist', 'customer'];
  return validRoles.includes(role);
}

function isValidDate(dateStr) {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validates required fields and returns an array of error messages.
 * @param {object} body - The request body
 * @param {Array<{field: string, label: string, type: string}>} rules - Validation rules
 * @returns {string[]} Array of error messages (empty if valid)
 */
function validateFields(body, rules) {
  const errors = [];

  for (const rule of rules) {
    const value = body[rule.field];

    // Check required
    if (rule.required !== false && (value === undefined || value === null || value === '')) {
      errors.push(`${rule.label || rule.field} is required`);
      continue;
    }

    // Skip further checks if optional and empty
    if ((value === undefined || value === null || value === '') && rule.required === false) {
      continue;
    }

    // Type-specific validation
    switch (rule.type) {
      case 'email':
        if (!isValidEmail(value)) {
          errors.push(`${rule.label || rule.field} must be a valid email address`);
        }
        break;

      case 'password':
        if (!isValidPassword(value)) {
          errors.push(`${rule.label || rule.field} must be at least 6 characters`);
        }
        break;

      case 'phone':
        if (!isValidPhone(value)) {
          errors.push(`${rule.label || rule.field} must be a valid phone number`);
        }
        break;

      case 'role':
        if (!isValidRole(value)) {
          errors.push(`${rule.label || rule.field} must be one of: admin, receptionist, customer`);
        }
        break;

      case 'string':
        if (!isNonEmptyString(value)) {
          errors.push(`${rule.label || rule.field} must be a non-empty string`);
        }
        break;

      case 'number':
        if (!isPositiveNumber(Number(value))) {
          errors.push(`${rule.label || rule.field} must be a positive number`);
        }
        break;

      case 'date':
        if (!isValidDate(value)) {
          errors.push(`${rule.label || rule.field} must be a valid date`);
        }
        break;
    }
  }

  return errors;
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isNonEmptyString,
  isPositiveNumber,
  isValidRole,
  isValidDate,
  validateFields,
};
