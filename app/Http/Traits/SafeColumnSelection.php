<?php

namespace App\Http\Traits;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Cache;

/**
 * Trait SafeColumnSelection
 * 
 * Provides methods to safely select database columns that may not exist yet.
 * This prevents 500 errors when migrations haven't been run yet.
 */
trait SafeColumnSelection
{
    /**
     * Get columns for a table, checking which ones actually exist.
     * Results are cached for performance.
     * 
     * @param string $table The table name
     * @param array $baseColumns Required columns that must exist
     * @param array $optionalColumns Optional columns to check
     * @return array Array of column names that exist
     */
    protected function getSafeColumns(string $table, array $baseColumns, array $optionalColumns = []): array
    {
        // Cache key for this table's columns
        $cacheKey = "safe_columns_{$table}";
        
        // Try to get from cache (5 minute cache)
        return Cache::remember($cacheKey, 300, function () use ($table, $baseColumns, $optionalColumns) {
            $columns = $baseColumns;
            
            foreach ($optionalColumns as $column) {
                try {
                    if (Schema::hasColumn($table, $column)) {
                        $columns[] = $column;
                    }
                } catch (\Exception $e) {
                    // If Schema check fails, skip this column
                    \Log::warning("Failed to check column existence", [
                        'table' => $table,
                        'column' => $column,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            return $columns;
        });
    }
    
    /**
     * Get safe columns for students table
     * 
     * @return array
     */
    protected function getSafeStudentColumns(): array
    {
        return $this->getSafeColumns(
            'students',
            [
                'student_id', 'tenant_id', 'first_name', 'last_name', 'email', 'phone',
                'payment_status', 'payment_date', 'amount_paid', 'payment_notes',
                'status', 'leave_reason', 'status_updated_at', 'password', 'archived_at'
            ],
            [
                'student_id_number', 'program_year', 'current_address', 
                'parent_name', 'parent_phone', 'parent_relationship'
            ]
        );
    }
    
    /**
     * Get safe columns for applications table
     * 
     * @return array
     */
    protected function getSafeApplicationColumns(): array
    {
        return $this->getSafeColumns(
            'applications',
            [
                'id', 'tenant_id', 'first_name', 'last_name', 'email', 'phone',
                'additional_info', 'status', 'rejection_reason', 'processed_by',
                'processed_at', 'created_at'
            ],
            [
                'student_id', 'program_year', 'current_address',
                'parent_name', 'parent_phone', 'parent_relationship'
            ]
        );
    }
    
    /**
     * Safe attribute access with default value
     * 
     * @param mixed $model The model instance
     * @param string $attribute The attribute name
     * @param mixed $default The default value if attribute doesn't exist
     * @return mixed
     */
    protected function safeAttribute($model, string $attribute, $default = null)
    {
        try {
            return $model->$attribute ?? $default;
        } catch (\Exception $e) {
            return $default;
        }
    }
}
