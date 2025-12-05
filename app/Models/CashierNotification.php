<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashierNotification extends Model
{
    protected $fillable = [
        'tenant_id',
        'type',
        'student_id',
        'booking_id',
        'student_name',
        'message',
        'is_read',
        'read_at',
        'booked_at',
        'archived_at',
        'days_stayed',
        'months_stayed',
        'calculated_cost',
        'total_semesters',
        'room_number',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'booked_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
