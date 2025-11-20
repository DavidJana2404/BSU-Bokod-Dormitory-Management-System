<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cleaning_schedules', function (Blueprint $table) {
            // Drop the existing unique constraint
            $table->dropUnique(['room_id', 'day_of_week']);
            
            // Make room_id nullable
            $table->unsignedBigInteger('room_id')->nullable()->change();
            
            // Add type column (room or individual)
            $table->enum('type', ['room', 'individual'])->default('room')->after('day_of_week');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cleaning_schedules', function (Blueprint $table) {
            // Remove type column
            $table->dropColumn('type');
            
            // Make room_id non-nullable again
            $table->unsignedBigInteger('room_id')->nullable(false)->change();
            
            // Restore the unique constraint
            $table->unique(['room_id', 'day_of_week']);
        });
    }
};
