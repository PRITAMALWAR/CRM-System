const express = require('express');
const { Lead, Activity, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build where clause based on role
    const leadWhere = {};
    if (userRole === 'Sales Executive') {
      leadWhere.assignedToId = userId;
    }

    // Total leads
    const totalLeads = await Lead.count({ where: leadWhere });

    // Leads by status
    const leadsByStatus = await Lead.findAll({
      where: leadWhere,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Leads by source
    const leadsBySource = await Lead.findAll({
      where: {
        ...leadWhere,
        source: { [Op.ne]: null }
      },
      attributes: [
        'source',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['source'],
      raw: true
    });

    // Total value
    const totalValue = await Lead.sum('estimatedValue', { where: leadWhere }) || 0;

    // Won leads value
    const wonValue = await Lead.sum('estimatedValue', {
      where: { ...leadWhere, status: 'Won' }
    }) || 0;

    // Recent activities count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityWhere = {
      createdAt: { [Op.gte]: sevenDaysAgo }
    };

    if (userRole === 'Sales Executive') {
      const userLeads = await Lead.findAll({
        where: { assignedToId: userId },
        attributes: ['id']
      });
      activityWhere.leadId = { [Op.in]: userLeads.map(l => l.id) };
    }

    const recentActivities = await Activity.count({ where: activityWhere });

    // Leads created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const leadsThisMonth = await Lead.count({
      where: {
        ...leadWhere,
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    // Conversion rate (Won / Total)
    const wonLeads = await Lead.count({
      where: { ...leadWhere, status: 'Won' }
    });
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(2) : 0;

    res.json({
      totalLeads,
      leadsByStatus: leadsByStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      leadsBySource: leadsBySource.reduce((acc, item) => {
        acc[item.source] = parseInt(item.count);
        return acc;
      }, {}),
      totalValue: parseFloat(totalValue),
      wonValue: parseFloat(wonValue),
      recentActivities,
      leadsThisMonth,
      conversionRate: parseFloat(conversionRate),
      wonLeads
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/timeline
// @desc    Get activity timeline for dashboard
// @access  Private
router.get('/timeline', async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit) || 10;

    let where = {};

    if (userRole === 'Sales Executive') {
      const userLeads = await Lead.findAll({
        where: { assignedToId: userId },
        attributes: ['id']
      });
      where.leadId = { [Op.in]: userLeads.map(l => l.id) };
    }

    const activities = await Activity.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Lead, as: 'lead', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit
    });

    res.json(activities);
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/performance
// @desc    Get performance metrics by user (Admin/Manager only)
// @access  Private
router.get('/performance', async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
      where: { role: 'Sales Executive' }
    });

    const performance = await Promise.all(
      users.map(async (user) => {
        const totalLeads = await Lead.count({ where: { assignedToId: user.id } });
        const wonLeads = await Lead.count({
          where: { assignedToId: user.id, status: 'Won' }
        });
        const totalValue = await Lead.sum('estimatedValue', {
          where: { assignedToId: user.id }
        }) || 0;
        const wonValue = await Lead.sum('estimatedValue', {
          where: { assignedToId: user.id, status: 'Won' }
        }) || 0;

        return {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          totalLeads,
          wonLeads,
          conversionRate: totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(2) : 0,
          totalValue: parseFloat(totalValue),
          wonValue: parseFloat(wonValue)
        };
      })
    );

    res.json(performance);
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

