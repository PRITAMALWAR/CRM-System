const { Notification } = require('../models');
const { sendEmail } = require('./emailService');

// Create a notification and optionally send email
const createNotification = async ({ type, title, message, userId, leadId, metadata = {} }) => {
  try {
    const notification = await Notification.create({
      type,
      title,
      message,
      userId,
      leadId,
      metadata
    });

    // Emit real-time notification via Socket.io
    if (global.emitSocketNotification) {
      global.emitSocketNotification(notification);
    }

    // Email notification will be sent asynchronously
    sendEmailNotification(notification).catch(err => {
      console.error('Email notification error:', err);
    });

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// Emit notification via Socket.io
const emitNotification = (io, notification) => {
  if (io) {
    io.to(`user_${notification.userId}`).emit('notification', notification);
  }
};

// Send email notification
const sendEmailNotification = async (notification) => {
  try {
    // Only send emails for important notifications
    const importantTypes = ['Lead Assigned', 'Status Changed'];
    
    if (importantTypes.includes(notification.type)) {
      // Get user email from notification (would need to include User in query)
      // For now, we'll skip the actual email sending but structure is ready
      // await sendEmail({
      //   to: user.email,
      //   subject: notification.title,
      //   text: notification.message
      // });
    }
  } catch (error) {
    console.error('Send email notification error:', error);
  }
};

module.exports = {
  createNotification,
  emitNotification
};

