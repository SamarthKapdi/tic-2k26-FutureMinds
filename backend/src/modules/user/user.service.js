const { query } = require('../../config/db')

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
  )

  if (result.rows.length === 0) {
    throw new Error('User not found')
  }

  return result.rows[0]
}

/**
 * Update user profile
 */
const updateProfile = async (userId, data) => {
  const {
    name,
    email,
    phone,
    avatar_url,
    address,
    city,
    state,
    latitude,
    longitude,
  } = data

  const fields = []
  const values = []
  let paramIndex = 1

  if (name !== undefined) {
    fields.push(`name = $${paramIndex++}`)
    values.push(name)
  }
  if (email !== undefined) {
    fields.push(`email = $${paramIndex++}`)
    values.push(email)
  }
  if (phone !== undefined) {
    fields.push(`phone = $${paramIndex++}`)
    values.push(phone)
  }
  if (avatar_url !== undefined) {
    fields.push(`avatar_url = $${paramIndex++}`)
    values.push(avatar_url)
  }
  if (address !== undefined) {
    fields.push(`address = $${paramIndex++}`)
    values.push(address)
  }
  if (city !== undefined) {
    fields.push(`city = $${paramIndex++}`)
    values.push(city)
  }
  if (state !== undefined) {
    fields.push(`state = $${paramIndex++}`)
    values.push(state)
  }
  if (latitude !== undefined && longitude !== undefined) {
    fields.push(
      `location = ST_SetSRID(ST_MakePoint($${paramIndex++}, $${paramIndex++}), 4326)::geography`
    )
    values.push(parseFloat(longitude), parseFloat(latitude))
  }

  if (fields.length === 0) {
    throw new Error('No fields to update')
  }

  fields.push(`updated_at = NOW()`)
  values.push(userId)

  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING 
     id, name, phone, email, avatar_url, address, city, state, trust_score, is_verified,
     ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude`,
    values
  )

  if (result.rows.length === 0) {
    throw new Error('User not found')
  }

  return result.rows[0]
}

/**
 * Get user statistics (donations, contributions, etc.)
 */
const getUserStats = async (userId) => {
  const [donorStats, requestStats, campaignStats, missingStats] =
    await Promise.all([
      query(
        'SELECT COUNT(*) as total_donations FROM blood_responses WHERE donor_id = $1 AND status = $2',
        [userId, 'completed']
      ),
      query(
        'SELECT COUNT(*) as total_requests FROM blood_requests WHERE requester_id = $1',
        [userId]
      ),
      query(
        'SELECT COUNT(*) as total_campaigns, COALESCE(SUM(raised_amount), 0) as total_raised FROM fund_campaigns WHERE creator_id = $1',
        [userId]
      ),
      query(
        'SELECT COUNT(*) as total_reports FROM missing_persons WHERE reporter_id = $1',
        [userId]
      ),
    ])

  return {
    blood_donations: parseInt(donorStats.rows[0].total_donations),
    blood_requests: parseInt(requestStats.rows[0].total_requests),
    campaigns_created: parseInt(campaignStats.rows[0].total_campaigns),
    total_raised: parseFloat(campaignStats.rows[0].total_raised),
    missing_reports: parseInt(missingStats.rows[0].total_reports),
  }
}

/**
 * Get leaderboard (top users by trust score)
 */
const getLeaderboard = async (limit = 20) => {
  const result = await query(
    `
    SELECT u.id, u.name, u.city, u.trust_score, u.is_verified,
      COALESCE(bd.cnt, 0) as donations,
      COALESCE(fc.cnt, 0) as campaigns,
      COALESCE(ms.cnt, 0) as sightings
    FROM users u
    LEFT JOIN (SELECT donor_id, COUNT(*) as cnt FROM blood_responses GROUP BY donor_id) bd ON bd.donor_id = u.id
    LEFT JOIN (SELECT creator_id, COUNT(*) as cnt FROM fund_campaigns GROUP BY creator_id) fc ON fc.creator_id = u.id
    LEFT JOIN (SELECT reporter_id, COUNT(*) as cnt FROM missing_sightings GROUP BY reporter_id) ms ON ms.reporter_id = u.id
    WHERE u.is_active = true AND u.name IS NOT NULL
    ORDER BY u.trust_score DESC, (COALESCE(bd.cnt,0) + COALESCE(fc.cnt,0) + COALESCE(ms.cnt,0)) DESC
    LIMIT $1
  `,
    [limit]
  )

  return result.rows
}

/**
 * Get user alert settings
 */
const getSettings = async (userId) => {
  // Check if user_settings table exists and has a row
  try {
    const result = await query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    )
    if (result.rows.length > 0) return result.rows[0]
  } catch {
    /* table might not exist yet */
  }

  // Return defaults
  return {
    user_id: userId,
    alert_radius_km: 25,
    blood_alerts: true,
    missing_alerts: true,
    fund_alerts: true,
  }
}

/**
 * Update user alert settings
 */
const updateSettings = async (userId, data) => {
  const { alert_radius_km, blood_alerts, missing_alerts, fund_alerts } = data

  try {
    const result = await query(
      `
      INSERT INTO user_settings (user_id, alert_radius_km, blood_alerts, missing_alerts, fund_alerts)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        alert_radius_km = $2,
        blood_alerts = $3,
        missing_alerts = $4,
        fund_alerts = $5,
        updated_at = NOW()
      RETURNING *
    `,
      [
        userId,
        alert_radius_km || 25,
        blood_alerts !== false,
        missing_alerts !== false,
        fund_alerts !== false,
      ]
    )

    return result.rows[0]
  } catch {
    return {
      user_id: userId,
      alert_radius_km,
      blood_alerts,
      missing_alerts,
      fund_alerts,
    }
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getUserStats,
  getLeaderboard,
  getSettings,
  updateSettings,
}
