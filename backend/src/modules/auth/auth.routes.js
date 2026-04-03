const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { verifyUser } = require('../../middleware/auth.middleware');

// POST /api/auth/firebase-login - Verify Firebase token and issue JWT
router.post('/firebase-login', authController.firebaseLogin);

// POST /api/auth/register - Complete registration (requires auth)
router.post('/register', verifyUser, authController.register);

module.exports = router;
