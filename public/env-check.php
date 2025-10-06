<?php
/**
 * Environment Check Script for Render Deployment
 * Visit this page to check your environment variables
 */

// Only show in development or when specifically requested
if (!in_array(env('APP_ENV'), ['local', 'staging']) && !isset($_GET['force'])) {
    die('Environment check not available in production. Add ?force=1 to override.');
}

header('Content-Type: text/plain');

echo "=== Environment Variables Check ===\n\n";

echo "App Environment: " . (getenv('APP_ENV') ?: 'not set') . "\n";
echo "App URL: " . (getenv('APP_URL') ?: 'not set') . "\n\n";

echo "Database Configuration:\n";
echo "- DATABASE_URL: " . (getenv('DATABASE_URL') ? 'SET (length: ' . strlen(getenv('DATABASE_URL')) . ')' : 'NOT SET') . "\n";
echo "- DB_CONNECTION: " . (getenv('DB_CONNECTION') ?: 'not set') . "\n";
echo "- DB_HOST: " . (getenv('DB_HOST') ?: 'not set') . "\n";
echo "- DB_PORT: " . (getenv('DB_PORT') ?: 'not set') . "\n";
echo "- DB_DATABASE: " . (getenv('DB_DATABASE') ?: 'not set') . "\n";
echo "- DB_USERNAME: " . (getenv('DB_USERNAME') ?: 'not set') . "\n";
echo "- DB_PASSWORD: " . (getenv('DB_PASSWORD') ? 'SET' : 'NOT SET') . "\n\n";

if (getenv('DATABASE_URL')) {
    echo "Parsing DATABASE_URL:\n";
    $url = parse_url(getenv('DATABASE_URL'));
    if ($url) {
        echo "- Scheme: " . ($url['scheme'] ?? 'not set') . "\n";
        echo "- Host: " . ($url['host'] ?? 'not set') . "\n";
        echo "- Port: " . ($url['port'] ?? 'default') . "\n";
        echo "- User: " . ($url['user'] ?? 'not set') . "\n";
        echo "- Password: " . (isset($url['pass']) ? 'SET' : 'NOT SET') . "\n";
        echo "- Database: " . (isset($url['path']) ? ltrim($url['path'], '/') : 'not set') . "\n";
    } else {
        echo "- ERROR: Could not parse DATABASE_URL\n";
    }
} else {
    echo "DATABASE_URL not available\n";
}

echo "\n=== PHP Configuration ===\n";
echo "PHP Version: " . phpversion() . "\n";
echo "PDO PostgreSQL: " . (extension_loaded('pdo_pgsql') ? 'AVAILABLE' : 'NOT AVAILABLE') . "\n";
echo "OpenSSL: " . (extension_loaded('openssl') ? 'AVAILABLE' : 'NOT AVAILABLE') . "\n";

echo "\n=== Network Test ===\n";
if (getenv('DATABASE_URL')) {
    $url = parse_url(getenv('DATABASE_URL'));
    if ($url && isset($url['host'])) {
        $host = $url['host'];
        $port = $url['port'] ?? 5432;
        
        echo "Testing connection to: $host:$port\n";
        
        // DNS resolution test
        $ip = gethostbyname($host);
        if ($ip !== $host) {
            echo "- DNS Resolution: SUCCESS ($ip)\n";
        } else {
            echo "- DNS Resolution: FAILED\n";
        }
        
        // Port connectivity test
        $connection = @fsockopen($host, $port, $errno, $errstr, 10);
        if ($connection) {
            echo "- Port Connection: SUCCESS\n";
            fclose($connection);
        } else {
            echo "- Port Connection: FAILED ($errno: $errstr)\n";
        }
    }
}

echo "\n=== Check Complete ===\n";
?>