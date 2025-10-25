# Render Email Troubleshooting Guide

## 🔍 Step 1: Wait for Deployment

After pushing code, Render needs 5-10 minutes to deploy. 

**Check:** https://dashboard.render.com → Your Service → Logs

Wait until you see: `Build successful` and service is `Live`

---

## 🧪 Step 2: Check Email Configuration

Visit this URL (replace with your Render URL):

```
https://your-app.onrender.com/debug-email-config
```

**You should see:**
```json
{
  "mail_mailer": "smtp",
  "mail_host": "smtp.gmail.com",
  "mail_port": 587,
  "mail_username": "admiraldavid71@gmail.com",
  "mail_encryption": "tls",
  "mail_from_address": "admiraldavid71@gmail.com",
  "mail_from_name": "Laravel",
  "password_set": "YES",
  "password_length": 19
}
```

### ❌ If you see different values:

The environment variables are NOT set correctly in Render.

**Fix:**
1. Go to Render Dashboard → Your Service → Environment
2. Verify these 8 variables are added:

| Variable | Value |
|----------|-------|
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | `admiraldavid71@gmail.com` |
| `MAIL_PASSWORD` | `wkcd vzyp xlpc qiva` |
| `MAIL_ENCRYPTION` | `tls` |
| `MAIL_FROM_ADDRESS` | `admiraldavid71@gmail.com` |
| `MAIL_FROM_NAME` | `Dormitory Management System` |

3. Click **Save Changes**
4. Wait for redeploy (~5 minutes)
5. Check `/debug-email-config` again

---

## 🔧 Step 3: Clear Caches on Render

Go to Render Dashboard → Your Service → Shell

Run these commands:
```bash
php artisan config:clear
php artisan cache:clear
php artisan optimize:clear
```

---

## 📧 Step 4: Test Email Sending

### Option A: Via Render Shell

In Render Shell, run:
```bash
php artisan tinker
```

Then paste:
```php
Mail::raw('Test from Render', function($m) {
    $m->to('admiraldavid71@gmail.com')->subject('Test Email');
});
```

Press Enter. If successful, check your email.

### Option B: Via Your App

1. Log in as manager
2. Edit a student
3. Set up their password
4. Check if email arrives

---

## 🐛 Step 5: Check Render Logs

Go to Render Dashboard → Your Service → Logs

**Look for:**
- ✅ `Password setup email sent to student`
- ✅ `Welcome email sent to student`
- ❌ Any error messages about email/SMTP

**Common errors:**

### Error: "Connection refused"
**Cause:** MAIL_HOST or MAIL_PORT wrong
**Fix:** Verify environment variables

### Error: "Authentication failed"  
**Cause:** Wrong MAIL_PASSWORD
**Fix:** 
- Make sure you're using the App Password (not regular Gmail password)
- App Password should be: `wkcd vzyp xlpc qiva`
- Check for extra spaces in the environment variable

### Error: "Stream_socket_client(): SSL operation failed"
**Cause:** Wrong MAIL_ENCRYPTION or MAIL_PORT
**Fix:**
- MAIL_ENCRYPTION must be `tls` (not `ssl`)
- MAIL_PORT must be `587` (not `465`)

---

## ✅ Step 6: Verify Gmail Settings

1. Log into **admiraldavid71@gmail.com**
2. Go to **Security** settings
3. Verify **2-Step Verification** is enabled
4. Go to **App Passwords**
5. Verify the app password `wkcd vzyp xlpc qiva` exists

If the app password was deleted, generate a new one and update MAIL_PASSWORD in Render.

---

## 🎯 Quick Checklist

Mark these off as you complete them:

- [ ] Render deployment completed (service is Live)
- [ ] Visited `/debug-email-config` endpoint
- [ ] All 8 email variables show correct values
- [ ] `password_set` shows "YES"
- [ ] `password_length` shows 19
- [ ] Ran `php artisan config:clear` in Render Shell
- [ ] Ran `php artisan cache:clear` in Render Shell
- [ ] Tested email via Shell or app
- [ ] Checked Render logs for errors
- [ ] Gmail 2FA is enabled
- [ ] App password exists in Gmail

---

## 🆘 Still Not Working?

### Check These:

1. **Is the password correct?**
   - It should be: `wkcd vzyp xlpc qiva` (with spaces)
   - Check for copy-paste errors

2. **Did Render save the variables?**
   - Click each variable in Render Environment tab
   - Make sure the value is exactly as listed above

3. **Is Gmail blocking Render's IP?**
   - Check Gmail's "Blocked sign-in attempts" 
   - If blocked, click "Allow access"

4. **Are the variables in the correct format?**
   - Do NOT add quotes in Render (it adds them automatically)
   - Wrong: `"smtp"` 
   - Right: `smtp`

---

## 📋 Expected Output After Fix

After fixing everything, you should see:

1. **In `/debug-email-config`:**
   - All values correct
   - `password_set`: "YES"

2. **In Render Logs:**
   - `Password setup email sent to student`
   - No SMTP errors

3. **In Gmail:**
   - Email received at admiraldavid71@gmail.com or student's email
   - Subject: "Your Login Credentials" or "Welcome to..."

---

## 🎉 Success!

Once emails are working:
- Test with a real student application
- Test password setup
- Remove the `/debug-email-config` endpoint (security)

---

## Copy-Paste Ready Environment Variables

For Render Environment tab:

```
MAIL_MAILER
smtp

MAIL_HOST
smtp.gmail.com

MAIL_PORT
587

MAIL_USERNAME
admiraldavid71@gmail.com

MAIL_PASSWORD
wkcd vzyp xlpc qiva

MAIL_ENCRYPTION
tls

MAIL_FROM_ADDRESS
admiraldavid71@gmail.com

MAIL_FROM_NAME
Dormitory Management System
```

**Remember:** Don't add quotes in Render - paste the value as-is!
