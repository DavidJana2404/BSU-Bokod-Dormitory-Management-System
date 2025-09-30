#!/usr/bin/env bash

# Start PHP-FPM in the background
php-fpm -D

# Start Nginx in the foreground
nginx -c /opt/render/project/src/nginx.conf