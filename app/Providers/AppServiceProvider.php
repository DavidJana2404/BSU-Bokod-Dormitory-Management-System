<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure custom password rules
        Password::defaults(function () {
            return Password::min(8)
                ->mixedCase() // Requires both uppercase and lowercase letters
                ->numbers();  // Requires at least one number
                // Note: No special characters or symbols required
        });
        
        // Share appearance theme with all views
        View::composer('*', function ($view) {
            $appearance = request()->cookie('appearance', 'system');
            $view->with('appearance', $appearance);
        });
    }
}
