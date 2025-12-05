#!/usr/bin/env php
<?php

/**
 * Database Schema Diagnostic Script
 * 
 * This script checks if all required database columns exist
 * and helps diagnose migration issues on production.
 */

// Load Laravel bootstrap
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "\n=== Database Schema Diagnostic ===\n\n";

try {
    // Test database connection
    echo "Testing database connection...\n";
    DB::connection()->getPdo();
    echo "✅ Database connection successful\n\n";
    
    // Check applications table
    echo "Checking applications table...\n";
    $applicationsColumns = ['student_id', 'program_year', 'current_address', 'parent_relationship'];
    $missingApplicationsColumns = [];
    
    foreach ($applicationsColumns as $column) {
        if (Schema::hasColumn('applications', $column)) {
            echo "  ✅ Column '$column' exists\n";
        } else {
            echo "  ❌ Column '$column' MISSING\n";
            $missingApplicationsColumns[] = $column;
        }
    }
    
    // Check students table
    echo "\nChecking students table...\n";
    $studentsColumns = ['student_id_number', 'program_year', 'current_address', 'parent_relationship'];
    $missingStudentsColumns = [];
    
    foreach ($studentsColumns as $column) {
        if (Schema::hasColumn('students', $column)) {
            echo "  ✅ Column '$column' exists\n";
        } else {
            echo "  ❌ Column '$column' MISSING\n";
            $missingStudentsColumns[] = $column;
        }
    }
    
    // Check migration status
    echo "\nChecking migration status...\n";
    try {
        $migrations = DB::table('migrations')->orderBy('id', 'desc')->limit(5)->get();
        echo "Last 5 migrations:\n";
        foreach ($migrations as $migration) {
            echo "  - {$migration->migration} (batch: {$migration->batch})\n";
        }
    } catch (\Exception $e) {
        echo "  ⚠️  Could not fetch migration history: " . $e->getMessage() . "\n";
    }
    
    // Summary
    echo "\n=== Summary ===\n";
    if (empty($missingApplicationsColumns) && empty($missingStudentsColumns)) {
        echo "✅ All required columns exist!\n";
        echo "The database schema is up to date.\n";
    } else {
        echo "❌ Missing columns detected:\n";
        if (!empty($missingApplicationsColumns)) {
            echo "  Applications table: " . implode(', ', $missingApplicationsColumns) . "\n";
        }
        if (!empty($missingStudentsColumns)) {
            echo "  Students table: " . implode(', ', $missingStudentsColumns) . "\n";
        }
        echo "\nRecommendation: Run 'php artisan migrate --force' to apply pending migrations.\n";
        exit(1);
    }
    
} catch (\Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

echo "\n";
