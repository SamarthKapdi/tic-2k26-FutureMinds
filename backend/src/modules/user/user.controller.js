const userService = require('./user.service')
const { uploadUserAvatar } = require('../../services/r2.service')

/**
 * GET /api/user/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.id)
    const stats = await userService.getUserStats(req.user.id)

    return res.status(200).json({
      success: true,
      data: { user, stats },
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get profile',
    })
  }
}

/**
 * PUT /api/user/update
 */
const updateProfile = async (req, res) => {
  try {
    const payload = { ...req.body }
    if (req.file) {
      payload.avatar_url = await uploadUserAvatar(req.file)
    }

    const user = await userService.updateProfile(req.user.id, payload)

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    })
  }
}

/**
 * GET /api/user/leaderboard
 */
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 20 } = req.query
    const users = await userService.getLeaderboard(parseInt(limit))

    return res.status(200).json({
      success: true,
      data: { users },
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to load leaderboard',
    })
  }
}

/**
 * GET /api/user/settings
 */
const getSettings = async (req, res) => {
  try {
    const settings = await userService.getSettings(req.user.id)
    return res.status(200).json({
      success: true,
      data: { settings },
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to load settings',
    })
  }
}

/**
 * PUT /api/user/settings
 */
const updateSettings = async (req, res) => {
  try {
    const settings = await userService.updateSettings(req.user.id, req.body)
    return res.status(200).json({
      success: true,
      message: 'Settings updated',
      data: { settings },
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings',
    })
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getLeaderboard,
  getSettings,
  updateSettings,
}
