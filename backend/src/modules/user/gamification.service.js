const { query } = require('../../config/db');

/**
 * Get leaderboard - top users by trust score
 */
const getLeaderboard = async (limit = 20) => {
  const result = await query(
    `SELECT u.id, u.name, u.avatar_url, u.trust_score, u.is_verified, u.city,
     (SELECT COUNT(*) FROM blood_responses WHERE donor_id = u.id) as donations,
     (SELECT COUNT(*) FROM fund_campaigns WHERE creator_id = u.id) as campaigns,
     (SELECT COUNT(*) FROM missing_sightings WHERE reporter_id = u.id) as sightings
     FROM users u
     WHERE u.is_active = true AND u.name IS NOT NULL
     ORDER BY u.trust_score DESC, u.created_at ASC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

/**
 * Get user settings (alert_radius_km etc.)
 */
const getUserSettings = async (userId) => {
  let result = await query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) {
    // Create default settings
    result = await query(
      `INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *`,
      [userId]
    );
  }
  return result.rows[0];
};

/**
 * Update user settings
 */
const updateUserSettings = async (userId, data) => {
  const { alert_radius_km, blood_alerts, missing_alerts, fund_alerts } = data;
  const fields = [];
  const values = [];
  let idx = 1;

  if (alert_radius_km !== undefined) {
    fields.push(`alert_radius_km = $${idx++}`);
    values.push(parseInt(alert_radius_km));
  }
  if (blood_alerts !== undefined) {
    fields.push(`blood_alerts = $${idx++}`);
    values.push(blood_alerts);
  }
  if (missing_alerts !== undefined) {
    fields.push(`missing_alerts = $${idx++}`);
    values.push(missing_alerts);
  }
  if (fund_alerts !== undefined) {
    fields.push(`fund_alerts = $${idx++}`);
    values.push(fund_alerts);
  }

  if (fields.length === 0) throw new Error('No fields to update');

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  // Upsert: create if not exists, then update
  await query(
    `INSERT INTO user_settings (user_id) VALUES ($${idx}) ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );

  const result = await query(
    `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
    values
  );

  return result.rows[0];
};

module.exports = { getLeaderboard, getUserSettings, updateUserSettings };
