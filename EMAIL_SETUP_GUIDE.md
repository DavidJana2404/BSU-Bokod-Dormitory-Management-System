# Email Notification Setup Guide

## Overview
Your system now has a two-email notification workflow for students:

1. **Welcome Email** - Sent when:
   - A student's application is approved by a manager
   - A student is manually added by a manager
   
2. **Password Setup Email** - Sent when:
   - A manager sets up a password for the student

## Email Configuration

### Step 1: Configure Email Settings in `.env`

Add or update these settings in your `.env` file:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Using Gmail (Recommended for Testing)

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → App passwords
   - Select "Mail" and your device
   - Copy the generated 16-character password
4. Use this app password as `MAIL_PASSWORD` in your `.env` file

### Alternative Email Services

#### Mailtrap (for Testing)
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
```

#### SendGrid
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
```

## Email Flow

### 1. Welcome Email
**Triggered when:**
- Manager approves a student application
- Manager manually adds a new student

**Content:**
- Welcome message
- Student details (ID, email, phone)
- Notice to wait for login credentials
- Information about what they can do once they have access

### 2. Password Setup Email
**Triggered when:**
- Manager sets up a password for a student who previously had no password

**Content:**
- Login credentials (email, student ID, temporary password)
- Login button/link
- Security reminder to change password after first login
- Step-by-step login instructions

## Testing

### Test the Email Setup

1. Configure your `.env` file with email settings
2. Clear config cache:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

3. Test by:
   - Approving a student application (Welcome email)
   - Adding a student manually without password (Welcome email)
   - Setting up password for a student (Password setup email)

### Check Email Logs

Email sending is logged. Check your Laravel logs:
```bash
tail -f storage/logs/laravel.log
```

Look for:
- "Welcome email sent to student"
- "Password setup email sent to student"
- Any email error messages

## Troubleshooting

### Emails Not Sending

1. **Check `.env` configuration:**
   ```bash
   php artisan config:clear
   ```

2. **Test email configuration:**
   ```bash
   php artisan tinker
   Mail::raw('Test email', function($message) {
       $message->to('test@example.com')->subject('Test');
   });
   ```

3. **Check logs:**
   - `storage/logs/laravel.log` for application errors
   - Gmail: Check "Less secure app access" settings (if not using App Password)

### Gmail Issues

- Use App Passwords (recommended) instead of regular password
- Enable 2FA on your Google account
- Check Gmail's "Sent" folder to verify emails are being sent

### Email Goes to Spam

- Add proper SPF/DKIM records to your domain
- Use a professional email service (SendGrid, Mailgun, etc.)
- Make sure `MAIL_FROM_ADDRESS` matches your sending domain

## Customization

### Modify Email Templates

Email templates are located at:
- Welcome email: `resources/views/emails/students/welcome.blade.php`
- Password setup: `resources/views/emails/students/password-setup.blade.php`

### Modify Email Classes

Mailable classes are located at:
- `app/Mail/StudentWelcomeMail.php`
- `app/Mail/PasswordSetupMail.php`

## Production Recommendations

1. **Use a professional email service** (SendGrid, Mailgun, Amazon SES)
2. **Configure email queues** for better performance:
   ```php
   Mail::to($email)->queue(new StudentWelcomeMail($student));
   ```
3. **Set up email logging** for audit purposes
4. **Add rate limiting** to prevent spam
5. **Use proper domain authentication** (SPF, DKIM, DMARC)

## Support

If you encounter issues:
1. Check the Laravel logs
2. Verify `.env` configuration
3. Test with a simple email first
4. Check your email service provider's status

## Security Notes

- Never commit `.env` file to version control
- Use App Passwords for Gmail
- Regularly rotate email credentials
- Monitor email sending logs for suspicious activity
- Consider email rate limiting in production
