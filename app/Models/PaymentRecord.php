<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentRecord extends Model
{
    protected $fillable = [
        'student_id',
        'processed_by_user_id',
        'school_year_id',
        'payment_status',
        'amount_paid',
        'payment_notes',
        'student_name',
        'student_email',
        'dormitory_name',
        'room_number',
        'semester_count',
        'payment_date',
        'archived_at',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'payment_date' => 'datetime',
        'archived_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the student associated with this payment record
     */
    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    /**
     * Get the user who processed this payment
     */
    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }

    /**
     * Get the school year for this payment record
     */
    public function schoolYear()
    {
        return $this->belongsTo(SchoolYear::class, 'school_year_id');
    }

    /**
     * Scope to exclude archived records
     */
    public function scopeNotArchived($query)
    {
        return $query->whereNull('archived_at');
    }

    /**
     * Scope to get only archived records
     */
    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at');
    }

    /**
     * Archive this record
     */
    public function archive()
    {
        $this->update(['archived_at' => now()]);
    }

    /**
     * Restore this record from archive
     */
    public function restore()
    {
        $this->update(['archived_at' => null]);
    }
}
