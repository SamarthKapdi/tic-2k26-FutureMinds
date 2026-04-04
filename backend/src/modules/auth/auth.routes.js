const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('./auth.controller');

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { success: false, message: 'Too many attempts. Try again after 15 minutes.' },
});

// POST /api/auth/register - Email + password registration
router.post('/register', authLimiter, authController.emailRegister);

// POST /api/auth/login - Email + password login  
router.post('/login', authLimiter, authController.emailLogin);

// POST /api/auth/google - Google sign-in via Firebase token
router.post('/google', authLimiter, authController.googleLogin);

module.exports = router;
