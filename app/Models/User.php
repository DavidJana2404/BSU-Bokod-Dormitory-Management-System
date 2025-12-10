<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Schema;
// use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable; // SoftDeletes temporarily disabled
    
    // const DELETED_AT = 'archived_at';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'tenant_id',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            // 'archived_at' => 'datetime', // Temporarily disabled
        ];
    }

    /**
     * Get the tenant (hotel) that the manager is assigned to.
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }
    
    // Temporarily disabled until archived_at column is added
    // /**
    //  * Scope to get archived users.
    //  */
    // public function scopeArchived($query)
    // {
    //     return $query->whereNotNull('archived_at');
    // }
    
    /**
     * Archive this user
     */
    public function archive()
    {
        // Only update archived_at if the column exists
        if (Schema::hasColumn('users', 'archived_at')) {
            $this->update(['archived_at' => now()]);
        }
    }
    
    /**
     * Restore this user from archive
     */
    public function restore()
    {
        // Only update archived_at if the column exists
        if (Schema::hasColumn('users', 'archived_at')) {
            $this->update(['archived_at' => null]);
        }
    }
    
    /**
     * Force delete is just a regular delete for now
     */
    public function forceDelete()
    {
        return $this->delete();
    }
}
