<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DormitorianStatusHistory extends Model
{
    protected $table = 'dormitorian_status_history';
    
    protected $fillable = [
        'student_id',
        'status',
        'effective_date',
        'end_date',
        'reason',
        'changed_by',
    ];
    
    protected $casts = [
        'effective_date' => 'date',
        'end_date' => 'date',
    ];
    
    /**
     * Get the student this history belongs to
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
    
    /**
     * Get the user who made this status change
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
    
    /**
     * Check if this status change is currently active
     */
    public function isActive(): bool
    {
        $now = now()->toDateString();
        
        // Status is active if effective date has passed
        if ($this->effective_date > $now) {
            return false;
        }
        
        // If there's an end date, check if we're still before it
        if ($this->end_date) {
            return $this->end_date >= $now;
        }
        
        return true;
    }
}
