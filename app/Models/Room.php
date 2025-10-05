<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;
use App\Models\CleaningSchedule;
use App\Models\Tenant;

class Room extends Model
{
    use HasFactory;
    protected $primaryKey = 'room_id';
    protected $fillable = [
        'tenant_id',
        'room_number',
        'type',
        'price_per_semester',
        'status',
        'max_capacity',
        'archived_at',
    ];

    public $timestamps = false;
    
    protected $dates = [
        'archived_at',
    ];

    /**
     * Get all bookings for this room
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'room_id', 'room_id');
    }

    /**
     * Get current active bookings for this room (excluding archived bookings)
     * For semester-based bookings, we consider all non-archived bookings as current
     */
    public function currentBookings()
    {
        return $this->bookings()->notArchived();
    }

    /**
     * Get current active booking for this room (backward compatibility)
     */
    public function currentBooking()
    {
        return $this->currentBookings()->first();
    }

    /**
     * Get current occupancy count (number of current students)
     */
    public function getCurrentOccupancy()
    {
        return $this->currentBookings()->count();
    }

    /**
     * Check if room is at maximum capacity
     */
    public function isAtCapacity()
    {
        return $this->getCurrentOccupancy() >= $this->max_capacity;
    }

    /**
     * Get available capacity (how many more students can be accommodated)
     */
    public function getAvailableCapacity()
    {
        return max(0, $this->max_capacity - $this->getCurrentOccupancy());
    }

    /**
     * Check if room can accommodate additional students
     */
    public function canAccommodate($studentCount = 1)
    {
        return $this->getAvailableCapacity() >= $studentCount;
    }

    /**
     * Check if room is currently occupied based on capacity
     * Room is 'occupied' only when at maximum capacity (6 students)
     * Room is 'available' when not at maximum capacity (0-5 students)
     */
    public function isCurrentlyOccupied()
    {
        return $this->isAtCapacity();
    }

    /**
     * Update room status based on current capacity
     * - available: 0-5 students (room has space)
     * - occupied: 6 students (room at maximum capacity)
     * - maintenance: manual status, not changed automatically
     */
    public function updateStatusBasedOnBookings()
    {
        try {
            // Skip if room is in maintenance
            if ($this->status === 'maintenance') {
                return false;
            }

            $isAtCapacity = $this->isAtCapacity();
            $newStatus = $isAtCapacity ? 'occupied' : 'available';

            if ($this->status !== $newStatus) {
                $this->update(['status' => $newStatus]);
                return true;
            }

            return false;
        } catch (\Exception $e) {
            \Log::warning('Error updating room status based on bookings', [
                'room_id' => $this->room_id,
                'current_status' => $this->status,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Set room to occupied status
     */
    public function setOccupied()
    {
        if ($this->status !== 'maintenance') {
            $this->update(['status' => 'occupied']);
        }
    }

    /**
     * Set room to available status
     */
    public function setAvailable()
    {
        if ($this->status !== 'maintenance') {
            $this->update(['status' => 'available']);
        }
    }
    
    /**
     * Scope to exclude archived rooms
     */
    public function scopeNotArchived($query)
    {
        return $query->whereNull('archived_at');
    }
    
    /**
     * Scope to get only archived rooms
     */
    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at');
    }
    
    /**
     * Archive this room
     */
    public function archive()
    {
        $this->update(['archived_at' => now()]);
    }
    
    /**
     * Restore this room from archive
     */
    public function restore()
    {
        $this->update(['archived_at' => null]);
    }
    
    /**
     * Check if room is archived
     */
    public function isArchived()
    {
        return !is_null($this->archived_at);
    }
    
    /**
     * Get the tenant (dormitory) that owns this room
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }
    
    /**
     * Get cleaning schedules for this room
     */
    public function cleaningSchedules()
    {
        return $this->hasMany(CleaningSchedule::class, 'room_id', 'room_id');
    }
}
