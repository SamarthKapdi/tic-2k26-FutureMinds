const express = require('express')
const router = express.Router()
const multer = require('multer')
const fundController = require('./fund.controller')
const { verifyUser } = require('../../middleware/auth.middleware')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
})

// Public routes
router.get('/categories', fundController.getCategories)
router.get('/campaign/list', fundController.listCampaigns)

// Webhook (no auth - called by Cashfree)
router.post('/webhook/cashfree', fundController.webhookCashfree)

// Protected routes
router.post(
  '/campaign/create',
  verifyUser,
  upload.fields([
    { name: 'campaign_image', maxCount: 1 },
    { name: 'campaign_proof', maxCount: 1 },
  ]),
  fundController.createCampaign
)
router.post('/donate', verifyUser, fundController.donate)
router.get('/transactions', verifyUser, fundController.getTransactions)

module.exports = router
