const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/users
// @desc    Create a new user (Admin only)
// @access  Private
router.post('/', authorize('Admin'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['Admin', 'Manager', 'Sales Executive']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Sales Executive'
    });

    res.status(201).json({
      message: 'User created successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users (Admin/Manager only)
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Admin and Manager can see all users, Sales Executive can only see themselves
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });
      return res.json([user]);
    }

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admin can view anyone, Manager can view anyone except Admin, Sales Executive can only view themselves
    if (req.user.role === 'Admin') {
      // Admin can view anyone
    } else if (req.user.role === 'Manager') {
      // Manager cannot view Admin users
      if (user.role === 'Admin') {
        return res.status(403).json({ message: 'Manager cannot view Admin users' });
      }
    } else if (req.user.id !== user.id) {
      // Sales Executive can only view themselves
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['Admin', 'Manager', 'Sales Executive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only Admin can change roles
    if (req.body.role && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admin can change roles' });
    }

    // Admin can update anyone, Manager can update anyone except Admin, users can update their own profile
    if (req.user.role === 'Admin') {
      // Admin can update anyone
    } else if (req.user.role === 'Manager') {
      // Manager cannot update Admin users
      if (user.role === 'Admin') {
        return res.status(403).json({ message: 'Manager cannot update Admin users' });
      }
    } else if (req.user.id !== user.id) {
      // Sales Executive can only update their own profile
      return res.status(403).json({ message: 'Access denied' });
    }

    await user.update(req.body);

    res.json({ message: 'User updated successfully', user: user.toJSON() });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private
router.delete('/:id', authorize('Admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

