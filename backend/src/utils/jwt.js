const jwt = require('jsonwebtoken');

const USER_JWT_SECRET = process.env.USER_JWT_SECRET || 'user_default_secret';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_default_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for a regular user
 */
const generateUserToken = (payload) => {
  return jwt.sign(payload, USER_JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify a user JWT token
 */
const verifyUserToken = (token) => {
  return jwt.verify(token, USER_JWT_SECRET);
};

/**
 * Generate a JWT token for an admin
 */
const generateAdminToken = (payload) => {
  return jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify an admin JWT token
 */
const verifyAdminToken = (token) => {
  return jwt.verify(token, ADMIN_JWT_SECRET);
};

module.exports = {
  generateUserToken,
  verifyUserToken,
  generateAdminToken,
  verifyAdminToken,
};
