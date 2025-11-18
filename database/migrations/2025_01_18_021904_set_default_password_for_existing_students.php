<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update all students with null passwords to have the default password Password123
        DB::table('students')
            ->whereNull('password')
            ->whereNull('archived_at')
            ->update([
                'password' => Hash::make('Password123')
            ]);
            
        \Log::info('Migration: Set default password Password123 for all existing students without passwords');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optionally revert by setting passwords back to null
        // This is not recommended as it would disable student logins
        // Uncomment if you really want to revert:
        // DB::table('students')
        //     ->where('password', Hash::make('Password123'))
        //     ->update(['password' => null]);
    }
};
