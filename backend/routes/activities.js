const express = require('express');
const { body, validationResult } = require('express-validator');
const { Activity, Lead, User, Notification } = require('../models');
const { createNotification } = require('../services/notificationService');

const router = express.Router();

// @route   GET /api/activities
// @desc    Get activities (optionally filtered by leadId)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { leadId } = req.query;
    const where = {};

    if (leadId) {
      where.leadId = leadId;
    }

    // Role-based access: Sales Executives can only see activities for their leads
    if (req.user.role === 'Sales Executive') {
      const userLeads = await Lead.findAll({
        where: { assignedToId: req.user.id },
        attributes: ['id']
      });
      where.leadId = { [require('sequelize').Op.in]: userLeads.map(l => l.id) };
    }

    const activities = await Activity.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Lead, as: 'lead', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/activities
// @desc    Create a new activity
// @access  Private
router.post('/', [
  body('type').isIn(['Note', 'Call', 'Meeting', 'Email', 'Status Change']).withMessage('Invalid activity type'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('leadId').isUUID().withMessage('Valid lead ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, title, description, leadId, metadata } = req.body;

    // Verify lead exists and user has access
    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Role-based access check
    if (req.user.role === 'Sales Executive' && lead.assignedToId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const activity = await Activity.create({
      type,
      title,
      description,
      leadId,
      userId: req.user.id,
      metadata: metadata || {}
    });

    // Create notification for assigned user if different from creator
    if (lead.assignedToId && lead.assignedToId !== req.user.id) {
      await createNotification({
        type: 'New Activity',
        title: 'New Activity Added',
        message: `${req.user.name} added a ${type.toLowerCase()} to lead ${lead.firstName} ${lead.lastName}`,
        userId: lead.assignedToId,
        leadId: lead.id
      });
    }

    const createdActivity = await Activity.findByPk(activity.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Lead, as: 'lead', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    res.status(201).json(createdActivity);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/activities/:id
// @desc    Update activity
// @access  Private
router.put('/:id', [
  body('type').optional().isIn(['Note', 'Call', 'Meeting', 'Email', 'Status Change']),
  body('title').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const activity = await Activity.findByPk(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Users can only update their own activities (unless Admin/Manager)
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager' && activity.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await activity.update(req.body);

    const updatedActivity = await Activity.findByPk(activity.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Lead, as: 'lead', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    res.json(updatedActivity);
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/activities/:id
// @desc    Delete activity
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Users can only delete their own activities (unless Admin/Manager)
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager' && activity.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await activity.destroy();

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

