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
        Schema::create('cleaning_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cleaning_schedule_id');
            $table->unsignedBigInteger('student_id'); // Student who didn't clean
            $table->unsignedBigInteger('reported_by_student_id'); // Student who reported
            $table->unsignedBigInteger('tenant_id');
            $table->date('scheduled_date'); // The date they were supposed to clean
            $table->text('reason')->nullable(); // Why they didn't clean
            $table->enum('status', ['pending', 'resolved', 'dismissed'])->default('pending');
            $table->text('manager_notes')->nullable(); // Manager's notes on the report
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            $table->foreign('cleaning_schedule_id')->references('id')->on('cleaning_schedules')->onDelete('cascade');
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
            $table->foreign('reported_by_student_id')->references('student_id')->on('students')->onDelete('cascade');
            $table->foreign('tenant_id')->references('tenant_id')->on('tenants')->onDelete('cascade');
            
            $table->index('status');
            $table->index('scheduled_date');
            $table->index('tenant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cleaning_reports');
    }
};
