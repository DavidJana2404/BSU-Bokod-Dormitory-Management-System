#!/bin/bash

# Simple startup script for Render
set -e

echo "🚀 Starting BSU Bokod DMS"
echo "PORT: ${PORT:-10000}"

# Set default port
export PORT=${PORT:-10000}

# Update nginx config with correct port
sed "s/\$PORT/$PORT/g" nginx.conf > /tmp/nginx.conf

# Start PHP-FPM
echo "Starting PHP-FPM..."
php-fpm -D

# Give PHP-FPM time to start
sleep 2

# Start Nginx with our config
echo "Starting Nginx on port $PORT..."
exec nginx -c /tmp/nginx.conf -g "daemon off;"