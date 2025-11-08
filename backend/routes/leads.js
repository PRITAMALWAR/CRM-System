const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Lead, User, Activity, Notification } = require('../models');
const { Op } = require('sequelize');
const { authorize } = require('../middleware/auth');
const { createNotification } = require('../services/notificationService');

const router = express.Router();

// @route   GET /api/leads
// @desc    Get all leads with filters
// @access  Private
router.get('/', [
  query('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']),
  query('assignedTo').optional().isUUID(),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const { status, assignedTo, search } = req.query;
    const where = {};

    // Apply filters
    if (status) where.status = status;
    if (assignedTo) where.assignedToId = assignedTo;

    // Search filter
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Role-based access: Sales Executives can only see their assigned leads
    if (req.user.role === 'Sales Executive') {
      where.assignedToId = req.user.id;
    }

    const leads = await Lead.findAll({
      where,
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(leads);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leads/:id
// @desc    Get lead by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
        {
          model: Activity,
          as: 'activities',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Role-based access check
    if (req.user.role === 'Sales Executive' && lead.assignedToId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Private
router.post('/', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']),
  body('assignedToId').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leadData = {
      ...req.body,
      createdById: req.user.id,
      assignedToId: req.body.assignedToId || req.user.id
    };

    const lead = await Lead.create(leadData);

    // Create activity log
    await Activity.create({
      type: 'Note',
      title: 'Lead Created',
      description: `Lead ${lead.firstName} ${lead.lastName} was created`,
      leadId: lead.id,
      userId: req.user.id
    });

    // Create notification if assigned to someone else
    if (lead.assignedToId !== req.user.id) {
      await createNotification({
        type: 'Lead Assigned',
        title: 'New Lead Assigned',
        message: `You have been assigned a new lead: ${lead.firstName} ${lead.lastName}`,
        userId: lead.assignedToId,
        leadId: lead.id
      });
    }

    const createdLead = await Lead.findByPk(lead.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json(createdLead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leads/:id
// @desc    Update lead
// @access  Private
router.put('/:id', [
  body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']),
  body('assignedToId').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Role-based access check
    if (req.user.role === 'Sales Executive' && lead.assignedToId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const oldStatus = lead.status;
    const oldAssignedTo = lead.assignedToId;

    await lead.update(req.body);

    // Create activity log for status change
    if (req.body.status && req.body.status !== oldStatus) {
      await Activity.create({
        type: 'Status Change',
        title: 'Status Changed',
        description: `Status changed from ${oldStatus} to ${req.body.status}`,
        leadId: lead.id,
        userId: req.user.id,
        metadata: { oldStatus, newStatus: req.body.status }
      });

      // Create notification
      if (lead.assignedToId && lead.assignedToId !== req.user.id) {
        await createNotification({
          type: 'Status Changed',
          title: 'Lead Status Updated',
          message: `Lead ${lead.firstName} ${lead.lastName} status changed to ${req.body.status}`,
          userId: lead.assignedToId,
          leadId: lead.id
        });
      }
    }

    // Create activity log and notification for assignment change
    if (req.body.assignedToId && req.body.assignedToId !== oldAssignedTo) {
      await Activity.create({
        type: 'Note',
        title: 'Lead Reassigned',
        description: `Lead reassigned to new user`,
        leadId: lead.id,
        userId: req.user.id
      });

      await createNotification({
        type: 'Lead Assigned',
        title: 'Lead Assigned to You',
        message: `You have been assigned lead: ${lead.firstName} ${lead.lastName}`,
        userId: req.body.assignedToId,
        leadId: lead.id
      });
    }

    const updatedLead = await Lead.findByPk(lead.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json(updatedLead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete lead (Admin/Manager only)
// @access  Private
router.delete('/:id', authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await lead.destroy();

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

