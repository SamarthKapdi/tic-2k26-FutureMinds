const express = require('express')
const router = express.Router()
const multer = require('multer')
const missingController = require('./missing.controller')
const { verifyUser } = require('../../middleware/auth.middleware')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true)
      return
    }
    cb(new Error('Only image files are allowed'))
  },
})

// Public routes
router.get('/list', missingController.list)
router.get('/:id', missingController.getDetail)

// Protected routes
router.post(
  '/report',
  verifyUser,
  upload.single('image'),
  missingController.report
)
router.post('/sighting', verifyUser, missingController.sighting)

module.exports = router
