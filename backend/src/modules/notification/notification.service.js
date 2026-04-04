const { query } = require('../../config/db');

/**
 * Create a notification for a user
 */
const createNotification = async (userId, type, title, message, data = {}) => {
  const result = await query(
    `INSERT INTO notifications (user_id, type, title, message, data)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, type, title, message, JSON.stringify(data)]
  );
  return result.rows[0];
};

/**
 * Create notifications for multiple users
 */
const createBulkNotifications = async (userIds, type, title, message, data = {}) => {
  if (!userIds || userIds.length === 0) return [];
  const values = userIds.map((_, i) => {
    const base = i * 5;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
  }).join(', ');
  const params = userIds.flatMap(uid => [uid, type, title, message, JSON.stringify(data)]);
  const result = await query(
    `INSERT INTO notifications (user_id, type, title, message, data) VALUES ${values} RETURNING *`,
    params
  );
  return result.rows;
};

/**
 * Get notifications for a user
 */
const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const result = await query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  const countResult = await query(
    `SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_read = false) as unread FROM notifications WHERE user_id = $1`,
    [userId]
  );
  return {
    notifications: result.rows,
    total: parseInt(countResult.rows[0].total),
    unread: parseInt(countResult.rows[0].unread),
    page,
    limit,
  };
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
  const result = await query(
    `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
    [notificationId, userId]
  );
  return result.rows[0];
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  await query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return { success: true };
};

/**
 * Get unread count for a user
 */
const getUnreadCount = async (userId) => {
  const result = await query(
    `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return parseInt(result.rows[0].count);
};

module.exports = {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
