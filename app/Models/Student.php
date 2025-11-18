<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Student extends Authenticatable
{
    use HasFactory, Notifiable;
    
    protected $table = 'students';
    protected $primaryKey = 'student_id';
    
    protected $fillable = [
        'tenant_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'parent_name',
        'parent_phone',
        'parent_relationship',
        'password',
        'payment_status',
        'payment_date',
        'amount_paid',
        'payment_notes',
        'status',
        'leave_reason',
        'status_updated_at',
        'archived_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'payment_date' => 'datetime',
            'amount_paid' => 'decimal:2',
            'status_updated_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public $timestamps = false;
    
    /**
     * Get the name of the unique identifier for the user.
     */
    public function getAuthIdentifierName(): string
    {
        return 'student_id';
    }
    
    /**
     * Get the unique identifier for the user.
     */
    public function getAuthIdentifier()
    {
        return $this->getAttribute($this->getAuthIdentifierName());
    }
    
    /**
     * Get the password for the user.
     */
    public function getAuthPassword(): string
    {
        // Return the password or empty string if null
        // This prevents null returns that cause TypeErrors
        return $this->password ?? '';
    }

    /**
     * Determine if the student can authenticate (has a password set)
     */
    public function canAuthenticate(): bool
    {
        return !empty($this->password);
    }
    
    /**
     * Determine if the student needs to set their initial password
     */
    public function needsPasswordSetup(): bool
    {
        return empty($this->password);
    }
    
    /**
     * Determine if the student has never set a password (created from application)
     */
    public function hasNoPasswordAccess(): bool
    {
        return $this->password === null;
    }
    
    /**
     * Get the remember token for the user.
     */
    public function getRememberToken()
    {
        return $this->getAttribute($this->getRememberTokenName());
    }
    
    /**
     * Set the remember token for the user.
     */
    public function setRememberToken($value)
    {
        $this->setAttribute($this->getRememberTokenName(), $value);
    }
    
    /**
     * Get the name of the remember token column.
     */
    public function getRememberTokenName()
    {
        return 'remember_token';
    }
    
    /**
     * Get the tenant (dormitory) associated with this student.
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }
    
    /**
     * Get the bookings associated with this student.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'student_id', 'student_id');
    }
    
    /**
     * Get the current active booking for this student.
     * For semester-based bookings, we get the first non-archived booking
     */
    public function currentBooking()
    {
        return $this->bookings()->whereNull('archived_at')
                                 ->first();
    }
    
    /**
     * Get the current room for this student.
     */
    public function currentRoom()
    {
        $booking = $this->currentBooking();
        return $booking ? $booking->room : null;
    }
    
    /**
     * Get cleaning schedules for the student's current room.
     */
    public function currentRoomCleaningSchedules()
    {
        $currentRoom = $this->currentRoom();
        
        if (!$currentRoom) {
            return collect([]);
        }
        
        return $currentRoom->cleaningSchedules;
    }
    
    /**
     * Get validation rules for student creation/update.
     */
    public static function validationRules($id = null)
    {
        return [
            'tenant_id' => 'required|exists:tenants,tenant_id',
            'first_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'last_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'email' => [
                'required',
                'email:rfc,dns',
                'max:255',
                'lowercase',
                function ($attribute, $value, $fail) use ($id) {
                    $query = self::where('email', $value)->whereNull('archived_at');
                    if ($id) {
                        $query->where('student_id', '!=', $id);
                    }
                    if ($query->exists()) {
                        $fail('This email address is already registered to an active student.');
                    }
                }
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                new \App\Rules\PhilippinePhoneNumber
            ],
            'password' => $id ? 'nullable' : 'required|string|min:8',
            'payment_status' => 'nullable|in:unpaid,paid,partial',
            'amount_paid' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:in,on_leave',
            'leave_reason' => 'nullable|string|max:1000',
        ];
    }
    
    /**
     * Scope to exclude archived students
     */
    public function scopeNotArchived($query)
    {
        return $query->whereNull('archived_at');
    }
    
    /**
     * Scope to get only archived students
     */
    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at');
    }
    
    /**
     * Archive this student
     */
    public function archive()
    {
        $this->update(['archived_at' => now()]);
    }
    
    /**
     * Restore this student from archive
     */
    public function restore()
    {
        $this->update(['archived_at' => null]);
    }
    
    /**
     * Check if student is archived
     */
    public function isArchived()
    {
        return !is_null($this->archived_at);
    }
}
