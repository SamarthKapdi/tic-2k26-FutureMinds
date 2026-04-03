const { verifyAdminToken } = require('../utils/jwt');
const { query } = require('../config/db');

/**
 * Middleware to verify admin JWT token
 * Uses SEPARATE JWT SECRET from user auth
 */
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Admin access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin access denied. Invalid token format.',
      });
    }

    const decoded = verifyAdminToken(token);

    // Verify admin still exists and is active
    const result = await query('SELECT id, name, email, role, is_active FROM admins WHERE id = $1', [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found. Token is invalid.',
      });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated.',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Admin token has expired. Please login again.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token.',
      });
    }
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during admin authentication.',
    });
  }
};

/**
 * Middleware to check for super_admin role
 */
const verifySuperAdmin = async (req, res, next) => {
  if (req.admin && req.admin.role === 'super_admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Super admin access required.',
  });
};

module.exports = { verifyAdmin, verifySuperAdmin };
