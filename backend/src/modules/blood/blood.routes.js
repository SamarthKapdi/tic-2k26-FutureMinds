const express = require('express');
const router = express.Router();
const bloodController = require('./blood.controller');
const { verifyUser } = require('../../middleware/auth.middleware');

// Public routes
router.get('/requests', bloodController.getRequests);

// Protected routes
router.post('/register-donor', verifyUser, bloodController.registerDonor);
router.post('/create-request', verifyUser, bloodController.createRequest);
router.get('/nearby-donors', verifyUser, bloodController.getNearbyDonors);
router.post('/respond', verifyUser, bloodController.respond);
router.get('/history', verifyUser, bloodController.getHistory);

module.exports = router;
