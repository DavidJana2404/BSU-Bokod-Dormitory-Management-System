<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class RenderOptimizationMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Set optimizations for Render deployment
        $this->setRenderOptimizations();
        
        // Set timeout for database operations
        $this->configureDatabase();
        
        // Log request start for monitoring
        $startTime = microtime(true);
        $startMemory = memory_get_usage(true);
        
        // Handle the request
        try {
            $response = $next($request);
            
            // Add performance headers
            $this->addPerformanceHeaders($response, $startTime, $startMemory);
            
            // Add caching headers for static content
            $this->addCachingHeaders($response, $request);
            
            return $response;
            
        } catch (\Exception $e) {
            // Log 502 errors specifically
            if ($this->is502Error($e)) {
                Log::emergency('502 Gateway Timeout detected', [
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'user_id' => $request->user()?->id,
                    'error' => $e->getMessage(),
                    'execution_time' => microtime(true) - $startTime,
                    'memory_usage' => memory_get_usage(true) - $startMemory,
                    'trace' => $e->getTraceAsString()
                ]);
                
                // Try to return a graceful error response
                if ($request->expectsJson() || $request->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Request timeout. Please try again.',
                        'error_code' => 'GATEWAY_TIMEOUT'
                    ], 503);
                }
                
                // For web requests, try to redirect back with error
                return back()->withErrors([
                    'error' => 'Request took too long to process. Please try again.'
                ])->withInput();
            }
            
            // Re-throw other exceptions
            throw $e;
        }
    }

    /**
     * Set Render-specific optimizations
     */
    private function setRenderOptimizations(): void
    {
        // Set execution time limit
        $maxExecutionTime = config('render.performance.max_execution_time', 60);
        set_time_limit($maxExecutionTime);
        
        // Set memory limit if needed
        $memoryLimit = config('render.performance.memory_limit', '512M');
        if (ini_get('memory_limit') !== $memoryLimit) {
            ini_set('memory_limit', $memoryLimit);
        }
        
        // Enable output compression
        if (config('render.optimization.gzip_enabled', true) && !ob_get_level()) {
            if (extension_loaded('zlib')) {
                ob_start('ob_gzhandler');
            } else {
                ob_start();
            }
        }
    }

    /**
     * Configure database for Render deployment
     */
    private function configureDatabase(): void
    {
        try {
            // Set database timeout
            $timeout = config('render.performance.db_timeout', 60);
            DB::connection()->getPdo()->setAttribute(\PDO::ATTR_TIMEOUT, $timeout);
            
            // Test connection
            DB::connection()->getPdo();
            
        } catch (\Exception $e) {
            Log::error('Database configuration failed in RenderOptimization middleware', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Add performance monitoring headers
     */
    private function addPerformanceHeaders(Response $response, float $startTime, int $startMemory): void
    {
        $executionTime = round((microtime(true) - $startTime) * 1000, 2); // in milliseconds
        $memoryUsage = round((memory_get_usage(true) - $startMemory) / 1024 / 1024, 2); // in MB
        $peakMemory = round(memory_get_peak_usage(true) / 1024 / 1024, 2); // in MB
        
        $response->headers->set('X-Execution-Time', $executionTime . 'ms');
        $response->headers->set('X-Memory-Usage', $memoryUsage . 'MB');
        $response->headers->set('X-Peak-Memory', $peakMemory . 'MB');
        $response->headers->set('X-Render-Optimized', 'true');
        
        // Log slow requests
        if ($executionTime > 5000) { // 5 seconds
            Log::warning('Slow request detected', [
                'execution_time' => $executionTime . 'ms',
                'memory_usage' => $memoryUsage . 'MB',
                'url' => request()->fullUrl(),
                'method' => request()->method()
            ]);
        }
    }

    /**
     * Add appropriate caching headers
     */
    private function addCachingHeaders(Response $response, Request $request): void
    {
        // Cache static content aggressively
        if ($this->isStaticContent($request)) {
            $ttl = config('render.optimization.browser_cache_ttl', 3600);
            $response->headers->set('Cache-Control', "public, max-age={$ttl}");
            $response->headers->set('Expires', gmdate('D, d M Y H:i:s', time() + $ttl) . ' GMT');
            
            // Add ETag if enabled
            if (config('render.optimization.etag_enabled', true)) {
                $etag = md5($response->getContent());
                $response->headers->set('ETag', '"' . $etag . '"');
                
                // Check if client has cached version
                if ($request->header('If-None-Match') === '"' . $etag . '"') {
                    $response->setStatusCode(304);
                    $response->setContent('');
                }
            }
        }
        
        // Add no-cache headers for dynamic content
        else if ($this->isDynamicContent($request)) {
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', '0');
        }
        
        // Special handling for applications route to prevent caching issues
        if ($request->is('applications') || $request->is('applications/*')) {
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', '0');
        }
    }

    /**
     * Check if this is a 502 error
     */
    private function is502Error(\Exception $e): bool
    {
        // Check for common 502 error indicators
        $message = strtolower($e->getMessage());
        
        return str_contains($message, 'gateway') ||
               str_contains($message, 'timeout') ||
               str_contains($message, 'connection') ||
               str_contains($message, 'upstream') ||
               $e instanceof \Symfony\Component\Process\Exception\ProcessTimedOutException;
    }

    /**
     * Check if request is for static content
     */
    private function isStaticContent(Request $request): bool
    {
        $path = $request->path();
        return str_contains($path, '/css/') ||
               str_contains($path, '/js/') ||
               str_contains($path, '/images/') ||
               str_contains($path, '/fonts/') ||
               preg_match('/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$/i', $path);
    }

    /**
     * Check if request is for dynamic content that shouldn't be cached
     */
    private function isDynamicContent(Request $request): bool
    {
        $path = $request->path();
        return str_contains($path, '/api/') ||
               str_contains($path, '/bookings') ||
               str_contains($path, '/students') ||
               str_contains($path, '/applications') ||
               $request->method() !== 'GET';
    }
}