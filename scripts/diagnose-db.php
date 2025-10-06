<?php
/**
 * Database Connection Diagnostic Script
 * Run this to diagnose database connection issues
 */

echo "=== Database Connection Diagnostics ===\n\n";

// Check if we're in a Laravel environment
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
    
    // Load Laravel if available
    if (file_exists(__DIR__ . '/../bootstrap/app.php')) {
        $app = require_once __DIR__ . '/../bootstrap/app.php';
        $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    }
}

echo "Environment Variables:\n";
echo "- DB_CONNECTION: " . (getenv('DB_CONNECTION') ?: 'not set') . "\n";
echo "- DB_HOST: " . (getenv('DB_HOST') ?: 'not set') . "\n";
echo "- DB_PORT: " . (getenv('DB_PORT') ?: 'not set') . "\n";
echo "- DB_DATABASE: " . (getenv('DB_DATABASE') ?: 'not set') . "\n";
echo "- DB_USERNAME: " . (getenv('DB_USERNAME') ?: 'not set') . "\n";
echo "- DB_PASSWORD: " . (getenv('DB_PASSWORD') ? 'set' : 'not set') . "\n";
echo "- DATABASE_URL: " . (getenv('DATABASE_URL') ? 'set' : 'not set') . "\n\n";

// Check if DATABASE_URL exists and parse it
if (getenv('DATABASE_URL')) {
    echo "Parsing DATABASE_URL:\n";
    $url = parse_url(getenv('DATABASE_URL'));
    echo "- Scheme: " . ($url['scheme'] ?? 'not set') . "\n";
    echo "- Host: " . ($url['host'] ?? 'not set') . "\n";
    echo "- Port: " . ($url['port'] ?? 'not set') . "\n";
    echo "- User: " . ($url['user'] ?? 'not set') . "\n";
    echo "- Password: " . (isset($url['pass']) ? 'set' : 'not set') . "\n";
    echo "- Path/Database: " . (isset($url['path']) ? ltrim($url['path'], '/') : 'not set') . "\n\n";
}

// Test basic network connectivity
echo "Testing network connectivity:\n";
$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: '5432';

echo "- Host: $host\n";
echo "- Port: $port\n";

// Try to resolve hostname
$ip = gethostbyname($host);
if ($ip !== $host) {
    echo "- DNS Resolution: SUCCESS ($ip)\n";
} else {
    echo "- DNS Resolution: FAILED (could not resolve $host)\n";
}

// Try to connect to the port
$connection = @fsockopen($host, $port, $errno, $errstr, 5);
if ($connection) {
    echo "- Port Connection: SUCCESS\n";
    fclose($connection);
} else {
    echo "- Port Connection: FAILED ($errno: $errstr)\n";
}

echo "\n=== Diagnostics Complete ===\n";