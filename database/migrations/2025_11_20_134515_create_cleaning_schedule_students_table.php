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
        Schema::create('cleaning_schedule_students', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cleaning_schedule_id');
            $table->unsignedBigInteger('student_id');
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('cleaning_schedule_id')->references('id')->on('cleaning_schedules')->onDelete('cascade');
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
            
            // Unique constraint to prevent duplicate assignments
            $table->unique(['cleaning_schedule_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cleaning_schedule_students');
    }
};
