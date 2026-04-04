const { query } = require('../../config/db')
const { generateUserToken } = require('../../utils/jwt')
const { verifyFirebaseIdToken } = require('../../config/firebase-admin')
const bcrypt = require('bcryptjs')

const normalizeEmail = (email) => (email || '').trim().toLowerCase()
const createAuthError = (message, statusCode, code) => {
  const err = new Error(message)
  err.statusCode = statusCode
  err.code = code
  return err
}

// ─────────────────────────────────────────────
// Email/Password Registration (custom, no Firebase)
// ─────────────────────────────────────────────
const registerWithEmail = async (data) => {
  const {
    name,
    email,
    password,
    phone,
    city,
    state,
    address,
    latitude,
    longitude,
  } = data

  if (!email || !password || !name) {
    throw new Error('Name, email, and password are required')
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }

  const normalizedEmail = normalizeEmail(email)

  // Check if email already exists
  const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1', [
    normalizedEmail,
  ])
  if (existing.rows.length > 0) {
    throw new Error(
      'An account with this email already exists. Try logging in.'
    )
  }

  // Check if phone already exists (if provided)
  if (phone) {
    const phoneExists = await query('SELECT id FROM users WHERE phone = $1', [
      phone,
    ])
    if (phoneExists.rows.length > 0) {
      throw new Error('An account with this phone number already exists.')
    }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  let insertSQL, params

  if (latitude && longitude) {
    insertSQL = `INSERT INTO users (name, email, password_hash, phone, city, state, address, location)
     VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($8, $9), 4326)::geography)
     RETURNING *`
    params = [
      name,
      normalizedEmail,
      passwordHash,
      phone || null,
      city || null,
      state || null,
      address || null,
      parseFloat(longitude),
      parseFloat(latitude),
    ]
  } else {
    insertSQL = `INSERT INTO users (name, email, password_hash, phone, city, state, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`
    params = [
      name,
      normalizedEmail,
      passwordHash,
      phone || null,
      city || null,
      state || null,
      address || null,
    ]
  }

  const insertResult = await query(insertSQL, params)
  const user = insertResult.rows[0]

  const token = generateUserToken({
    id: user.id,
    email: user.email,
    role: 'user',
  })

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      city: user.city,
      state: user.state,
      trust_score: user.trust_score,
      is_verified: user.is_verified,
    },
  }
}

// ─────────────────────────────────────────────
// Email/Password Login (custom, no Firebase)
// ─────────────────────────────────────────────
const loginWithEmail = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const normalizedEmail = normalizeEmail(email)

  const result = await query('SELECT * FROM users WHERE LOWER(email) = $1', [
    normalizedEmail,
  ])
  if (result.rows.length === 0) {
    throw createAuthError(
      'No account found with this email. Please register first.',
      404,
      'USER_NOT_FOUND'
    )
  }

  const user = result.rows[0]

  if (!user.password_hash) {
    throw createAuthError(
      'This account was created via Google. Please use Google Sign-In.',
      400,
      'GOOGLE_ONLY_ACCOUNT'
    )
  }

  if (!user.is_active) {
    throw createAuthError(
      'Your account has been deactivated. Contact support.',
      403,
      'ACCOUNT_DEACTIVATED'
    )
  }

  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    throw createAuthError(
      'Incorrect password. Please try again.',
      401,
      'INVALID_PASSWORD'
    )
  }

  const token = generateUserToken({
    id: user.id,
    email: user.email,
    role: 'user',
  })

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      city: user.city,
      state: user.state,
      trust_score: user.trust_score,
      is_verified: user.is_verified,
    },
  }
}

// ─────────────────────────────────────────────
// Google Sign-In (via Firebase ID token)
// ─────────────────────────────────────────────
const loginWithGoogle = async (idToken) => {
  const decoded = await verifyFirebaseIdToken(idToken)

  const email = normalizeEmail(decoded.email)
  const name = decoded.name || null
  const provider = decoded.firebase?.sign_in_provider || 'unknown'

  if (!email) {
    throw new Error('Google account must include an email address')
  }

  let user = null
  let isNewUser = false

  const byEmail = await query('SELECT * FROM users WHERE LOWER(email) = $1', [
    email,
  ])
  if (byEmail.rows.length > 0) {
    user = byEmail.rows[0]
  }

  if (!user) {
    const insertResult = await query(
      `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *`,
      [name, email]
    )
    user = insertResult.rows[0]
    isNewUser = true
  } else if (!user.name && name) {
    const updateResult = await query(
      `UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [name, user.id]
    )
    user = updateResult.rows[0]
  }

  const token = generateUserToken({
    id: user.id,
    email: user.email,
    role: 'user',
  })

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      city: user.city,
      state: user.state,
      trust_score: user.trust_score,
      is_verified: user.is_verified,
    },
    isNewUser: isNewUser || !user.name,
    provider,
  }
}

module.exports = { registerWithEmail, loginWithEmail, loginWithGoogle }
