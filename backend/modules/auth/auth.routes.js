const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { verifyUser } = require('../../middleware/auth.middleware');

// POST /api/auth/login - Send OTP
router.post('/login', authController.login);

// POST /api/auth/verify - Verify OTP & get token
router.post('/verify', authController.verifyOTP);

// POST /api/auth/register - Complete registration (requires auth)
router.post('/register', verifyUser, authController.register);

module.exports = router;
