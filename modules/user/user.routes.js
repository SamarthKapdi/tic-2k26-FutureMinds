const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyUser } = require('../../middleware/auth.middleware');

// All user routes require authentication
router.use(verifyUser);

// GET /api/user/profile
router.get('/profile', userController.getProfile);

// PUT /api/user/update
router.put('/update', userController.updateProfile);

module.exports = router;
