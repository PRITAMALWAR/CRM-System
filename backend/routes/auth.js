const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { sendEmail } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
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

    const token = generateToken(user.id);

    // Create in-app notification for successful registration
    createNotification({
      type: 'System',
      title: 'Welcome to CRM System!',
      message: `Your account has been successfully created. Welcome aboard, ${user.name}!`,
      userId: user.id,
      leadId: null
    }).catch(err => {
      console.error('Failed to create registration notification:', err);
    });

    // Send welcome email (async, don't block response)
    sendEmail({
      to: user.email,
      subject: 'Welcome to CRM System',
      text: `Hi ${user.name},\n\nWelcome to the CRM System! Your account has been successfully created.\n\nYour role: ${user.role}\n\nYou can now log in and start managing your leads.\n\nBest regards,\nCRM System Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Welcome to CRM System!</h2>
          <p>Hi ${user.name},</p>
          <p>Your account has been successfully created.</p>
          <p><strong>Your role:</strong> ${user.role}</p>
          <p>You can now log in and start managing your leads.</p>
          <p style="margin-top: 30px;">Best regards,<br><strong>CRM System Team</strong></p>
        </div>
      `
    }).catch(err => {
      console.error('Failed to send welcome email:', err.message || err);
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    // Create in-app notification for successful login
    createNotification({
      type: 'System',
      title: 'Login Successful',
      message: `Welcome back, ${user.name}! You have successfully logged in.`,
      userId: user.id,
      leadId: null
    }).catch(err => {
      console.error('Failed to create login notification:', err);
    });

    // Send login notification email (optional - can be disabled)
    if (process.env.SEND_LOGIN_EMAIL === 'true') {
      sendEmail({
        to: user.email,
        subject: 'Login Notification - CRM System',
        text: `Hi ${user.name},\n\nYou have successfully logged into the CRM System.\n\nIf this wasn't you, please contact support immediately.\n\nBest regards,\nCRM System Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">Login Notification</h2>
            <p>Hi ${user.name},</p>
            <p>You have successfully logged into the CRM System.</p>
            <p style="color: #dc3545; background-color: #f8d7da; padding: 10px; border-radius: 4px; border-left: 4px solid #dc3545;">
              <strong>⚠️ If this wasn't you, please contact support immediately.</strong>
            </p>
            <p style="margin-top: 30px;">Best regards,<br><strong>CRM System Team</strong></p>
          </div>
        `
      }).catch(err => {
        console.error('Failed to send login email:', err.message || err);
      });
    }

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // Always return success message (security best practice - don't reveal if email exists)
    if (!user) {
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Token expires in 1 hour

    // Save reset token to user
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpires
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Send password reset email
    sendEmail({
      to: user.email,
      subject: 'Password Reset Request - CRM System',
      text: `Hi ${user.name},\n\nYou requested a password reset for your CRM System account.\n\nClick the following link to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nCRM System Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset for your CRM System account.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #dc3545;"><strong>⚠️ This link will expire in 1 hour.</strong></p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          <p style="margin-top: 30px;">Best regards,<br><strong>CRM System Team</strong></p>
        </div>
      `
    }).catch(err => {
      console.error('Failed to send password reset email:', err.message || err);
    });

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [require('sequelize').Op.gt]: new Date() // Token not expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired password reset token'
      });
    }

    // Update password (will be hashed by beforeUpdate hook)
    await user.update({
      password,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    // Create notification
    createNotification({
      type: 'System',
      title: 'Password Reset Successful',
      message: 'Your password has been successfully reset. If you did not make this change, please contact support immediately.',
      userId: user.id,
      leadId: null
    }).catch(err => {
      console.error('Failed to create password reset notification:', err);
    });

    // Send confirmation email
    sendEmail({
      to: user.email,
      subject: 'Password Reset Successful - CRM System',
      text: `Hi ${user.name},\n\nYour password has been successfully reset.\n\nIf you did not make this change, please contact support immediately.\n\nBest regards,\nCRM System Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">Password Reset Successful</h2>
          <p>Hi ${user.name},</p>
          <p>Your password has been successfully reset.</p>
          <p style="color: #dc3545; background-color: #f8d7da; padding: 10px; border-radius: 4px; border-left: 4px solid #dc3545;">
            <strong>⚠️ If you did not make this change, please contact support immediately.</strong>
          </p>
          <p style="margin-top: 30px;">Best regards,<br><strong>CRM System Team</strong></p>
        </div>
      `
    }).catch(err => {
      console.error('Failed to send password reset confirmation email:', err.message || err);
    });

    res.json({
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

