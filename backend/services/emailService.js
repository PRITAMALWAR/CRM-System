
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials not configured. Email notifications will be disabled.');
    console.warn('   Set EMAIL_USER and EMAIL_PASS in your .env file to enable email notifications.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false, // true for port 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      }
    });

    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error.message);
    return null;
  }
};

// Verify email configuration
const verifyEmailConfig = async () => {
  const transporter = createTransporter();
  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration verification failed:', error.message);
    console.error('   Please check your EMAIL_USER, EMAIL_PASS, EMAIL_HOST, and EMAIL_PORT settings');
    return false;
  }
};

// Send email
const sendEmail = async ({ to, subject, text, html }) => {
  // Validate email address
  if (!to || !to.includes('@')) {
    console.error('Invalid email address:', to);
    return false;
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.log('📧 Email not sent (transporter not configured):', { to, subject });
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"CRM System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    });

    console.log('✅ Email sent successfully:', { to, subject, messageId: info.messageId });
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error.message || error);
    if (error.code === 'EAUTH') {
      console.error('   Authentication failed. Check your EMAIL_USER and EMAIL_PASS.');
      console.error('   For Gmail, make sure you\'re using an App Password, not your regular password.');
    }
    return false;
  }
};

module.exports = {
  sendEmail,
  createTransporter,
  verifyEmailConfig,
};
