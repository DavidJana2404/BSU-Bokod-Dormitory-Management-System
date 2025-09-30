<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Booking extends Model
{
    use HasFactory;
    protected $primaryKey = 'booking_id';
    protected $fillable = [
        'tenant_id',
        'student_id',
        'room_id',
        'check_in_date',
        'check_out_date',
        'archived_at',
    ];

    public $timestamps = false;

    protected $dates = [
        'check_in_date',
        'check_out_date',
        'archived_at',
    ];

    /**
     * Get the room associated with this booking
     */
    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id', 'room_id');
    }

    /**
     * Get the student associated with this booking
     */
    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    /**
     * Check if this booking is currently active
     */
    public function isActive()
    {
        $now = Carbon::now();
        $checkIn = Carbon::parse($this->check_in_date);
        $checkOut = Carbon::parse($this->check_out_date);
        
        return $now->between($checkIn, $checkOut) || $now->isSameDay($checkIn) || $now->isSameDay($checkOut);
    }

    /**
     * Boot method to set up model events
     */
    protected static function boot()
    {
        parent::boot();

        // When a booking is created, update room status
        static::created(function ($booking) {
            $booking->updateRoomStatus();
        });

        // When a booking is updated, update room status
        static::updated(function ($booking) {
            $booking->updateRoomStatus();
            
            // If room_id changed, update both old and new rooms
            if ($booking->isDirty('room_id')) {
                $oldRoomId = $booking->getOriginal('room_id');
                if ($oldRoomId) {
                    $oldRoom = Room::find($oldRoomId);
                    if ($oldRoom) {
                        $oldRoom->updateStatusBasedOnBookings();
                    }
                }
            }
        });

        // When a booking is deleted, update room status
        static::deleted(function ($booking) {
            $booking->updateRoomStatus();
        });
    }

    /**
     * Update the associated room's status based on current bookings
     */
    public function updateRoomStatus()
    {
        if ($this->room) {
            $this->room->updateStatusBasedOnBookings();
        }
    }
    
    /**
     * Scope to exclude archived bookings
     */
    public function scopeNotArchived($query)
    {
        return $query->whereNull('archived_at');
    }
    
    /**
     * Scope to get only archived bookings
     */
    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at');
    }
    
    /**
     * Archive this booking
     */
    public function archive()
    {
        $this->update(['archived_at' => now()]);
        // Update room status after archiving
        $this->updateRoomStatus();
    }
    
    /**
     * Restore this booking from archive
     */
    public function restore()
    {
        $this->update(['archived_at' => null]);
        // Update room status after restoring
        $this->updateRoomStatus();
    }
    
    /**
     * Check if booking is archived
     */
    public function isArchived()
    {
        return !is_null($this->archived_at);
    }
}
