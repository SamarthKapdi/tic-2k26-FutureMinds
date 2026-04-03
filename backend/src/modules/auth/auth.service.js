const { query } = require('../../config/db');
const { generateUserToken } = require('../../utils/jwt');
const { verifyFirebaseIdToken } = require('../../config/firebase-admin');

const buildFallbackPhoneFromUid = (uid) => {
  const sanitizedUid = (uid || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  return `firebase_${sanitizedUid}`;
};

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const findExistingUser = async ({ phone, email }) => {
  if (phone) {
    const userByPhone = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (userByPhone.rows.length > 0) {
      return userByPhone.rows[0];
    }
  }

  if (email) {
    const userByEmail = await query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizeEmail(email)]);
    if (userByEmail.rows.length > 0) {
      return userByEmail.rows[0];
    }
  }

  return null;
};

/**
 * Login/Register using Firebase ID token
 */
const loginWithFirebase = async (idToken) => {
  const decoded = await verifyFirebaseIdToken(idToken);

  const phone = decoded.phone_number || null;
  const email = normalizeEmail(decoded.email);
  const name = decoded.name || null;
  const provider = decoded.firebase?.sign_in_provider || 'unknown';

  if (!phone && !email) {
    throw new Error('Firebase token must include phone number or email');
  }

  let user = await findExistingUser({ phone, email });
  const generatedPhone = phone || buildFallbackPhoneFromUid(decoded.uid);
  let isNewUser = false;

  if (!user) {
    const insertResult = await query(
      `INSERT INTO users (phone, email, name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [generatedPhone, email || null, name]
    );
    user = insertResult.rows[0];
    isNewUser = true;
  } else {
    const needsName = !user.name && name;
    const needsEmail = !user.email && email;
    const needsPhone = user.phone.startsWith('firebase_') && phone;

    if (needsName || needsEmail || needsPhone) {
      const updateResult = await query(
        `UPDATE users
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = CASE WHEN phone LIKE 'firebase_%' AND $3 IS NOT NULL THEN $3 ELSE phone END,
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [name, email || null, phone || null, user.id]
      );
      user = updateResult.rows[0];
    }
  }

  const token = generateUserToken({
    id: user.id,
    phone: user.phone,
    role: 'user',
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      trust_score: user.trust_score,
      is_verified: user.is_verified,
    },
    isNewUser: isNewUser || !user.name,
    provider,
  };
};

/**
 * Register user with profile details (after OTP verification)
 */
const registerUser = async (userId, data) => {
  const { name, email, city, state, address, latitude, longitude } = data;

  let locationQuery = '';
  let params = [name, email, city, state, address, userId];

  if (latitude && longitude) {
    locationQuery = ', location = ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography';
    params.push(parseFloat(longitude), parseFloat(latitude));
  }

  const result = await query(
    `UPDATE users SET name = $1, email = $2, city = $3, state = $4, address = $5${locationQuery}, updated_at = NOW() WHERE id = $6 RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return result.rows[0];
};

module.exports = { loginWithFirebase, registerUser };
