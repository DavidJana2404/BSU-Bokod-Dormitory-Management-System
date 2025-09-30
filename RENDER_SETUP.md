# Render Deployment Setup Guide

## Required Environment Variables

You need to set these environment variables in your Render Dashboard:

### 1. Go to Render Dashboard
1. Navigate to your `bsu-bokod-dms` web service
2. Go to **Environment** tab
3. Add each variable below

### 2. Required Database Variables

**First, create a PostgreSQL database in Render:**
- Click "New +" → "PostgreSQL"
- Name: `bsu-bokod-dms-db`
- Plan: Free or Starter
- Copy the connection details after creation

**Then set these variables in your web service:**

```bash
# Database Connection (Replace with your actual PostgreSQL values)
DB_CONNECTION=pgsql
DB_HOST=[Internal hostname from your PostgreSQL dashboard]
DB_PORT=5432
DB_DATABASE=[Database name from your PostgreSQL dashboard]
DB_USERNAME=[Username from your PostgreSQL dashboard]
DB_PASSWORD=[Password from your PostgreSQL dashboard]
```

### 3. Application Variables

```bash
# Application Settings
APP_NAME=BSU Bokod DMS
APP_ENV=production
APP_KEY=base64:9TUzCnpBnR0J5soEvNfUoy/CHP/VpsKzR7JjxzBTuos=
APP_DEBUG=false
APP_URL=https://bsu-bokod-dms.onrender.com

# Other Settings
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
MAIL_MAILER=log
LOG_CHANNEL=stack
LOG_LEVEL=error
BCRYPT_ROUNDS=12
```

## How to Get Database Values

1. **In Render Dashboard, go to your PostgreSQL database**
2. **Copy the connection details:**
   - **Internal Database URL** contains all the info
   - Format: `postgresql://username:password@hostname:port/database`
   - Extract each part for the environment variables

## Example Database Setup

If your PostgreSQL internal URL is:
```
postgresql://dms_user:abc123@dpg-xyz123:5432/dms_production
```

Set these variables:
```bash
DB_HOST=dpg-xyz123
DB_DATABASE=dms_production
DB_USERNAME=dms_user
DB_PASSWORD=abc123
```

## Troubleshooting

- **Invalid .env file errors**: Make sure no placeholders like `[Your database...]` are in the environment variables
- **Database connection errors**: Verify all database variables are correctly copied from your PostgreSQL instance
- **500 errors**: Check the deployment logs for specific error messages

## Testing Your Deployment

After setting environment variables:
1. Deploy your service (Manual Deploy)
2. Visit: `https://bsu-bokod-dms.onrender.com/health`
3. Check: `https://bsu-bokod-dms.onrender.com/debug-info`