const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { verifyUser } = require('../../middleware/auth.middleware');

// All routes are protected
router.use(verifyUser);

router.post('/create', reportController.create);
router.get('/list', reportController.list);

module.exports = router;
