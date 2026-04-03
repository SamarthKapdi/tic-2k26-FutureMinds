const express = require('express');
const router = express.Router();
const fundController = require('./fund.controller');
const { verifyUser } = require('../../middleware/auth.middleware');

// Public routes
router.get('/categories', fundController.getCategories);
router.get('/campaign/list', fundController.listCampaigns);

// Webhook (no auth - called by Cashfree)
router.post('/webhook/cashfree', fundController.webhookCashfree);

// Protected routes
router.post('/campaign/create', verifyUser, fundController.createCampaign);
router.post('/donate', verifyUser, fundController.donate);
router.get('/transactions', verifyUser, fundController.getTransactions);

module.exports = router;
