const express = require('express');
const { sendEmail, verifyEmailConfig } = require('../services/emailService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/test/email
// @desc    Test email configuration
// @access  Private (Admin only)
router.get('/email', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const isConfigured = await verifyEmailConfig();
    
    if (!isConfigured) {
      return res.status(400).json({
        message: 'Email configuration is not valid',
        configured: false,
        hint: 'Check your EMAIL_USER, EMAIL_PASS, EMAIL_HOST, and EMAIL_PORT in .env file'
      });
    }

    // Send test email
    const emailSent = await sendEmail({
      to: req.user.email,
      subject: 'Test Email - CRM System',
      text: `Hi ${req.user.name},\n\nThis is a test email from the CRM System.\n\nIf you received this, your email configuration is working correctly!\n\nBest regards,\nCRM System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">✅ Test Email - CRM System</h2>
          <p>Hi ${req.user.name},</p>
          <p>This is a test email from the CRM System.</p>
          <p style="background-color: #d4edda; padding: 15px; border-radius: 4px; border-left: 4px solid #28a745;">
            <strong>✅ If you received this, your email configuration is working correctly!</strong>
          </p>
          <p style="margin-top: 30px;">Best regards,<br><strong>CRM System</strong></p>
        </div>
      `
    });

    res.json({
      message: emailSent ? 'Test email sent successfully' : 'Failed to send test email',
      configured: true,
      emailSent
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      message: 'Error testing email configuration',
      error: error.message
    });
  }
});

module.exports = router;


