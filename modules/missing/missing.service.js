const { query } = require('../../config/db');

/**
 * Report a missing person
 */
const reportMissing = async (userId, data) => {
  const {
    name, age, gender, description, image_url,
    latitude, longitude, last_seen_address,
    last_seen_date, city, contact_number,
    urgency, unique_identifiers,
  } = data;

  // Duplicate detection: same name + city within last 24 hours
  const duplicate = await query(
    `SELECT id FROM missing_persons 
     WHERE reporter_id = $1 AND name ILIKE $2 AND status = 'missing' 
     AND created_at > NOW() - INTERVAL '24 hours'`,
    [userId, `%${name}%`]
  );

  if (duplicate.rows.length > 0) {
    throw new Error('A similar missing person report already exists. Please check existing reports.');
  }

  const result = await query(
    `INSERT INTO missing_persons (reporter_id, name, age, gender, description, image_url,
     last_seen_location, last_seen_address, last_seen_date, city, contact_number, urgency, unique_identifiers)
     VALUES ($1, $2, $3, $4, $5, $6, 
     ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography,
     $9, $10, $11, $12, $13, $14) RETURNING *`,
    [userId, name, age || null, gender || null, description, image_url || null,
     parseFloat(longitude), parseFloat(latitude),
     last_seen_address, last_seen_date || new Date(), city, contact_number,
     urgency || 'normal', unique_identifiers || null]
  );

  return result.rows[0];
};

/**
 * List missing persons with filters
 */
const listMissing = async (page = 1, limit = 20, city = null, status = 'missing') => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE mp.status = $3';
  const params = [limit, offset, status];

  if (city) {
    whereClause += ` AND mp.city ILIKE $4`;
    params.push(`%${city}%`);
  }

  const result = await query(
    `SELECT mp.*, u.name as reporter_name, u.trust_score,
     ST_Y(mp.last_seen_location::geometry) as latitude, 
     ST_X(mp.last_seen_location::geometry) as longitude,
     (SELECT COUNT(*) FROM missing_sightings WHERE missing_person_id = mp.id) as sighting_count
     FROM missing_persons mp
     JOIN users u ON mp.reporter_id = u.id
     ${whereClause}
     ORDER BY 
       CASE mp.urgency 
         WHEN 'critical' THEN 1 
         WHEN 'urgent' THEN 2 
         ELSE 3 
       END,
       mp.created_at DESC
     LIMIT $1 OFFSET $2`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM missing_persons mp ${whereClause.replace(/\$\d/g, (m) => {
      const n = parseInt(m.substring(1));
      return `$${n - 2}`;
    })}`,
    params.slice(2)
  );

  return {
    missing_persons: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  };
};

/**
 * Report a sighting of a missing person
 */
const reportSighting = async (userId, data) => {
  const { missing_person_id, latitude, longitude, address, description, image_url, sighting_date } = data;

  // Verify missing person exists
  const mp = await query("SELECT * FROM missing_persons WHERE id = $1 AND status = 'missing'", [missing_person_id]);
  if (mp.rows.length === 0) {
    throw new Error('Missing person report not found or already resolved');
  }

  const result = await query(
    `INSERT INTO missing_sightings (missing_person_id, reporter_id, location, address, description, image_url, sighting_date)
     VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5, $6, $7, $8) RETURNING *`,
    [missing_person_id, userId, parseFloat(longitude), parseFloat(latitude),
     address, description, image_url || null, sighting_date || new Date()]
  );

  // Boost reporter trust score
  await query('UPDATE users SET trust_score = LEAST(trust_score + 3, 100) WHERE id = $1', [userId]);

  return result.rows[0];
};

/**
 * Get details of a missing person with sightings
 */
const getMissingDetail = async (missingId) => {
  const mpResult = await query(
    `SELECT mp.*, u.name as reporter_name, u.phone as reporter_phone, u.trust_score,
     ST_Y(mp.last_seen_location::geometry) as latitude, ST_X(mp.last_seen_location::geometry) as longitude
     FROM missing_persons mp
     JOIN users u ON mp.reporter_id = u.id
     WHERE mp.id = $1`,
    [missingId]
  );

  if (mpResult.rows.length === 0) {
    throw new Error('Missing person not found');
  }

  const sightings = await query(
    `SELECT ms.*, u.name as reporter_name,
     ST_Y(ms.location::geometry) as latitude, ST_X(ms.location::geometry) as longitude
     FROM missing_sightings ms
     JOIN users u ON ms.reporter_id = u.id
     WHERE ms.missing_person_id = $1
     ORDER BY ms.sighting_date DESC`,
    [missingId]
  );

  return {
    ...mpResult.rows[0],
    sightings: sightings.rows,
  };
};

module.exports = { reportMissing, listMissing, reportSighting, getMissingDetail };
