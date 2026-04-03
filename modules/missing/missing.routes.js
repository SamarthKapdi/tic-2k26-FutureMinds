const express = require('express');
const router = express.Router();
const missingController = require('./missing.controller');
const { verifyUser } = require('../../middleware/auth.middleware');

// Public routes
router.get('/list', missingController.list);
router.get('/:id', missingController.getDetail);

// Protected routes
router.post('/report', verifyUser, missingController.report);
router.post('/sighting', verifyUser, missingController.sighting);

module.exports = router;
