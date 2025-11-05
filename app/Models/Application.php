<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class Application extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'tenant_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'parent_name',
        'parent_phone',
        'parent_relationship',
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
                'unique:applications,email',
                function ($attribute, $value, $fail) {
                    // Check if email exists in active (non-archived) students
                    $existsInActiveStudents = Student::whereNull('archived_at')
                        ->where('email', $value)
                        ->exists();
                    
                    if ($existsInActiveStudents) {
                        $fail('This email address is already registered to an active student.');
                    }
                },
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                new \App\Rules\PhilippinePhoneNumber
            ],
            'parent_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'parent_phone' => [
                'required',
                'string',
                'max:20',
                new \App\Rules\PhilippinePhoneNumber
            ],
            'parent_relationship' => ['required', 'string', 'max:50'],
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
