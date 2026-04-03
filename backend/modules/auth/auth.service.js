const { query } = require('../../config/db');
const { generateOTP } = require('../../utils/hash');
const { generateUserToken } = require('../../utils/jwt');

/**
 * Send WhatsApp OTP via Twilio
 */
const sendWhatsAppOTP = async (phone) => {
  // Generate 6-digit OTP
  const otp = generateOTP(6);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Invalidate any existing OTPs for this phone
  await query('UPDATE otps SET is_used = true WHERE phone = $1 AND is_used = false', [phone]);

  // Store OTP in database
  await query(
    'INSERT INTO otps (phone, otp, expires_at) VALUES ($1, $2, $3)',
    [phone, otp, expiresAt]
  );

  // Send via Twilio WhatsApp
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken && accountSid !== 'your_twilio_account_sid') {
      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);

      await client.messages.create({
        body: `Your SAHYOG verification code is: ${otp}. Valid for 5 minutes. Do not share this with anyone.`,
        from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
        to: `whatsapp:${phone}`,
      });

      console.log(`✅ WhatsApp OTP sent to ${phone}`);
    } else {
      // Development mode - log OTP to console
      console.log(`📱 [DEV MODE] OTP for ${phone}: ${otp}`);
    }
  } catch (error) {
    console.error('❌ Failed to send WhatsApp OTP:', error.message);
    // In development, don't throw — OTP is still in DB
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Failed to send OTP. Please try again.');
    }
  }

  return { phone, expiresAt, otpSent: true };
};

/**
 * Verify OTP and return JWT
 */
const verifyOTP = async (phone, otp) => {
  // Find valid OTP
  const result = await query(
    'SELECT * FROM otps WHERE phone = $1 AND otp = $2 AND is_used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [phone, otp]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid or expired OTP');
  }

  // Mark OTP as used
  await query('UPDATE otps SET is_used = true WHERE id = $1', [result.rows[0].id]);

  // Find or create user
  let userResult = await query('SELECT * FROM users WHERE phone = $1', [phone]);

  if (userResult.rows.length === 0) {
    // Create new user
    userResult = await query(
      'INSERT INTO users (phone) VALUES ($1) RETURNING *',
      [phone]
    );
  }

  const user = userResult.rows[0];

  // Generate JWT token
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
    isNewUser: !user.name,
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

module.exports = { sendWhatsAppOTP, verifyOTP, registerUser };
