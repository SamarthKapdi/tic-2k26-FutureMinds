const adminService = require('./admin.service');

/**
 * POST /api/admin/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const result = await adminService.adminLogin(email, password);

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: result,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(401).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

/**
 * GET /api/admin/dashboard
 */
const getDashboard = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard stats',
    });
  }
};

/**
 * GET /api/admin/verifications
 */
const getVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const result = await adminService.getVerificationRequests(
      parseInt(page), parseInt(limit), status
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get verifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load verifications',
    });
  }
};

/**
 * POST /api/admin/verification/approve
 */
const approveVerification = async (req, res) => {
  try {
    const { verificationId, notes } = req.body;

    if (!verificationId) {
      return res.status(400).json({
        success: false,
        message: 'Verification ID is required',
      });
    }

    const result = await adminService.approveVerification(
      verificationId, req.admin.id, notes
    );

    return res.status(200).json({
      success: true,
      message: 'Verification approved',
      data: result,
    });
  } catch (error) {
    console.error('Approve verification error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve verification',
    });
  }
};

/**
 * POST /api/admin/verification/reject
 */
const rejectVerification = async (req, res) => {
  try {
    const { verificationId, notes } = req.body;

    if (!verificationId || !notes) {
      return res.status(400).json({
        success: false,
        message: 'Verification ID and rejection reason are required',
      });
    }

    const result = await adminService.rejectVerification(
      verificationId, req.admin.id, notes
    );

    return res.status(200).json({
      success: true,
      message: 'Verification rejected',
      data: result,
    });
  } catch (error) {
    console.error('Reject verification error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject verification',
    });
  }
};

/**
 * GET /api/admin/reports
 */
const getReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const result = await adminService.getReports(parseInt(page), parseInt(limit), status);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load reports',
    });
  }
};

/**
 * POST /api/admin/action
 */
const takeAction = async (req, res) => {
  try {
    const { reportId, action, notes } = req.body;

    if (!reportId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Report ID and action are required',
      });
    }

    const result = await adminService.takeAction(reportId, req.admin.id, action, notes);

    return res.status(200).json({
      success: true,
      message: 'Action taken successfully',
      data: result,
    });
  } catch (error) {
    console.error('Take action error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to take action',
    });
  }
};

module.exports = { login, getDashboard, getVerifications, approveVerification, rejectVerification, getReports, takeAction };
