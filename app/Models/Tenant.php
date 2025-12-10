<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Schema;

class Tenant extends Model
{
    use HasFactory;
    protected $primaryKey = 'tenant_id';
    protected $fillable = [
        'dormitory_name',
        'address',
        'contact_number',
        'archived_at',
    ];

    public $timestamps = true;
    
    protected $dates = [
        'archived_at',
    ];
    
    protected function casts(): array
    {
        return [
            'archived_at' => 'datetime',
        ];
    }

    public function rooms()
    {
        return $this->hasMany(\App\Models\Room::class,'tenant_id','tenant_id');
    }

    public function manager()
    {
        return $this->hasOne(\App\Models\User::class, 'tenant_id', 'tenant_id')
            ->where('role', 'manager');
    }
    
    /**
     * Get all students in this dormitory.
     */
    public function students()
    {
        return $this->hasMany(\App\Models\Student::class, 'tenant_id', 'tenant_id');
    }
    
    /**
     * Get all bookings for this dormitory.
     */
    public function bookings()
    {
        return $this->hasMany(\App\Models\Booking::class, 'tenant_id', 'tenant_id');
    }
    
    /**
     * Scope to exclude archived dormitories
     */
    public function scopeNotArchived($query)
    {
        return $query->whereNull('archived_at');
    }
    
    /**
     * Scope to get only archived dormitories
     */
    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at');
    }
    
    /**
     * Archive this dormitory
     */
    public function archive()
    {
        // Only update archived_at if the column exists
        if (Schema::hasColumn('tenants', 'archived_at')) {
            $this->update(['archived_at' => now()]);
        }
    }
    
    /**
     * Restore this dormitory from archive
     */
    public function restore()
    {
        // Only update archived_at if the column exists
        if (Schema::hasColumn('tenants', 'archived_at')) {
            $this->update(['archived_at' => null]);
        }
    }
    
    /**
     * Check if dormitory is archived
     */
    public function isArchived()
    {
        return !is_null($this->archived_at);
    }
}
