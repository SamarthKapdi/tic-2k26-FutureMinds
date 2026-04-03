const authService = require('./auth.service');

/**
 * POST /api/auth/firebase-login
 * Verify Firebase ID token and issue app JWT
 */
const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase idToken is required',
      });
    }

    const result = await authService.loginWithFirebase(idToken);

    return res.status(200).json({
      success: true,
      message: result.isNewUser ? 'Login successful. Please complete registration.' : 'Login successful',
      data: result,
    });
  } catch (error) {
    console.error('Firebase login error:', error.message);
    return res.status(401).json({
      success: false,
      message: error.message || 'Firebase authentication failed',
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

module.exports = { firebaseLogin, register };
