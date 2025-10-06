#!/usr/bin/env bash
# exit on error
set -o errexit

echo "=== Starting Build Process ==="

# Install PHP dependencies
echo "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies and build assets
echo "Installing Node.js dependencies and building assets..."
npm ci
npm run build

# Clear and cache Laravel configurations
echo "Clearing Laravel caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Generate optimized autoloader
echo "Optimizing autoloader..."
composer dump-autoloader --optimize

# Cache Laravel configurations for production
echo "Caching Laravel configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "=== Environment Check ==="
echo "✅ Environment check passed!"

# Test database connection before migrations
echo "Testing database connection..."
if ! php artisan tinker --execute="DB::connection()->getPdo(); echo 'Database connection successful';"; then
    echo "❌ Database connection failed!"
    echo "Attempting to run migrations..."
fi

# Run database migrations with retry logic
echo "Running database migrations..."
for i in {1..10}; do
    if php artisan migrate --force; then
        echo "✅ Migrations completed successfully!"
        break
    else
        echo "Database not ready, waiting... (attempt $i/10)"
        sleep 5
    fi
done

# Create symbolic link for storage if it doesn't exist
echo "Creating storage link..."
php artisan storage:link

echo "=== Build Complete ==="
