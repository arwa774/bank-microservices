const { getDB } = require('./db');

async function getNotifications(call, callback) {
  try {
    const db = getDB();
    const docs = await db.notifications
      .find({ selector: { userId: call.request.userId } })
      .exec();

    callback(null, {
      notifications: docs.map(d => ({
        id:      d.id,
        userId:  d.userId,
        message: d.message,
        read:    d.read,
        date:    d.date
      }))
    });
  } catch (err) {
    callback({ code: 2, message: err.message });
  }
}

async function markAsRead(call, callback) {
  try {
    const db = getDB();
    const doc = await db.notifications
      .findOne({ selector: { id: call.request.notificationId } })
      .exec();

    if (!doc) return callback({ code: 5, message: 'Notification not found' });

    await doc.patch({ read: true });
    callback(null, { success: true, message: 'Notification marked as read' });
  } catch (err) {
    callback({ code: 2, message: err.message });
  }
}

module.exports = { getNotifications, markAsRead };