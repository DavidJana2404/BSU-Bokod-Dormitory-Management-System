<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolYear extends Model
{
    protected $fillable = [
        'year_label',
        'start_year',
        'end_year',
        'is_current',
        'set_at',
        'set_by_user_id',
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'set_at' => 'datetime',
        'start_year' => 'integer',
        'end_year' => 'integer',
    ];

    /**
     * Get the user who set this school year
     */
    public function setBy()
    {
        return $this->belongsTo(User::class, 'set_by_user_id');
    }

    /**
     * Get the current active school year
     */
    public static function current()
    {
        return static::where('is_current', true)->first();
    }

    /**
     * Set this as the current school year
     */
    public function makeCurrent()
    {
        // Unset all other current school years
        static::where('is_current', true)->update(['is_current' => false]);
        
        // Set this as current
        $this->update(['is_current' => true]);
    }
}
