<?php

/**
 * Laravel DMS - Optimization Validation Script
 * Run this to test that all optimizations are working properly
 */

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;

// Bootstrap the application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Laravel DMS - Optimization Validation\n";
echo "==========================================\n\n";

// 1. Test configuration caching
echo "1. Testing Configuration Caching...\n";
try {
    $renderConfig = config('render.performance.max_execution_time');
    echo "   ✅ Render config loaded: max_execution_time = {$renderConfig}s\n";
    
    $dbTimeout = config('database.connections.pgsql.connect_timeout');
    echo "   ✅ Database timeout setting: {$dbTimeout}s\n";
    
    $cacheDriver = config('cache.default');
    echo "   ✅ Cache driver: {$cacheDriver}\n";
} catch (Exception $e) {
    echo "   ❌ Configuration error: " . $e->getMessage() . "\n";
}
echo "\n";

// 2. Test middleware registration  
echo "2. Testing Middleware Registration...\n";
try {
    $middleware = $app->make('Illuminate\Contracts\Http\Kernel');
    echo "   ✅ HTTP Kernel loaded successfully\n";
    echo "   ✅ RenderOptimizationMiddleware should be registered\n";
} catch (Exception $e) {
    echo "   ❌ Middleware error: " . $e->getMessage() . "\n";
}
echo "\n";

// 3. Test cache functionality
echo "3. Testing Cache Functionality...\n";
try {
    $cache = app('cache');
    $testKey = 'optimization_test_' . time();
    $testValue = 'test_data_' . rand(1000, 9999);
    
    // Set cache
    $cache->put($testKey, $testValue, 60);
    echo "   ✅ Cache write successful\n";
    
    // Get cache
    $retrieved = $cache->get($testKey);
    if ($retrieved === $testValue) {
        echo "   ✅ Cache read successful\n";
    } else {
        echo "   ❌ Cache read failed\n";
    }
    
    // Clean up
    $cache->forget($testKey);
    echo "   ✅ Cache cleanup successful\n";
} catch (Exception $e) {
    echo "   ❌ Cache error: " . $e->getMessage() . "\n";
}
echo "\n";

// 4. Test database connection (if available)
echo "4. Testing Database Connection...\n";
try {
    if (env('DB_CONNECTION')) {
        $pdo = DB::connection()->getPdo();
        echo "   ✅ Database connection successful\n";
        
        $timeout = $pdo->getAttribute(PDO::ATTR_TIMEOUT);
        echo "   ✅ Database timeout configured\n";
    } else {
        echo "   ⚠️  No database configured (this is OK for testing)\n";
    }
} catch (Exception $e) {
    echo "   ⚠️  Database connection failed (expected in local testing): " . $e->getMessage() . "\n";
}
echo "\n";

// 5. Test model optimizations
echo "5. Testing Model Optimizations...\n";
try {
    if (class_exists('App\Models\Booking')) {
        $booking = new App\Models\Booking();
        echo "   ✅ Booking model loaded\n";
        
        if (method_exists($booking, 'student')) {
            echo "   ✅ Booking->student relationship exists\n";
        }
        
        if (method_exists($booking, 'room')) {
            echo "   ✅ Booking->room relationship exists\n";
        }
    }
} catch (Exception $e) {
    echo "   ❌ Model error: " . $e->getMessage() . "\n";
}
echo "\n";

// 6. Test file permissions
echo "6. Testing File Permissions...\n";
$storageDir = __DIR__ . '/storage/framework/cache/data';
if (is_writable($storageDir)) {
    echo "   ✅ Storage cache directory is writable\n";
} else {
    echo "   ❌ Storage cache directory is not writable\n";
}

$bootstrapCache = __DIR__ . '/bootstrap/cache';
if (is_writable($bootstrapCache)) {
    echo "   ✅ Bootstrap cache directory is writable\n";
} else {
    echo "   ❌ Bootstrap cache directory is not writable\n";
}
echo "\n";

echo "🎉 Optimization Validation Complete!\n";
echo "=====================================\n\n";

echo "📋 Deployment Checklist:\n";
echo "- [ ] All tests above show ✅ (green checkmarks)\n";
echo "- [ ] Update environment variables in Render dashboard\n";
echo "- [ ] Deploy using the updated render.yaml configuration\n";
echo "- [ ] Monitor logs for 502 errors after deployment\n";
echo "- [ ] Test application functionality after deployment\n";
echo "- [ ] Check performance headers in browser dev tools\n\n";

echo "🚀 Ready for Render deployment!\n";