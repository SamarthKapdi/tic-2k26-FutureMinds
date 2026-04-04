const authService = require('./auth.service')

const isInfraLoginError = (error) => {
  const infraCodes = ['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN']
  if (infraCodes.includes(error?.code)) {
    return true
  }

  const msg = (error?.message || '').toLowerCase()
  return (
    msg.includes('getaddrinfo') ||
    msg.includes('connect') ||
    msg.includes('database') ||
    msg.includes('query error')
  )
}

/**
 * POST /api/auth/register - Register with email + password + profile
 */
const emailRegister = async (req, res) => {
  try {
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
    } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      })
    }

    const result = await authService.registerWithEmail({
      name,
      email,
      password,
      phone,
      city,
      state,
      address,
      latitude,
      longitude,
    })

    return res
      .status(201)
      .json({ success: true, message: 'Registration successful', data: result })
  } catch (error) {
    console.error('Register error:', error.message)
    const status = error.message.includes('already exists') ? 409 : 400
    return res
      .status(status)
      .json({ success: false, message: error.message || 'Registration failed' })
  }
}

/**
 * POST /api/auth/login - Login with email + password
 */
const emailLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required' })
    }

    const result = await authService.loginWithEmail(email, password)

    return res
      .status(200)
      .json({ success: true, message: 'Login successful', data: result })
  } catch (error) {
    console.error('Login error:', error.message)

    if (isInfraLoginError(error)) {
      return res.status(503).json({
        success: false,
        message:
          'Login service is temporarily unavailable. Please try again in a moment.',
        code: 'AUTH_SERVICE_UNAVAILABLE',
      })
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Login failed',
      code: error.code || 'LOGIN_FAILED',
    })
  }
}

/**
 * POST /api/auth/google - Google sign-in via Firebase ID token
 */
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body

    if (!idToken) {
      return res
        .status(400)
        .json({ success: false, message: 'Firebase idToken is required' })
    }

    const result = await authService.loginWithGoogle(idToken)

    return res.status(200).json({
      success: true,
      message: result.isNewUser
        ? 'Account created via Google'
        : 'Login successful',
      data: result,
    })
  } catch (error) {
    console.error('Google login error:', error.message)
    return res
      .status(401)
      .json({ success: false, message: error.message || 'Google login failed' })
  }
}

module.exports = { emailRegister, emailLogin, googleLogin }
