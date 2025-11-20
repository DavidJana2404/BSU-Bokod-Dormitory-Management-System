<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CleaningSchedule extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'room_id',
        'day_of_week',
        'type',
    ];

    /**
     * Get the room that this cleaning schedule belongs to
     */
    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id', 'room_id');
    }

    /**
     * Get the individual students assigned to this cleaning schedule
     */
    public function students()
    {
        return $this->belongsToMany(
            Student::class,
            'cleaning_schedule_students',
            'cleaning_schedule_id',
            'student_id'
        )->withTimestamps();
    }

    /**
     * Get the day name from day_of_week number
     */
    public function getDayNameAttribute()
    {
        $days = [
            1 => 'Monday',
            2 => 'Tuesday', 
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday',
            7 => 'Sunday'
        ];
        
        return $days[$this->day_of_week] ?? 'Unknown';
    }

    /**
     * Scope to get schedules for a specific day
     */
    public function scopeForDay($query, $dayOfWeek)
    {
        return $query->where('day_of_week', $dayOfWeek);
    }

    /**
     * Scope to get schedules for a specific room
     */
    public function scopeForRoom($query, $roomId)
    {
        return $query->where('room_id', $roomId);
    }

    /**
     * Check if this is a room-based schedule
     */
    public function isRoomBased()
    {
        return $this->type === 'room';
    }

    /**
     * Check if this is an individual-based schedule
     */
    public function isIndividualBased()
    {
        return $this->type === 'individual';
    }

    /**
     * Get all students assigned to this schedule
     * Returns students from the room if room-based, or individual students if individual-based
     */
    public function getAssignedStudents()
    {
        if ($this->isRoomBased() && $this->room) {
            return $this->room->students;
        }
        
        return $this->students;
    }
}
