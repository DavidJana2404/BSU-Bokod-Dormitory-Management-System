<?php

/**
 * Render.com specific configuration
 * Optimizes Laravel application for Render deployment
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Render Deployment Settings
    |--------------------------------------------------------------------------
    |
    | Configuration settings specifically for Render.com deployments
    | to optimize performance and prevent 502 errors
    |
    */

    'deployment' => [
        'platform' => env('DEPLOYMENT_PLATFORM', 'render'),
        'build_command' => 'composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache && php artisan view:cache',
        'start_command' => 'php artisan serve --host=0.0.0.0 --port=$PORT',
    ],

    'performance' => [
        // Connection timeouts optimized for Render
        'max_execution_time' => env('RENDER_MAX_EXECUTION_TIME', 60),
        'memory_limit' => env('RENDER_MEMORY_LIMIT', '512M'),
        'post_max_size' => env('RENDER_POST_MAX_SIZE', '64M'),
        'upload_max_filesize' => env('RENDER_UPLOAD_MAX_FILESIZE', '64M'),
        
        // Database connection settings
        'db_timeout' => env('RENDER_DB_TIMEOUT', 60),
        'db_max_connections' => env('RENDER_DB_MAX_CONNECTIONS', 10),
        'db_min_connections' => env('RENDER_DB_MIN_CONNECTIONS', 1),
        
        // Cache settings for better performance
        'cache_ttl' => env('RENDER_CACHE_TTL', 300), // 5 minutes
        'query_cache_ttl' => env('RENDER_QUERY_CACHE_TTL', 180), // 3 minutes
        'view_cache_enabled' => env('RENDER_VIEW_CACHE', true),
        'config_cache_enabled' => env('RENDER_CONFIG_CACHE', true),
        'route_cache_enabled' => env('RENDER_ROUTE_CACHE', true),
    ],

    'error_handling' => [
        // Error handling specific to Render deployment
        'log_502_errors' => env('RENDER_LOG_502_ERRORS', true),
        'retry_on_db_error' => env('RENDER_RETRY_DB_ERROR', 3),
        'fallback_responses' => env('RENDER_FALLBACK_RESPONSES', true),
        'graceful_degradation' => env('RENDER_GRACEFUL_DEGRADATION', true),
    ],

    'optimization' => [
        // Query optimization
        'eager_loading' => env('RENDER_EAGER_LOADING', true),
        'chunk_size' => env('RENDER_CHUNK_SIZE', 100),
        'pagination_limit' => env('RENDER_PAGINATION_LIMIT', 50),
        
        // Response optimization
        'gzip_enabled' => env('RENDER_GZIP', true),
        'etag_enabled' => env('RENDER_ETAG', true),
        'browser_cache_ttl' => env('RENDER_BROWSER_CACHE_TTL', 3600),
    ],
];