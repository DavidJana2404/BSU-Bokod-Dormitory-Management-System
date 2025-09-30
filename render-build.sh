#!/usr/bin/env bash
# exit on error
set -o errexit

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies and build assets
npm ci
npm run build

# Clear and cache Laravel configurations
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Generate optimized autoloader
composer dump-autoload --optimize

# Cache Laravel configurations for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
php artisan migrate --force

# Create symbolic link for storage if it doesn't exist
php artisan storage:link