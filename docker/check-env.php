<?php
/**
 * Environment validation script for Laravel deployment
 */

echo "=== Laravel Environment Check ===\n";

// Check basic environment variables
$required_vars = [
    'APP_NAME',
    'APP_ENV',
    'APP_KEY',
    'DB_CONNECTION',
    'DB_HOST',
    'DB_DATABASE',
    'DB_USERNAME',
    'DB_PASSWORD'
];

$missing_vars = [];
foreach ($required_vars as $var) {
    $value = getenv($var);
    if (empty($value)) {
        $missing_vars[] = $var;
        echo "❌ $var: NOT SET\n";
    } else {
        $display_value = in_array($var, ['APP_KEY', 'DB_PASSWORD']) ? '[HIDDEN]' : $value;
        echo "✅ $var: $display_value\n";
    }
}

// Check PHP extensions
echo "\n=== PHP Extensions Check ===\n";
$required_extensions = ['pdo', 'pdo_pgsql', 'mbstring', 'gd', 'bcmath'];
foreach ($required_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "✅ $ext: loaded\n";
    } else {
        echo "❌ $ext: NOT LOADED\n";
    }
}

// Check file permissions
echo "\n=== File Permissions Check ===\n";
$paths_to_check = [
    '/var/www/html/storage',
    '/var/www/html/bootstrap/cache',
    '/var/www/html/storage/logs',
    '/var/www/html/storage/framework'
];

foreach ($paths_to_check as $path) {
    if (is_writable($path)) {
        echo "✅ $path: writable\n";
    } else {
        echo "❌ $path: NOT WRITABLE\n";
    }
}

// Try database connection if variables are set
if (empty($missing_vars)) {
    echo "\n=== Database Connection Test ===\n";
    try {
        $dsn = sprintf(
            'pgsql:host=%s;port=%s;dbname=%s',
            getenv('DB_HOST'),
            getenv('DB_PORT') ?: '5432',
            getenv('DB_DATABASE')
        );
        
        $pdo = new PDO($dsn, getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
        echo "✅ Database connection: SUCCESS\n";
    } catch (Exception $e) {
        echo "❌ Database connection: FAILED - " . $e->getMessage() . "\n";
    }
} else {
    echo "\n❌ Skipping database test due to missing environment variables\n";
}

echo "\n=== Check Complete ===\n";
if (!empty($missing_vars)) {
    echo "⚠️  Missing required environment variables: " . implode(', ', $missing_vars) . "\n";
    exit(1);
}

echo "✅ Environment check passed!\n";
exit(0);