const userService = require('./user.service');

/**
 * GET /api/user/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.id);
    const stats = await userService.getUserStats(req.user.id);

    return res.status(200).json({
      success: true,
      data: { user, stats },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get profile',
    });
  }
};

/**
 * PUT /api/user/update
 */
const updateProfile = async (req, res) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};

module.exports = { getProfile, updateProfile };
