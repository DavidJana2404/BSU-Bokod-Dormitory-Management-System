# Render Deployment Guide - Email Configuration

## 🚀 Deploying Email Notification System to Render

After pushing your code to GitHub, follow these steps to configure emails in Render.

---

## Step 1: Push Code to GitHub

Your code includes:
- ✅ Welcome email functionality
- ✅ Password setup email functionality  
- ✅ Email templates
- ✅ Updated controllers

The `.env` file is NOT pushed (it's in `.gitignore` for security).

---

## Step 2: Configure Environment Variables in Render

Go to your Render dashboard and add these environment variables:

### Required Email Variables

1. **MAIL_MAILER**
   ```
   smtp
   ```

2. **MAIL_HOST**
   ```
   smtp.gmail.com
   ```

3. **MAIL_PORT**
   ```
   587
   ```

4. **MAIL_USERNAME**
   ```
   admiraldavid71@gmail.com
   ```

5. **MAIL_PASSWORD**
   ```
   wkcd vzyp xlpc qiva
   ```

6. **MAIL_ENCRYPTION**
   ```
   tls
   ```

7. **MAIL_FROM_ADDRESS**
   ```
   admiraldavid71@gmail.com
   ```

8. **MAIL_FROM_NAME**
   ```
   Dormitory Management System
   ```

---

## Step 3: How to Add Variables in Render

### Option A: Through Render Dashboard (Recommended)

1. Go to https://dashboard.render.com
2. Select your web service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable one by one:
   - Key: `MAIL_MAILER`
   - Value: `smtp`
   - Click **Save**
6. Repeat for all 8 email variables above

### Option B: Through render.yaml (Alternative)

If you prefer using `render.yaml`, the variables are already defined in your file. You just need to set the secret values in the Render dashboard.

---

## Step 4: Verify Deployment

After deployment completes:

1. **Check Logs**
   - Go to **Logs** tab in Render dashboard
   - Look for any email-related errors

2. **Test Email Sending**
   - Approve a student application
   - Check if email is received at the student's email
   - Check logs for "Welcome email sent to student"

3. **Test Password Setup Email**
   - Set up a password for a student
   - Check if email is received
   - Check logs for "Password setup email sent to student"

---

## Step 5: Troubleshooting

### Emails Not Sending in Production

1. **Check Environment Variables**
   ```bash
   # In Render Shell
   php artisan config:clear
   php artisan cache:clear
   ```

2. **Check Logs**
   ```bash
   # In Render Logs tab, filter for:
   - "Welcome email sent"
   - "Password setup email sent"
   - "Failed to send email"
   ```

3. **Verify Gmail Settings**
   - Make sure the App Password is correct
   - Verify 2FA is enabled on your Google account
   - Check if Gmail is blocking the connection

4. **Test from Render Shell**
   ```bash
   php artisan tinker
   # Then run:
   Mail::raw('Test', function($m) { $m->to('test@example.com')->subject('Test'); });
   ```

### Common Issues

**Issue: "Connection refused"**
- Solution: Check MAIL_HOST and MAIL_PORT are correct

**Issue: "Authentication failed"**
- Solution: Verify MAIL_PASSWORD is the App Password (not regular password)

**Issue: "Emails going to spam"**
- Solution: This is normal for new senders. Ask recipients to mark as "Not Spam"

---

## Security Best Practices

### ✅ DO:
- Use environment variables for sensitive data
- Keep App Password secure
- Use MAIL_ENCRYPTION=tls
- Monitor email sending logs

### ❌ DON'T:
- Commit .env file to Git
- Share your App Password
- Use regular Gmail password (use App Password)
- Ignore failed email logs

---

## Email Sending Workflow in Production

### 1. Application Approved
```
Manager approves → System creates student → Welcome email sent
                                           → Logs: "Welcome email sent"
```

### 2. Student Manually Added
```
Manager adds student → System creates record → Welcome email sent
                                             → Logs: "Welcome email sent"
```

### 3. Password Setup
```
Manager sets password → System updates student → Password email sent
                                               → Logs: "Password setup email sent"
```

---

## Monitoring

### Check Email Activity
1. Go to Render **Logs** tab
2. Search for:
   - `Welcome email sent to student`
   - `Password setup email sent to student`
   - `Failed to send`

### Gmail Sent Folder
- Check `admiraldavid71@gmail.com` sent folder
- Verify emails are being sent successfully

---

## Performance Considerations

### Current Setup (Synchronous)
Emails are sent immediately when actions occur. This is fine for low traffic.

### For High Traffic (Optional Future Enhancement)
Consider using queues:
```php
// In controllers, change:
Mail::to($email)->send(new WelcomeMail($student));

// To:
Mail::to($email)->queue(new WelcomeMail($student));
```

Then configure queue worker in Render.

---

## Testing Checklist

Before considering deployment complete, test:

- [ ] Approve a student application → Welcome email received
- [ ] Add student manually → Welcome email received  
- [ ] Set up student password → Credentials email received
- [ ] Check all emails are properly formatted
- [ ] Verify login credentials work
- [ ] Check emails don't go to spam (or mark as not spam)
- [ ] Verify logs show successful sends
- [ ] Test with multiple student emails

---

## Quick Commands Reference

```bash
# Clear caches after environment changes
php artisan config:clear
php artisan cache:clear

# Test email configuration
php artisan tinker
Mail::raw('Test', function($m) { 
    $m->to('test@example.com')->subject('Test'); 
});

# View recent logs
tail -f /var/log/render.log
```

---

## Support

If emails still don't work after following this guide:

1. Check Render logs for specific errors
2. Verify all 8 environment variables are set correctly
3. Test with a simple raw email first
4. Ensure Gmail App Password is active
5. Check if Gmail has blocked the Render IP

---

## Environment Variables Summary

Copy-paste ready for Render:

```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=admiraldavid71@gmail.com
MAIL_PASSWORD=wkcd vzyp xlpc qiva
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=admiraldavid71@gmail.com
MAIL_FROM_NAME=Dormitory Management System
```

**IMPORTANT:** Add these one by one in the Render dashboard Environment tab.

---

## Ready to Deploy! 🚀

Once you've:
1. ✅ Pushed code to GitHub
2. ✅ Added environment variables in Render
3. ✅ Deployment completed successfully
4. ✅ Tested email sending

Your email notification system is live!
