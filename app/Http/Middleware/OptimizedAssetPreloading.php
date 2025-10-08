<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OptimizedAssetPreloading
{
    /**
     * Handle an incoming request and optimize asset preloading
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Only add preload headers for HTML responses
        if (!$response->headers->get('Content-Type') || 
            !str_contains($response->headers->get('Content-Type'), 'text/html')) {
            return $response;
        }
        
        // Only preload for main page requests, not AJAX/Inertia partial requests
        if ($request->header('X-Inertia') || $request->expectsJson()) {
            return $response;
        }
        
        // Get the current route to determine what assets to preload
        $routeName = $request->route()?->getName() ?? '';
        $path = $request->path();
        
        // Define critical CSS that should be preloaded for specific routes
        $criticalAssets = $this->getCriticalAssets($routeName, $path);
        
        foreach ($criticalAssets as $asset) {
            $response->headers->set(
                'Link',
                sprintf('<%s>; rel=preload; as=%s; crossorigin', $asset['href'], $asset['as']),
                false
            );
        }
        
        return $response;
    }
    
    /**
     * Get critical assets that should be preloaded for specific routes
     */
    private function getCriticalAssets(string $routeName, string $path): array
    {
        $assets = [];
        
        // Only preload for the initial page load (dashboard, login, etc.)
        // Avoid preloading for all sub-pages to prevent the warning
        $criticalPages = ['dashboard', 'login', 'register', 'home'];
        $isInitialLoad = in_array($routeName, $criticalPages) || 
                        in_array($path, ['', '/', 'dashboard']);
        
        // Only preload if this is truly an initial page load
        if ($isInitialLoad && !$this->isSubsequentNavigation()) {
            // Only preload fonts - they are always needed
            // Don't preload CSS as it might not be used immediately on some pages
            $assets[] = [
                'href' => 'https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap',
                'as' => 'style'
            ];
        }
        
        return $assets;
    }
    
    /**
     * Check if this is a subsequent navigation (not initial page load)
     */
    private function isSubsequentNavigation(): bool
    {
        // If there's a referer from the same domain, it's likely subsequent navigation
        $referer = request()->header('referer');
        if ($referer) {
            $currentHost = request()->getHost();
            return str_contains($referer, $currentHost);
        }
        
        return false;
    }
    
    /**
     * Get the latest CSS file from Vite build
     */
    private function getLatestCssFile(): ?string
    {
        try {
            $manifestPath = public_path('build/.vite/manifest.json');
            
            if (!file_exists($manifestPath)) {
                return null;
            }
            
            $manifest = json_decode(file_get_contents($manifestPath), true);
            
            // Look for the main app CSS file
            foreach ($manifest as $key => $entry) {
                if (isset($entry['css']) && !empty($entry['css'])) {
                    // Return the first CSS file found
                    return '/build/' . $entry['css'][0];
                }
            }
            
            // Fallback: look for app.tsx entry
            if (isset($manifest['resources/js/app.tsx']['css'])) {
                return '/build/' . $manifest['resources/js/app.tsx']['css'][0];
            }
            
        } catch (\Exception $e) {
            \Log::warning('Could not determine CSS file for preloading', [
                'error' => $e->getMessage()
            ]);
        }
        
        return null;
    }
}