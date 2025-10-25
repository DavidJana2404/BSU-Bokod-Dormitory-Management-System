# ✅ Render Deployment Checklist

## Step-by-Step Guide

Your code has been pushed to GitHub! Now follow these steps:

---

## 1. Wait for Render Auto-Deploy ⏳

Render will automatically detect your GitHub push and start deploying.

**Monitor Progress:**
- Go to: https://dashboard.render.com
- Select your web service
- Watch the **Logs** tab for deployment progress

---

## 2. Add Email Environment Variables 📧

While deployment is running (or after), add these 8 variables:

**Go to:** Your Service → **Environment** tab → **Add Environment Variable**

### Add These Variables:

| Key | Value |
|-----|-------|
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | `admiraldavid71@gmail.com` |
| `MAIL_PASSWORD` | `wkcd vzyp xlpc qiva` |
| `MAIL_ENCRYPTION` | `tls` |
| `MAIL_FROM_ADDRESS` | `admiraldavid71@gmail.com` |
| `MAIL_FROM_NAME` | `Dormitory Management System` |

**Important:** After adding all variables, click **Save Changes** and Render will redeploy automatically.

---

## 3. Wait for Redeploy ⏳

After saving environment variables, Render will redeploy your service (takes ~5-10 minutes).

---

## 4. Clear Caches 🧹

Once deployment is complete, clear Laravel caches:

**Option A: Using Render Shell**
1. Go to **Shell** tab in your Render service
2. Run:
```bash
php artisan config:clear
php artisan cache:clear
```

**Option B: Add a Route (Already exists if you have it)**
Visit: `https://your-app.onrender.com/clear-cache` in your browser

---

## 5. Test Email System 🧪

### Test 1: Welcome Email
1. Log into your app
2. Go to Applications page
3. Approve a pending application
4. ✅ Check if student receives welcome email

### Test 2: Password Setup Email
1. Go to Students page
2. Edit a student who has no password
3. Set up their password
4. ✅ Check if student receives password setup email

### Test 3: Manual Student Addition
1. Go to Students page
2. Add a new student (without password)
3. ✅ Check if student receives welcome email

---

## 6. Verify in Logs 📋

**Check Render Logs for:**
```
✅ "Welcome email sent to student"
✅ "Password setup email sent to student"
```

**If you see errors:**
- Check environment variables are correct
- Verify Gmail App Password is active
- See RENDER_DEPLOYMENT_GUIDE.md for troubleshooting

---

## 7. Check Gmail Sent Folder 📬

1. Log into `admiraldavid71@gmail.com`
2. Go to **Sent** folder
3. ✅ Verify emails were sent

---

## Quick Verification Commands

Run these in **Render Shell** to test:

```bash
# Check email configuration is loaded
php artisan tinker --execute="echo config('mail.mailer');"
# Should output: smtp

# Test sending a simple email
php artisan tinker --execute="Mail::raw('Test', function(\$m) { \$m->to('test@example.com')->subject('Test'); }); echo 'Sent!';"
```

---

## Troubleshooting Quick Fixes

### ❌ "Connection refused"
**Fix:** Check `MAIL_HOST` and `MAIL_PORT` in environment variables

### ❌ "Authentication failed"
**Fix:** Verify `MAIL_PASSWORD` is the App Password (with spaces): `wkcd vzyp xlpc qiva`

### ❌ "Class not found"
**Fix:** Run `composer install` and clear caches

### ❌ Emails not arriving
**Check:**
1. Spam/Junk folder
2. Gmail Sent folder (to confirm they were sent)
3. Render logs for errors

---

## Success Checklist ✅

Mark these as you complete them:

- [ ] Code pushed to GitHub successfully
- [ ] Render auto-deployment completed
- [ ] All 8 email environment variables added
- [ ] Render redeployed after adding variables
- [ ] Caches cleared (config & cache)
- [ ] Approved an application → Welcome email received
- [ ] Set up student password → Credentials email received
- [ ] Added student manually → Welcome email received
- [ ] Checked Render logs for success messages
- [ ] Verified emails in Gmail sent folder
- [ ] No errors in Render logs

---

## All Done? 🎉

If all checkboxes are marked, your email system is live and working!

**Next Steps:**
- Monitor logs regularly
- Ask students to check spam folders initially
- Mark emails as "Not Spam" to improve deliverability

---

## Need Help?

1. Read `RENDER_DEPLOYMENT_GUIDE.md` for detailed troubleshooting
2. Check `EMAIL_SETUP_GUIDE.md` for email configuration details
3. Review Render logs for specific error messages
4. Test with a simple raw email first to isolate issues

---

## Environment Variables Copy-Paste

For quick reference, copy these into Render one by one:

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

---

**Good luck! Your email notification system is ready to go live! 🚀**
