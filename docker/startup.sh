#!/bin/bash

# Exit on any failure
set -e

echo "Starting Laravel application setup..."

# Create necessary directories
mkdir -p /var/log/supervisor
mkdir -p /run/php

# Wait for database to be ready (with timeout)
echo "Waiting for database connection..."
counter=0
max_attempts=30
until php artisan migrate --force --no-interaction 2>/dev/null || [ $counter -eq $max_attempts ]; do
  echo "Database not ready, waiting... (attempt $counter/$max_attempts)"
  counter=$((counter + 1))
  sleep 10
done

if [ $counter -eq $max_attempts ]; then
    echo "Warning: Database connection timeout, continuing without migrations"
fi

echo "Running Laravel optimizations..."

# Clear any existing cache
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true
php artisan cache:clear || true

# Generate application key if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Cache configurations for better performance
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Create storage link (ignore if already exists)
php artisan storage:link 2>/dev/null || true

echo "Starting web services..."

# Start PHP-FPM in background
php-fpm -D

echo "PHP-FPM started, starting Nginx..."

# Start nginx in foreground (this keeps the container running)
exec nginx -g "daemon off;"
