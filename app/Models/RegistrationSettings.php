<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

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
        try {
            $setting = self::where('setting_key', $key)->first();
            return $setting ? $setting->enabled : null;
        } catch (\Exception $e) {
            \Log::warning('Failed to get setting: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Set a setting by key
     */
    public static function setSetting(string $key, bool $enabled): bool
    {
        try {
            $result = self::updateOrCreate(
                ['setting_key' => $key],
                ['enabled' => $enabled, 'description' => $key === 'registration_enabled' ? 'Allow new account registration' : '']
            );
            \Log::info("Setting {$key} updated to {$enabled}", ['result' => $result->toArray()]);
            return $result ? true : false;
        } catch (\Exception $e) {
            \Log::error('Failed to set setting: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if registration is enabled
     */
    public static function isRegistrationEnabled(): bool
    {
        return self::getSetting('registration_enabled') ?? true;
    }

    /**
     * Enable or disable registration
     */
    public static function setRegistrationEnabled(bool $enabled): bool
    {
        return self::setSetting('registration_enabled', $enabled);
    }
}
