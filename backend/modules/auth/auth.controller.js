const authService = require('./auth.service');

/**
 * POST /api/auth/login
 * Send OTP to user's WhatsApp number
 */
const login = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Validate phone format (Indian)
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use +91XXXXXXXXXX',
      });
    }

    const result = await authService.sendWhatsAppOTP(phone);

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your WhatsApp number',
      data: {
        phone: result.phone,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

/**
 * POST /api/auth/verify
 * Verify OTP and get JWT token
 */
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    const result = await authService.verifyOTP(phone, otp);

    return res.status(200).json({
      success: true,
      message: result.isNewUser ? 'OTP verified. Please complete registration.' : 'Login successful',
      data: result,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'OTP verification failed',
    });
  }
};

/**
 * POST /api/auth/register
 * Complete user registration after OTP verification
 */
const register = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, city, state, address, latitude, longitude } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required to complete registration',
      });
    }

    const user = await authService.registerUser(userId, {
      name, email, city, state, address, latitude, longitude,
    });

    return res.status(200).json({
      success: true,
      message: 'Registration completed successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

module.exports = { login, verifyOTP, register };
