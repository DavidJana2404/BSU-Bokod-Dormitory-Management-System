# Use official PHP runtime with Apache
FROM php:8.3-fpm

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    nginx \
    nodejs \
    npm \
    supervisor \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_pgsql pgsql mbstring exif pcntl bcmath gd opcache \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Install Node.js dependencies and build assets
RUN npm ci --only=production
RUN npm run build

# Verify build output
RUN ls -la public/build/ || echo "Build directory not found - checking for assets..."
RUN find public/ -name "*.js" -o -name "*.css" | head -10 || echo "No JS/CSS files found"

# Create Laravel directories and set permissions
RUN mkdir -p /var/www/html/storage/framework/{cache,sessions,views} \
    && mkdir -p /var/www/html/storage/logs \
    && mkdir -p /var/www/html/storage/app \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Copy PHP configurations
COPY docker/php.ini /usr/local/etc/php/php.ini
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

# Create necessary directories
RUN mkdir -p /run/php /var/log/supervisor

# Copy startup script
COPY docker/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

# Expose port 10000 (Render requirement)
EXPOSE 10000

# Start with our custom startup script
CMD ["/usr/local/bin/startup.sh"]
