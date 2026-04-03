const { query } = require('../../config/db');

/**
 * Create a report
 */
const createReport = async (userId, data) => {
  const { report_type, target_id, reason, description } = data;

  // Duplicate detection
  const duplicate = await query(
    `SELECT id FROM reports 
     WHERE reporter_id = $1 AND target_id = $2 AND report_type = $3 AND status = 'pending'`,
    [userId, target_id, report_type]
  );

  if (duplicate.rows.length > 0) {
    throw new Error('You have already reported this item. Your report is under review.');
  }

  const result = await query(
    `INSERT INTO reports (reporter_id, report_type, target_id, reason, description)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, report_type, target_id || null, reason, description || null]
  );

  return result.rows[0];
};

/**
 * List reports by a user
 */
const listUserReports = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const result = await query(
    `SELECT * FROM reports WHERE reporter_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

module.exports = { createReport, listUserReports };
