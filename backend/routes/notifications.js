const express = require('express');
const { Notification } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { isRead } = req.query;
    const where = { userId: req.user.id };

    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const notifications = await Notification.findAll({
      where,
      include: [
        { model: require('../models').Lead, as: 'lead', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
// NOTE: This must come before /:id routes to avoid route conflicts
router.put('/read-all', async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await notification.update({ isRead: true });

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Delete notification request:', { id, userId: req.user?.id });
    
    if (!id) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    const notification = await Notification.findByPk(id);

    if (!notification) {
      console.log('Notification not found:', id);
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      console.log('Access denied:', { notificationUserId: notification.userId, reqUserId: req.user.id });
      return res.status(403).json({ message: 'Access denied' });
    }

    await notification.destroy();
    console.log('Notification deleted successfully:', id);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

