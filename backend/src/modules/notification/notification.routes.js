const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { verifyUser } = require('../../middleware/auth.middleware');

router.get('/', verifyUser, notificationController.getNotifications);
router.get('/unread-count', verifyUser, notificationController.getUnreadCount);
router.put('/:notificationId/read', verifyUser, notificationController.markAsRead);
router.put('/read-all', verifyUser, notificationController.markAllAsRead);

module.exports = router;
