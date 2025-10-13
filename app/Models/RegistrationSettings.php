<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationSettings extends Model
{
    protected $fillable = [
        'setting_key',
        'enabled',
        'description',
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];

    /**
     * Get a setting by key
     */
    public static function getSetting(string $key): ?bool
    {
        $setting = self::where('setting_key', $key)->first();
        return $setting ? $setting->enabled : null;
    }

    /**
     * Set a setting by key
     */
    public static function setSetting(string $key, bool $enabled): bool
    {
        return self::updateOrCreate(
            ['setting_key' => $key],
            ['enabled' => $enabled]
        ) ? true : false;
    }

    /**
     * Check if manager registration is enabled
     */
    public static function isManagerRegistrationEnabled(): bool
    {
        return self::getSetting('manager_registration') ?? true;
    }

    /**
     * Check if cashier registration is enabled
     */
    public static function isCashierRegistrationEnabled(): bool
    {
        return self::getSetting('cashier_registration') ?? true;
    }
}
