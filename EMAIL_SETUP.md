# Email Notification Setup Guide

## Gmail Setup

To enable email notifications with Gmail, you need to:

### 1. Enable 2-Step Verification
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled

### 2. Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "CRM System" as the name
5. Click **Generate**
6. Copy the 16-character password (no spaces)

### 3. Configure Environment Variables

Update your `backend/.env` file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
SEND_LOGIN_EMAIL=true  # Set to true to receive login notifications
```

### 4. Test Email Configuration

The system will automatically send:
- **Welcome email** when a user registers
- **Login notification** (if `SEND_LOGIN_EMAIL=true`)
- **Lead assignment notifications** when a lead is assigned to you
- **Status change notifications** when a lead status changes
- **Activity notifications** when activities are added to your leads

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
```

### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your_email@yahoo.com
EMAIL_PASS=your_app_password
```

### Custom SMTP Server
```env
EMAIL_HOST=your_smtp_server.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USER=your_username
EMAIL_PASS=your_password
```

## Troubleshooting

### "Invalid login" error
- Make sure you're using an **App Password** for Gmail, not your regular password
- Verify 2-Step Verification is enabled

### "Connection timeout" error
- Check your firewall settings
- Verify the SMTP host and port are correct
- Try using port 465 with `secure: true` (requires code change)

### Emails not being received
- Check spam/junk folder
- Verify email address is correct
- Check server logs for error messages
- Ensure `EMAIL_USER` and `EMAIL_PASS` are set correctly

### Testing Email Service

You can test the email service by:
1. Registering a new user (should receive welcome email)
2. Logging in (if `SEND_LOGIN_EMAIL=true`)
3. Assigning a lead to yourself
4. Changing a lead status

## Security Notes

- Never commit `.env` files to version control
- Use App Passwords instead of regular passwords
- Rotate App Passwords regularly
- Consider using environment-specific email accounts for testing

