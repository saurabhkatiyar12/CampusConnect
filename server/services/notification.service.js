const Notification = require('../models/Notification');

let io;

const init = (socketIO) => { io = socketIO; };

const createNotification = async ({ recipient, sender, type, title, message, link }) => {
  try {
    const notification = await Notification.create({ recipient, sender, type, title, message, link });
    if (io) {
      io.to(`user_${recipient}`).emit('notification', {
        _id: notification._id,
        type,
        title,
        message,
        link,
        createdAt: notification.createdAt
      });
    }
    return notification;
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

const createBulkNotifications = async (recipients, notifData) => {
  const promises = recipients.map(recipientId =>
    createNotification({ ...notifData, recipient: recipientId })
  );
  return Promise.all(promises);
};

module.exports = { init, createNotification, createBulkNotifications };
