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
        Schema::create('cleaning_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('room_id');
            $table->tinyInteger('day_of_week'); // 1 = Monday, 7 = Sunday
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('room_id')->references('room_id')->on('rooms')->onDelete('cascade');
            
            // Unique constraint to prevent duplicate assignments
            $table->unique(['room_id', 'day_of_week']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cleaning_schedules');
    }
};
