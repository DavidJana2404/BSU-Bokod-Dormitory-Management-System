# Quick Fix: Payment Records Table Error

## Problem
Error when accessing **Cashier → Records** page:
```
SQLSTATE[42P01]: Undefined table: 7 ERROR: relation "payment_records" does not exist
```

## Root Cause
The `payment_records` table migration hasn't run on production yet.

## Solution (Choose One)

### ✅ Option 1: Wait for Auto-Deployment (Easiest)
The latest code push will trigger automatic deployment on Render. Wait 5-10 minutes for:
1. Deployment to complete
2. `render-build.sh` to run migrations automatically
3. The error should disappear

### ✅ Option 2: Manual Migration via Render Shell (Fastest)
1. Go to https://dashboard.render.com
2. Select your **BSU Bokod DMS** service
3. Click **Shell** tab
4. Run this command:
   ```bash
   php artisan migrate --force
   ```
5. Refresh your browser

### ✅ Option 3: Force Redeploy
1. Go to Render Dashboard
2. Select your service
3. Click **Manual Deploy** → **Deploy latest commit**
4. Wait for deployment to complete

## What Was Fixed

### 1. Error Handling Added
- Controller now checks if `payment_records` table exists
- Shows friendly error message instead of crashing
- Prevents 500 errors until migration runs

### 2. Migration File
- Location: `database/migrations/2025_10_23_133324_create_payment_records_table.php`
- Already committed and pushed to GitHub
- Will run automatically on next Render deployment

### 3. Helper Scripts
- `migrate-production.sh` - Manual migration runner
- `MANUAL_MIGRATION.md` - Detailed migration instructions

## Verification Steps

After migration completes:
1. Go to your site: https://bsu-bokod-dormitory-management-system-tjqi.onrender.com
2. Login as cashier
3. Click **Records** in the sidebar
4. Should see empty records list (no error)

## Current Status

✅ Code deployed with error handling  
⏳ Waiting for Render to run migration automatically  
📝 Manual migration option available if needed  

## Need Immediate Fix?

Follow **Option 2** above to manually run the migration right now.
