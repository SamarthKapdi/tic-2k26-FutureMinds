const express = require('express')
const router = express.Router()
const multer = require('multer')
const userController = require('./user.controller')
const { verifyUser } = require('../../middleware/auth.middleware')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true)
      return
    }
    cb(new Error('Only image files are allowed'))
  },
})

// All user routes require authentication
router.use(verifyUser)

// GET /api/user/profile
router.get('/profile', userController.getProfile)

// PUT /api/user/update
router.put('/update', upload.single('avatar'), userController.updateProfile)

// GET /api/user/leaderboard
router.get('/leaderboard', userController.getLeaderboard)

// GET /api/user/settings
router.get('/settings', userController.getSettings)

// PUT /api/user/settings
router.put('/settings', userController.updateSettings)

module.exports = router
