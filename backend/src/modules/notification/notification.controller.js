const notificationService = require('./notification.service');

const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await notificationService.getUserNotifications(
      req.user.id, parseInt(page), parseInt(limit)
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    return res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get unread count' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const result = await notificationService.markAsRead(notificationId, req.user.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark notification' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead };
