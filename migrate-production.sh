#!/usr/bin/env bash
# Manual migration runner for production (Render)
# Run this via Render shell if auto-migration fails

echo "🗃️  Running database migrations on production..."

# Run migrations with force flag (no interaction)
php artisan migrate --force

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
    echo "📊 Checking database tables..."
    php artisan tinker --execute="echo 'payment_records table exists: ' . (Schema::hasTable('payment_records') ? 'YES' : 'NO');"
else
    echo "❌ Migration failed!"
    exit 1
fi
