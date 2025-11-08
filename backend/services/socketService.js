const { Notification } = require('../models');
const { emitNotification } = require('./notificationService');

// Store user socket connections
const userSockets = new Map();

// Initialize Socket.io
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle user authentication via socket
    socket.on('authenticate', async (data) => {
      try {
        const { userId } = data;
        if (userId) {
          // Join user-specific room
          socket.join(`user_${userId}`);
          userSockets.set(userId, socket.id);
          console.log(`User ${userId} authenticated on socket ${socket.id}`);

          // Send pending notifications
          const notifications = await Notification.findAll({
            where: {
              userId,
              isRead: false
            },
            order: [['createdAt', 'DESC']],
            limit: 10
          });

          socket.emit('notifications', notifications);
        }
      } catch (error) {
        console.error('Socket authentication error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Remove from userSockets map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });

    // Handle notification read
    socket.on('markNotificationRead', async (data) => {
      try {
        const { notificationId } = data;
        await Notification.update(
          { isRead: true },
          { where: { id: notificationId } }
        );
        socket.emit('notificationRead', { notificationId });
      } catch (error) {
        console.error('Mark notification read error:', error);
      }
    });
  });

  // Export function to emit notifications
  global.emitSocketNotification = (notification) => {
    emitNotification(io, notification);
  };
};

module.exports = {
  initializeSocket
};

