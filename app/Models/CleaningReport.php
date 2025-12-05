<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CleaningReport extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'cleaning_schedule_id',
        'student_id',
        'reported_by_student_id',
        'tenant_id',
        'scheduled_date',
        'reason',
        'status',
        'manager_notes',
        'resolved_at',
    ];
    
    protected $casts = [
        'scheduled_date' => 'date',
        'resolved_at' => 'datetime',
    ];
    
    /**
     * Get the cleaning schedule this report belongs to
     */
    public function cleaningSchedule()
    {
        return $this->belongsTo(CleaningSchedule::class, 'cleaning_schedule_id');
    }
    
    /**
     * Get the student who didn't clean
     */
    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
    
    /**
     * Get the student who reported
     */
    public function reportedBy()
    {
        return $this->belongsTo(Student::class, 'reported_by_student_id', 'student_id');
    }
    
    /**
     * Get the tenant/dormitory
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }
    
    /**
     * Scope for pending reports
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
    
    /**
     * Scope for resolved reports
     */
    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }
    
    /**
     * Scope for a specific tenant
     */
    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }
    
    /**
     * Mark report as resolved
     */
    public function markAsResolved($managerNotes = null)
    {
        $this->update([
            'status' => 'resolved',
            'manager_notes' => $managerNotes,
            'resolved_at' => now(),
        ]);
    }
    
    /**
     * Mark report as dismissed
     */
    public function dismiss($managerNotes = null)
    {
        $this->update([
            'status' => 'dismissed',
            'manager_notes' => $managerNotes,
            'resolved_at' => now(),
        ]);
    }
}
