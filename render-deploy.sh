#!/bin/bash

# Render.com deployment script for Laravel DMS
# This script optimizes the application for production deployment on Render

echo "🚀 Starting Render deployment process..."

# Set environment variables
export APP_ENV=production
export APP_DEBUG=false
export CACHE_DRIVER=file
export SESSION_DRIVER=file
export QUEUE_CONNECTION=database

# Install dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction --verbose

# Create required directories
echo "📁 Creating storage directories..."
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Set proper permissions
echo "🔒 Setting file permissions..."
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/

# Clear any existing cache
echo "🧹 Clearing existing cache..."
php artisan cache:clear 2>/dev/null || true
php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true

# Generate application key if not exists
if [ -z "$APP_KEY" ]; then
    echo "🔑 Generating application key..."
    php artisan key:generate --force
fi

# Run database migrations
echo "🗃️  Running database migrations..."
php artisan migrate --force --no-interaction

# Cache configuration for performance
echo "⚡ Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize for production
echo "🎯 Optimizing for production..."
php artisan optimize

# Test database connection
echo "🔗 Testing database connection..."
php artisan tinker --execute="DB::connection()->getPdo(); echo 'Database connection successful';"

echo "✅ Render deployment completed successfully!"
echo "🌐 Starting web server..."

# Start the web server
php artisan serve --host=0.0.0.0 --port=$PORT