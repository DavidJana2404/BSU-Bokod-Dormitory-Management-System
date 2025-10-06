#!/bin/bash

# Exit on any error
set -e

echo "=== BSU Bokod DMS Startup ==="
echo "Environment: $(env | grep PORT || echo 'PORT not set')"
echo "Working directory: $(pwd)"
echo "User: $(whoami)"

# Set default port if not provided by Render
export PORT=${PORT:-10000}

echo "✅ Using port: $PORT"

# Check if we're in the right directory
if [ ! -f "nginx.conf" ]; then
    echo "❌ ERROR: nginx.conf not found in current directory"
    ls -la
    exit 1
fi

# Substitute PORT in nginx configuration
echo "📝 Updating Nginx configuration..."
envsubst '${PORT}' < nginx.conf > /tmp/nginx.conf

echo "📋 Nginx config content:"
head -30 /tmp/nginx.conf

# Copy to nginx directory if we have permissions
if [ -w "/etc/nginx/" ]; then
    cp /tmp/nginx.conf /etc/nginx/nginx.conf
    echo "✅ Nginx configuration copied to /etc/nginx/nginx.conf"
else
    echo "⚠️  No write permission to /etc/nginx, using local config"
    export NGINX_CONFIG="/tmp/nginx.conf"
fi

# Test nginx configuration
echo "🔍 Testing Nginx configuration..."
if command -v nginx >/dev/null 2>&1; then
    nginx -t -c ${NGINX_CONFIG:-/etc/nginx/nginx.conf} || {
        echo "❌ Nginx configuration test failed"
        exit 1
    }
    echo "✅ Nginx configuration is valid"
else
    echo "⚠️  Nginx not found in PATH"
fi

# Start PHP-FPM in the background
echo "🚀 Starting PHP-FPM..."
if command -v php-fpm >/dev/null 2>&1; then
    # Try to start PHP-FPM with our config if it exists
    if [ -f "php-fpm.conf" ]; then
        php-fpm -D -y php-fpm.conf
    else
        php-fpm -D
    fi
    
    # Wait a moment for PHP-FPM to start
    sleep 3
    
    # Check if PHP-FPM is running
    if pgrep -f php-fpm > /dev/null; then
        echo "✅ PHP-FPM started successfully"
    else
        echo "❌ PHP-FPM failed to start"
        echo "Attempting to start PHP-FPM in foreground for debugging..."
        php-fpm -F &
        sleep 2
    fi
else
    echo "❌ PHP-FPM not found"
    exit 1
fi

# Start Nginx
echo "🌐 Starting Nginx on port $PORT..."
if command -v nginx >/dev/null 2>&1; then
    exec nginx -g "daemon off;" -c ${NGINX_CONFIG:-/etc/nginx/nginx.conf}
else
    echo "❌ Nginx command not found"
    echo "Falling back to PHP built-in server..."
    cd public
    exec php -S 0.0.0.0:$PORT
fi
