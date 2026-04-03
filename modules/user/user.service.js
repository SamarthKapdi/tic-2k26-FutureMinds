const { query } = require('../../config/db');

/**
 * Get user profile by ID
 */
const getProfile = async (userId) => {
  const result = await query(
    `SELECT id, name, phone, email, avatar_url, address, city, state, trust_score, is_verified, is_active,
     ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude,
     created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return result.rows[0];
};

/**
 * Update user profile
 */
const updateProfile = async (userId, data) => {
  const { name, email, avatar_url, address, city, state, latitude, longitude } = data;

  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(email);
  }
  if (avatar_url !== undefined) {
    fields.push(`avatar_url = $${paramIndex++}`);
    values.push(avatar_url);
  }
  if (address !== undefined) {
    fields.push(`address = $${paramIndex++}`);
    values.push(address);
  }
  if (city !== undefined) {
    fields.push(`city = $${paramIndex++}`);
    values.push(city);
  }
  if (state !== undefined) {
    fields.push(`state = $${paramIndex++}`);
    values.push(state);
  }
  if (latitude !== undefined && longitude !== undefined) {
    fields.push(`location = ST_SetSRID(ST_MakePoint($${paramIndex++}, $${paramIndex++}), 4326)::geography`);
    values.push(parseFloat(longitude), parseFloat(latitude));
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING 
     id, name, phone, email, avatar_url, address, city, state, trust_score, is_verified,
     ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return result.rows[0];
};

/**
 * Get user statistics (donations, contributions, etc.)
 */
const getUserStats = async (userId) => {
  const [donorStats, requestStats, campaignStats, missingStats] = await Promise.all([
    query('SELECT COUNT(*) as total_donations FROM blood_responses WHERE donor_id = $1 AND status = $2', [userId, 'completed']),
    query('SELECT COUNT(*) as total_requests FROM blood_requests WHERE requester_id = $1', [userId]),
    query('SELECT COUNT(*) as total_campaigns, COALESCE(SUM(raised_amount), 0) as total_raised FROM fund_campaigns WHERE creator_id = $1', [userId]),
    query('SELECT COUNT(*) as total_reports FROM missing_persons WHERE reporter_id = $1', [userId]),
  ]);

  return {
    blood_donations: parseInt(donorStats.rows[0].total_donations),
    blood_requests: parseInt(requestStats.rows[0].total_requests),
    campaigns_created: parseInt(campaignStats.rows[0].total_campaigns),
    total_raised: parseFloat(campaignStats.rows[0].total_raised),
    missing_reports: parseInt(missingStats.rows[0].total_reports),
  };
};

module.exports = { getProfile, updateProfile, getUserStats };
