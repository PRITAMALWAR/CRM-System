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
    const importantTypes = ['Lead Assigned', 'Status Changed', 'New Activity'];
    
    if (importantTypes.includes(notification.type)) {
      // Fetch user to get email
      const { User } = require('../models');
      const user = await User.findByPk(notification.userId, {
        attributes: ['email', 'name']
      });

      if (user && user.email) {
        const emailSent = await sendEmail({
          to: user.email,
          subject: notification.title,
          text: `Hi ${user.name},\n\n${notification.message}\n\nBest regards,\nCRM System`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">${notification.title}</h2>
              <p>Hi ${user.name},</p>
              <p>${notification.message}</p>
              <p style="margin-top: 30px;">Best regards,<br><strong>CRM System</strong></p>
            </div>
          `
        });
        
        if (!emailSent) {
          console.warn(`Failed to send email notification to ${user.email} for notification ${notification.id}`);
        }
      } else {
        console.warn(`User ${notification.userId} not found or has no email address`);
      }
    }
  } catch (error) {
    console.error('Send email notification error:', error);
  }
};

module.exports = {
  createNotification,
  emitNotification
};

