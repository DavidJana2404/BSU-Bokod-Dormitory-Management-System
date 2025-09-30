<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Only disable problematic middleware for testing
        $this->withoutMiddleware([
            \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
        ]);
    }
    
    /**
     * Get a valid test email that passes DNS validation
     */
    protected function getValidTestEmail(): string
    {
        return 'test' . time() . '@gmail.com';
    }
    
    /**
     * Get a valid test password that meets validation requirements
     */
    protected function getValidTestPassword(): string
    {
        return 'Password123';
    }
}
