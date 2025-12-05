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
        Schema::create('dormitorian_status_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
            $table->enum('status', ['in', 'on_leave']);
            $table->date('effective_date'); // The date when this status became effective
            $table->date('end_date')->nullable(); // For temporary status like leave
            $table->text('reason')->nullable(); // Reason for status change (required for leave)
            $table->foreignId('changed_by')->nullable()->constrained('users')->onDelete('cascade'); // Manager who made the change (NULL = self-update)
            $table->timestamps();
            
            // Index for faster queries
            $table->index(['student_id', 'effective_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dormitorian_status_history');
    }
};
