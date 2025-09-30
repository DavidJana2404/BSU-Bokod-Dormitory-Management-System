<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'tenant_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'additional_info',
        'status',
        'rejection_reason',
        'processed_by',
        'processed_at',
    ];
    
    protected $casts = [
        'processed_at' => 'datetime',
    ];
    
    /**
     * Get the tenant (dormitory) associated with this application.
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }
    
    /**
     * Get the user who processed this application.
     */
    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
    
    /**
     * Get validation rules for application creation.
     */
    public static function validationRules()
    {
        return [
            'tenant_id' => 'required|exists:tenants,tenant_id',
            'first_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'last_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'email' => [
                'required',
                'email:rfc,dns',
                'max:255',
                'lowercase',
                'unique:applications,email'
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                new \App\Rules\PhilippinePhoneNumber
            ],
            'additional_info' => 'nullable|string|max:1000',
        ];
    }
    
    /**
     * Scope to get pending applications.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
    
    /**
     * Scope to get approved applications.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
    
    /**
     * Scope to get rejected applications.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
