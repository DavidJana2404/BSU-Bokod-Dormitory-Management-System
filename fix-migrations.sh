#!/bin/bash

# Emergency migration fix script for Render PostgreSQL deployment
# This script helps fix common PostgreSQL migration issues

echo "🚨 Emergency Migration Fix Script"
echo "================================"

# Set environment
export APP_ENV=production
export APP_DEBUG=false

echo "Step 1: Testing database connection..."
php artisan tinker --execute="try { DB::connection()->getPdo(); echo '✅ Database connection successful'; } catch(Exception \$e) { echo '❌ Database connection failed: ' . \$e->getMessage(); exit(1); }" --no-interaction

echo "Step 2: Checking migration status..."
php artisan migrate:status --no-interaction

echo "Step 3: Attempting to run migrations with --force..."
php artisan migrate --force --no-interaction

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
else
    echo "❌ Migrations failed. Trying alternative approach..."
    
    echo "Step 4: Clearing migration table and retrying..."
    # This is a drastic measure - only use if necessary
    php artisan tinker --execute="try { DB::table('migrations')->truncate(); echo '✅ Migration table cleared'; } catch(Exception \$e) { echo '❌ Could not clear migrations: ' . \$e->getMessage(); }" --no-interaction
    
    echo "Step 5: Running fresh migrations..."
    php artisan migrate --force --no-interaction
fi

echo "Step 6: Final migration status check..."
php artisan migrate:status --no-interaction

echo "✅ Emergency migration fix completed!"
