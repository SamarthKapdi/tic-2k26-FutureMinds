const { query, getClient } = require('../../config/db');

/**
 * Register as a blood donor
 */
const registerDonor = async (userId, data) => {
  const { blood_group, latitude, longitude, address, city, last_donation_date } = data;

  // Check if already registered
  const existing = await query('SELECT id FROM blood_donors WHERE user_id = $1', [userId]);
  if (existing.rows.length > 0) {
    // Update existing registration
    const result = await query(
      `UPDATE blood_donors SET blood_group = $1, location = ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
       address = $4, city = $5, last_donation_date = $6, is_available = true, updated_at = NOW()
       WHERE user_id = $7 RETURNING *`,
      [blood_group, parseFloat(longitude), parseFloat(latitude), address, city, last_donation_date || null, userId]
    );
    return result.rows[0];
  }

  const result = await query(
    `INSERT INTO blood_donors (user_id, blood_group, location, address, city, last_donation_date)
     VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5, $6, $7)
     RETURNING *`,
    [userId, blood_group, parseFloat(longitude), parseFloat(latitude), address, city, last_donation_date || null]
  );

  // Boost trust score for registering as donor
  await query('UPDATE users SET trust_score = LEAST(trust_score + 5, 100) WHERE id = $1', [userId]);

  return result.rows[0];
};

/**
 * Create a blood request
 */
const createRequest = async (userId, data) => {
  const {
    patient_name, blood_group, units_needed, urgency,
    hospital_name, hospital_address, latitude, longitude,
    city, contact_number, description,
  } = data;

  // Duplicate detection: check for same user + blood group + active within last hour
  const duplicate = await query(
    `SELECT id FROM blood_requests 
     WHERE requester_id = $1 AND blood_group = $2 AND status = 'active' 
     AND created_at > NOW() - INTERVAL '1 hour'`,
    [userId, blood_group]
  );

  if (duplicate.rows.length > 0) {
    throw new Error('You already have an active blood request for this blood group. Please wait or cancel the existing one.');
  }

  const result = await query(
    `INSERT INTO blood_requests (requester_id, patient_name, blood_group, units_needed, urgency,
     hospital_name, hospital_address, location, city, contact_number, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($8, $9), 4326)::geography, $10, $11, $12)
     RETURNING *`,
    [userId, patient_name, blood_group, units_needed || 1, urgency || 'normal',
     hospital_name, hospital_address, parseFloat(longitude), parseFloat(latitude),
     city, contact_number, description]
  );

  return result.rows[0];
};

/**
 * Find nearby blood donors using PostGIS ST_DWithin
 * @param {number} latitude - Search center latitude
 * @param {number} longitude - Search center longitude  
 * @param {string} blood_group - Required blood group
 * @param {number} radiusKm - Search radius in kilometers (default 25)
 */
const findNearbyDonors = async (latitude, longitude, blood_group, radiusKm = 25) => {
  const radiusMeters = radiusKm * 1000;

  // Compatible blood groups mapping
  const compatibleGroups = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'],
  };

  const compatible = compatibleGroups[blood_group] || [blood_group];

  const result = await query(
    `SELECT bd.*, u.name as donor_name, u.phone as donor_phone, u.trust_score, u.is_verified,
     ROUND(ST_Distance(bd.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)::numeric / 1000, 2) as distance_km
     FROM blood_donors bd
     JOIN users u ON bd.user_id = u.id
     WHERE bd.is_available = true
     AND bd.blood_group = ANY($3)
     AND u.is_active = true
     AND ST_DWithin(bd.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $4)
     AND (bd.last_donation_date IS NULL OR bd.last_donation_date < NOW() - INTERVAL '90 days')
     ORDER BY distance_km ASC
     LIMIT 50`,
    [parseFloat(longitude), parseFloat(latitude), compatible, radiusMeters]
  );

  return result.rows;
};

/**
 * Respond to a blood request
 */
const respondToRequest = async (userId, requestId, message) => {
  // Check if request exists and is active
  const request = await query('SELECT * FROM blood_requests WHERE id = $1 AND status = $2', [requestId, 'active']);
  if (request.rows.length === 0) {
    throw new Error('Blood request not found or no longer active');
  }

  // Check for duplicate response
  const existing = await query(
    'SELECT id FROM blood_responses WHERE request_id = $1 AND donor_id = $2',
    [requestId, userId]
  );
  if (existing.rows.length > 0) {
    throw new Error('You have already responded to this request');
  }

  // Check if user is a registered donor
  const donor = await query('SELECT * FROM blood_donors WHERE user_id = $1', [userId]);
  if (donor.rows.length === 0) {
    throw new Error('You must register as a blood donor first');
  }

  const result = await query(
    `INSERT INTO blood_responses (request_id, donor_id, message)
     VALUES ($1, $2, $3) RETURNING *`,
    [requestId, userId, message]
  );

  return result.rows[0];
};

/**
 * Get blood donation history for a user
 */
const getHistory = async (userId) => {
  const [requests, responses, donorProfile] = await Promise.all([
    query(
      `SELECT br.*, 
       (SELECT COUNT(*) FROM blood_responses WHERE request_id = br.id) as response_count
       FROM blood_requests br WHERE br.requester_id = $1 ORDER BY br.created_at DESC`,
      [userId]
    ),
    query(
      `SELECT bres.*, br.patient_name, br.blood_group, br.hospital_name, br.urgency
       FROM blood_responses bres
       JOIN blood_requests br ON bres.request_id = br.id
       WHERE bres.donor_id = $1 ORDER BY bres.created_at DESC`,
      [userId]
    ),
    query('SELECT * FROM blood_donors WHERE user_id = $1', [userId]),
  ]);

  return {
    requests: requests.rows,
    responses: responses.rows,
    donor_profile: donorProfile.rows[0] || null,
  };
};

/**
 * Get all active blood requests with optional filters
 */
const getActiveRequests = async (page = 1, limit = 20, city = null) => {
  const offset = (page - 1) * limit;
  let whereClause = "WHERE br.status = 'active'";
  const params = [limit, offset];

  if (city) {
    whereClause += ` AND br.city ILIKE $3`;
    params.push(`%${city}%`);
  }

  const result = await query(
    `SELECT br.*, u.name as requester_name, u.trust_score,
     ST_Y(br.location::geometry) as latitude, ST_X(br.location::geometry) as longitude,
     (SELECT COUNT(*) FROM blood_responses WHERE request_id = br.id) as response_count
     FROM blood_requests br
     JOIN users u ON br.requester_id = u.id
     ${whereClause}
     ORDER BY 
       CASE br.urgency 
         WHEN 'critical' THEN 1 
         WHEN 'urgent' THEN 2 
         ELSE 3 
       END,
       br.created_at DESC
     LIMIT $1 OFFSET $2`,
    params
  );

  return result.rows;
};

module.exports = {
  registerDonor,
  createRequest,
  findNearbyDonors,
  respondToRequest,
  getHistory,
  getActiveRequests,
};
