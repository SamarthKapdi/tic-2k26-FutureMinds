const { query } = require('../../config/db');
const { comparePassword } = require('../../utils/hash');
const { generateAdminToken } = require('../../utils/jwt');

/**
 * Admin login with email and password
 */
const adminLogin = async (email, password) => {
  const result = await query('SELECT * FROM admins WHERE email = $1 AND is_active = true', [email]);

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const admin = result.rows[0];
  const isPasswordValid = await comparePassword(password, admin.password_hash);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = generateAdminToken({
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};

/**
 * Get all verification requests with pagination
 */
const getVerificationRequests = async (page = 1, limit = 20, status = null) => {
  const offset = (page - 1) * limit;
  let whereClause = '';
  const params = [limit, offset];

  if (status) {
    whereClause = 'WHERE vr.status = $3';
    params.push(status);
  }

  const result = await query(
    `SELECT vr.*, u.name as user_name, u.phone as user_phone, u.email as user_email,
     a.name as reviewer_name
     FROM verification_requests vr
     JOIN users u ON vr.user_id = u.id
     LEFT JOIN admins a ON vr.reviewed_by = a.id
     ${whereClause}
     ORDER BY vr.created_at DESC
     LIMIT $1 OFFSET $2`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM verification_requests vr ${status ? 'WHERE vr.status = $1' : ''}`,
    status ? [status] : []
  );

  return {
    verifications: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  };
};

/**
 * Approve verification request
 */
const approveVerification = async (verificationId, adminId, notes = '') => {
  const result = await query(
    `UPDATE verification_requests 
     SET status = 'approved', reviewed_by = $1, admin_notes = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [adminId, notes, verificationId]
  );

  if (result.rows.length === 0) {
    throw new Error('Verification request not found');
  }

  // Update user's verified status
  await query('UPDATE users SET is_verified = true, trust_score = LEAST(trust_score + 20, 100) WHERE id = $1', [result.rows[0].user_id]);

  return result.rows[0];
};

/**
 * Reject verification request
 */
const rejectVerification = async (verificationId, adminId, notes = '') => {
  if (!notes) {
    throw new Error('Rejection reason is required');
  }

  const result = await query(
    `UPDATE verification_requests 
     SET status = 'rejected', reviewed_by = $1, admin_notes = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [adminId, notes, verificationId]
  );

  if (result.rows.length === 0) {
    throw new Error('Verification request not found');
  }

  return result.rows[0];
};

/**
 * Get all reports with pagination
 */
const getReports = async (page = 1, limit = 20, status = null) => {
  const offset = (page - 1) * limit;
  let whereClause = '';
  const params = [limit, offset];

  if (status) {
    whereClause = 'WHERE r.status = $3';
    params.push(status);
  }

  const result = await query(
    `SELECT r.*, u.name as reporter_name, u.phone as reporter_phone,
     a.name as resolver_name
     FROM reports r
     JOIN users u ON r.reporter_id = u.id
     LEFT JOIN admins a ON r.resolved_by = a.id
     ${whereClause}
     ORDER BY r.created_at DESC
     LIMIT $1 OFFSET $2`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM reports r ${status ? 'WHERE r.status = $1' : ''}`,
    status ? [status] : []
  );

  return {
    reports: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  };
};

/**
 * Take admin action on a report
 */
const takeAction = async (reportId, adminId, action, notes) => {
  const validActions = ['reviewed', 'resolved', 'dismissed'];
  if (!validActions.includes(action)) {
    throw new Error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
  }

  const result = await query(
    `UPDATE reports 
     SET status = $1, resolved_by = $2, admin_notes = $3, updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [action, adminId, notes, reportId]
  );

  if (result.rows.length === 0) {
    throw new Error('Report not found');
  }

  // If action involves a user report, adjust trust score
  if (result.rows[0].report_type === 'user' && action === 'resolved') {
    await query(
      'UPDATE users SET trust_score = GREATEST(trust_score - 10, 0) WHERE id = $1',
      [result.rows[0].target_id]
    );
  }

  return result.rows[0];
};

/**
 * Get dashboard stats for admin
 */
const getDashboardStats = async () => {
  const [userCount, pendingVerifications, pendingReports, activeRequests, activeCampaigns, missingCases] = await Promise.all([
    query('SELECT COUNT(*) FROM users WHERE is_active = true'),
    query("SELECT COUNT(*) FROM verification_requests WHERE status = 'pending'"),
    query("SELECT COUNT(*) FROM reports WHERE status = 'pending'"),
    query("SELECT COUNT(*) FROM blood_requests WHERE status = 'active'"),
    query("SELECT COUNT(*) FROM fund_campaigns WHERE status = 'active'"),
    query("SELECT COUNT(*) FROM missing_persons WHERE status = 'missing'"),
  ]);

  return {
    total_users: parseInt(userCount.rows[0].count),
    pending_verifications: parseInt(pendingVerifications.rows[0].count),
    pending_reports: parseInt(pendingReports.rows[0].count),
    active_blood_requests: parseInt(activeRequests.rows[0].count),
    active_campaigns: parseInt(activeCampaigns.rows[0].count),
    active_missing_cases: parseInt(missingCases.rows[0].count),
  };
};

module.exports = {
  adminLogin,
  getVerificationRequests,
  approveVerification,
  rejectVerification,
  getReports,
  takeAction,
  getDashboardStats,
};
