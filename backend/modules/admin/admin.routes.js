const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { verifyAdmin } = require('../../middleware/admin.middleware');

// Admin auth (no middleware needed)
router.post('/auth/login', adminController.login);

// Protected admin routes
router.get('/dashboard', verifyAdmin, adminController.getDashboard);
router.get('/verifications', verifyAdmin, adminController.getVerifications);
router.post('/verification/approve', verifyAdmin, adminController.approveVerification);
router.post('/verification/reject', verifyAdmin, adminController.rejectVerification);
router.get('/reports', verifyAdmin, adminController.getReports);
router.post('/action', verifyAdmin, adminController.takeAction);

module.exports = router;
