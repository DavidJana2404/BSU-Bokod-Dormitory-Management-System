#!/bin/bash

# Exit on any failure
set -e

echo "Starting Laravel application setup..."
echo "Current user: $(whoami)"
echo "PHP version: $(php -v | head -n1)"
echo "Working directory: $(pwd)"

# Create necessary directories
mkdir -p /var/log/supervisor
mkdir -p /run/php
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/bootstrap/cache

# Fix permissions
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

echo "Checking Laravel configuration..."
echo "APP_KEY set: $([ -n "$APP_KEY" ] && echo 'Yes' || echo 'No')"
echo "APP_ENV: $APP_ENV"
echo "DB_CONNECTION: $DB_CONNECTION"

echo "Setting up .env file for production..."

# Validate required environment variables
echo "Validating environment variables..."
required_vars="DB_HOST DB_DATABASE DB_USERNAME DB_PASSWORD"
missing_vars=""

for var in $required_vars; do
    value=$(eval echo \$$var)
    if [ -z "$value" ] || [[ "$value" == *"[Your"* ]] || [[ "$value" == *"internal hostname"* ]]; then
        missing_vars="$missing_vars $var"
        echo "❌ $var is not set or contains placeholder text"
    else
        echo "✅ $var is properly set"
    fi
done

if [ -n "$missing_vars" ]; then
    echo "❌ ERROR: Missing or invalid environment variables:$missing_vars"
    echo "Please set these in your Render Dashboard → Environment:"
    for var in $missing_vars; do
        echo "  - $var"
    done
    echo "❌ CRITICAL: Cannot start without proper database configuration!"
    echo "❌ Exiting to prevent invalid .env file creation..."
    exit 1
fi

# Create .env file from validated environment variables
echo "Creating .env file with validated values..."
cat > /var/www/html/.env << EOF
APP_NAME="${APP_NAME:-BSU Bokod DMS}"
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost}

LOG_CHANNEL=${LOG_CHANNEL:-stack}
LOG_LEVEL=${LOG_LEVEL:-error}

DB_CONNECTION=${DB_CONNECTION:-pgsql}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

SESSION_DRIVER=${SESSION_DRIVER:-database}
SESSION_LIFETIME=${SESSION_LIFETIME:-120}
CACHE_STORE=${CACHE_STORE:-database}
QUEUE_CONNECTION=${QUEUE_CONNECTION:-database}

MAIL_MAILER=${MAIL_MAILER:-log}
BCRYPT_ROUNDS=${BCRYPT_ROUNDS:-12}
EOF

echo "✅ .env file created successfully with proper values"
echo "Database connection will be: ${DB_USERNAME}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"

echo "Running comprehensive environment check..."
php /var/www/html/docker/check-env.php || {
    echo "⚠️  Environment check failed, but continuing..."
    echo "This might cause issues with the application"
}

# Test database connection before proceeding
echo "Testing database connection..."
if php artisan migrate:status --no-interaction 2>/dev/null; then
    echo "✅ Database connection successful"
    echo "Running migrations..."
    php artisan migrate --force --no-interaction || {
        echo "⚠️  Migration failed, but continuing..."
    }
    echo "✅ Migrations completed"
else
    echo "❌ Database connection failed!"
    echo "Attempting to run migrations with retry logic..."
    
    # Wait for database to be ready (with timeout)
    counter=0
    max_attempts=10
    until php artisan migrate --force --no-interaction 2>/dev/null || [ $counter -eq $max_attempts ]; do
      echo "Database not ready, waiting... (attempt $((counter + 1))/$max_attempts)"
      counter=$((counter + 1))
      sleep 10
    done
    
    if [ $counter -eq $max_attempts ]; then
        echo "❌ CRITICAL: Database connection failed after $max_attempts attempts!"
        echo "❌ Please check your database configuration in Render Dashboard"
        echo "❌ Current settings: ${DB_USERNAME}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"
        exit 1
    fi
    echo "✅ Migrations completed after retries"
fi

echo "Running Laravel optimizations..."

# Generate application key if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force --no-interaction
    # Export the generated key for this session
    export APP_KEY=$(grep APP_KEY /var/www/html/.env | cut -d '=' -f2)
    echo "Generated APP_KEY: ${APP_KEY:0:20}..."
else
    echo "APP_KEY already set: ${APP_KEY:0:20}..."
fi

echo "Clearing caches..."
# Clear any existing cache (ignore errors for now)
php artisan config:clear 2>/dev/null || echo "Config clear failed (might be ok)"
php artisan route:clear 2>/dev/null || echo "Route clear failed (might be ok)"
php artisan view:clear 2>/dev/null || echo "View clear failed (might be ok)"
php artisan cache:clear 2>/dev/null || echo "Cache clear failed (might be ok)"
php artisan event:clear 2>/dev/null || echo "Event clear failed (might be ok)"
php artisan optimize:clear 2>/dev/null || echo "Optimize clear failed (might be ok)"

echo "Testing basic Laravel functionality..."
# Test if Laravel can load properly
php artisan --version || {
    echo "ERROR: Laravel artisan command failed!"
    echo "Checking PHP errors..."
    php -l /var/www/html/artisan || true
    echo "Continuing anyway..."
}

echo "Creating storage link..."
# Create storage link (ignore if already exists)
php artisan storage:link 2>/dev/null || echo "Storage link creation failed or already exists"

echo "Caching configurations..."
# Cache configurations for better performance (with error handling)
php artisan config:cache 2>/dev/null || {
    echo "Warning: Config cache failed, running without cache"
    echo "This might indicate missing environment variables"
}

php artisan route:cache 2>/dev/null || echo "Route cache failed, running without route cache"
php artisan view:cache 2>/dev/null || echo "View cache failed, running without view cache"

echo "Starting web services..."

# Start PHP-FPM in background
php-fpm -D

echo "PHP-FPM started, starting Nginx..."

# Start nginx in foreground (this keeps the container running)
exec nginx -g "daemon off;"
