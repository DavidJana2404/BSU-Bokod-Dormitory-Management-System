<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\EnsureUserRole;
use App\Http\Middleware\EnsureStudentGuard;
use App\Http\Middleware\RenderOptimizationMiddleware;
use App\Http\Middleware\DebugErrorMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Middleware\TrustProxies;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Trust all proxies for Render deployment
        $middleware->trustProxies(at: '*');
        
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            DebugErrorMiddleware::class, // Must be first to catch all errors
            RenderOptimizationMiddleware::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        
        $middleware->alias([
            'ensure.user.role' => EnsureUserRole::class,
            'ensure.student.guard' => EnsureStudentGuard::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Custom exception handling to prevent 502 errors
        $exceptions->render(function (\Throwable $e, $request) {
            \Log::error('Exception caught in global handler', [
                'exception_type' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'user_id' => $request->user()?->id ?? 'guest'
            ]);
            
            // Let the DebugErrorMiddleware handle it if it's a web request
            if ($request->is('*') && !$request->is('api/*')) {
                return null; // Let the normal handling continue
            }
        });
    })->create();
