<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DebugErrorMiddleware
{
    /**
     * Handle an incoming request and catch all errors to show detailed debugging info
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $response = $next($request);
            
            // Check if the response might cause a 502 error
            if ($this->mightCause502($request, $response)) {
                Log::warning('Potential 502 error detected', [
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'status_code' => $response->getStatusCode(),
                    'content_type' => $response->headers->get('Content-Type'),
                    'is_inertia_request' => $request->header('X-Inertia') ? 'yes' : 'no',
                    'expects_json' => $request->expectsJson() ? 'yes' : 'no',
                    'user_id' => $request->user()?->id ?? 'guest'
                ]);
            }
            
            return $response;
            
        } catch (\Throwable $e) {
            // Log the full error details
            Log::error('Error caught by DebugErrorMiddleware', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'error_type' => get_class($e),
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'user_id' => $request->user()?->id ?? 'guest',
                'stack_trace' => $e->getTraceAsString()
            ]);
            
            // Return a detailed error page instead of letting it become a 502
            return $this->renderErrorPage($request, $e);
        }
    }
    
    /**
     * Check if a response might cause a 502 error
     */
    private function mightCause502(Request $request, Response $response): bool
    {
        // Browser GET request that got JSON response (common 502 cause)
        if ($request->isMethod('GET') && 
            !$request->expectsJson() && 
            !$request->header('X-Inertia') &&
            $response->headers->get('Content-Type') && 
            str_contains($response->headers->get('Content-Type'), 'application/json')) {
            return true;
        }
        
        // 5xx status codes
        if ($response->getStatusCode() >= 500) {
            return true;
        }
        
        // Empty or malformed responses
        if (empty($response->getContent()) && $response->getStatusCode() === 200) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Render a detailed error page showing what went wrong
     */
    private function renderErrorPage(Request $request, \Throwable $e): Response
    {
        // Prepare error details
        $errorDetails = [
            'error_type' => get_class($e),
            'error_message' => $e->getMessage(),
            'error_file' => str_replace(base_path(), '', $e->getFile()),
            'error_line' => $e->getLine(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'timestamp' => now()->toDateTimeString(),
            'user_id' => $request->user()?->id ?? 'Not logged in',
            'is_inertia_request' => $request->header('X-Inertia') ? 'Yes' : 'No',
            'expects_json' => $request->expectsJson() ? 'Yes' : 'No',
        ];
        
        // Add stack trace for development (first 10 lines to avoid overwhelming)
        $stackTrace = collect(explode("\n", $e->getTraceAsString()))
            ->take(15)
            ->map(function ($line, $index) {
                return sprintf("#%d %s", $index, trim($line));
            })
            ->join("\n");
        
        $errorDetails['stack_trace'] = $stackTrace;
        
        // For Inertia requests or if it's a page route, render an Inertia error page
        if ($request->header('X-Inertia') || $this->isPageRoute($request)) {
            try {
                return Inertia::render('errors/debug', [
                    'error' => $errorDetails,
                    'suggestions' => $this->getErrorSuggestions($e, $request)
                ])->toResponse($request);
            } catch (\Throwable $inertiaError) {
                // If Inertia fails, fall back to HTML
                return $this->renderHtmlErrorPage($errorDetails, $inertiaError);
            }
        }
        
        // For API requests, return JSON
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Application Error',
                'details' => $errorDetails,
                'suggestions' => $this->getErrorSuggestions($e, $request)
            ], 500);
        }
        
        // Default HTML error page
        return $this->renderHtmlErrorPage($errorDetails);
    }
    
    /**
     * Check if this is a page route (not API)
     */
    private function isPageRoute(Request $request): bool
    {
        $path = $request->path();
        
        // These are definitely page routes
        $pageRoutes = [
            'dashboard', 'applications', 'rooms', 'students', 'bookings', 
            'cleaning-schedules', 'assign-manager', 'dormitories', 'settings'
        ];
        
        foreach ($pageRoutes as $route) {
            if (str_starts_with($path, $route)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get suggestions based on the error type
     */
    private function getErrorSuggestions(\Throwable $e, Request $request): array
    {
        $suggestions = [];
        
        $errorMessage = strtolower($e->getMessage());
        
        if (str_contains($errorMessage, 'database') || str_contains($errorMessage, 'connection')) {
            $suggestions[] = 'Database connection issue detected. Check if the database server is running.';
            $suggestions[] = 'Verify database credentials in .env file.';
        }
        
        if (str_contains($errorMessage, 'class') && str_contains($errorMessage, 'not found')) {
            $suggestions[] = 'Class not found error. Try running: composer dump-autoload';
            $suggestions[] = 'Check if the namespace is correct.';
        }
        
        if (str_contains($errorMessage, 'memory') || str_contains($errorMessage, 'limit')) {
            $suggestions[] = 'Memory limit exceeded. Try increasing PHP memory_limit.';
        }
        
        if (str_contains($errorMessage, 'timeout')) {
            $suggestions[] = 'Request timeout. The operation took too long to complete.';
            $suggestions[] = 'Try optimizing database queries or increasing timeout limits.';
        }
        
        if (get_class($e) === 'Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException') {
            $suggestions[] = 'Wrong HTTP method used. Check if you\'re using GET, POST, PUT, DELETE correctly.';
        }
        
        if (empty($suggestions)) {
            $suggestions[] = 'Try clearing cache: php artisan cache:clear';
            $suggestions[] = 'Check the Laravel logs for more details.';
            $suggestions[] = 'If this persists, contact the system administrator.';
        }
        
        return $suggestions;
    }
    
    /**
     * Render an HTML error page as fallback
     */
    private function renderHtmlErrorPage(array $errorDetails, \Throwable $inertiaError = null): Response
    {
        $html = '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Error - BSU Bokod DMS</title>
    <style>
        body { 
            font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; 
            background: #1e1e2e; 
            color: #cdd6f4; 
            margin: 0; 
            padding: 20px; 
            line-height: 1.6;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: #313244; 
            border-radius: 8px; 
            padding: 30px; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        .header { 
            border-bottom: 2px solid #f38ba8; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .error-title { 
            color: #f38ba8; 
            font-size: 24px; 
            font-weight: bold; 
            margin: 0;
        }
        .error-subtitle { 
            color: #94e2d5; 
            margin: 5px 0 0 0; 
        }
        .section { 
            margin: 25px 0; 
            padding: 20px; 
            background: #45475a; 
            border-radius: 6px;
            border-left: 4px solid #89b4fa;
        }
        .section h3 { 
            color: #89b4fa; 
            margin-top: 0; 
            font-size: 16px;
        }
        .key-value { 
            display: grid; 
            grid-template-columns: 150px 1fr; 
            gap: 10px; 
            margin: 10px 0;
        }
        .key { 
            color: #fab387; 
            font-weight: bold; 
        }
        .value { 
            color: #cdd6f4; 
            word-break: break-word;
        }
        .stack-trace { 
            background: #11111b; 
            padding: 15px; 
            border-radius: 4px; 
            overflow-x: auto; 
            margin: 15px 0;
            border: 1px solid #585b70;
        }
        .stack-trace pre { 
            margin: 0; 
            color: #f5c2e7; 
            font-size: 12px;
        }
        .suggestions { 
            background: #a6e3a1; 
            color: #11111b; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 20px 0;
        }
        .suggestions h3 { 
            color: #11111b; 
            margin-top: 0; 
        }
        .suggestions ul { 
            margin: 10px 0; 
            padding-left: 20px;
        }
        .timestamp { 
            color: #6c7086; 
            font-size: 12px; 
            text-align: right; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #585b70;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="error-title">Application Error Detected</h1>
            <p class="error-subtitle">Instead of showing a 502 Bad Gateway, here\'s what actually went wrong:</p>
        </div>
        
        <div class="section">
            <h3>Error Details</h3>
            <div class="key-value">
                <span class="key">Error Type:</span>
                <span class="value">' . htmlspecialchars($errorDetails['error_type']) . '</span>
            </div>
            <div class="key-value">
                <span class="key">Message:</span>
                <span class="value">' . htmlspecialchars($errorDetails['error_message']) . '</span>
            </div>
            <div class="key-value">
                <span class="key">File:</span>
                <span class="value">' . htmlspecialchars($errorDetails['error_file']) . '</span>
            </div>
            <div class="key-value">
                <span class="key">Line:</span>
                <span class="value">' . $errorDetails['error_line'] . '</span>
            </div>
        </div>
        
        <div class="section">
            <h3>Request Information</h3>
            <div class="key-value">
                <span class="key">URL:</span>
                <span class="value">' . htmlspecialchars($errorDetails['url']) . '</span>
            </div>
            <div class="key-value">
                <span class="key">Method:</span>
                <span class="value">' . $errorDetails['method'] . '</span>
            </div>
            <div class="key-value">
                <span class="key">User:</span>
                <span class="value">' . $errorDetails['user_id'] . '</span>
            </div>
            <div class="key-value">
                <span class="key">Inertia Request:</span>
                <span class="value">' . $errorDetails['is_inertia_request'] . '</span>
            </div>
            <div class="key-value">
                <span class="key">Expects JSON:</span>
                <span class="value">' . $errorDetails['expects_json'] . '</span>
            </div>
        </div>';
        
        if ($inertiaError) {
            $html .= '
        <div class="section">
            <h3>Additional Issue</h3>
            <p style="color: #f9e2af;">Inertia.js also failed to render the error page:</p>
            <div class="value">' . htmlspecialchars($inertiaError->getMessage()) . '</div>
        </div>';
        }
        
        $html .= '
        <div class="section">
            <h3>Stack Trace</h3>
            <div class="stack-trace">
                <pre>' . htmlspecialchars($errorDetails['stack_trace']) . '</pre>
            </div>
        </div>
        
        <div class="suggestions">
            <h3>💡 Suggested Actions:</h3>
            <ul>
                <li>Check the Laravel logs in storage/logs/ for more details</li>
                <li>Verify database connection and credentials</li>
                <li>Clear application cache: php artisan cache:clear</li>
                <li>If this error persists, contact the system administrator</li>
            </ul>
        </div>
        
        <div class="timestamp">
            Error occurred at: ' . $errorDetails['timestamp'] . '
        </div>
    </div>
</body>
</html>';
        
        return response($html, 500)->header('Content-Type', 'text/html');
    }
}