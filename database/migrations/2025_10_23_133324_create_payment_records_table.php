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
        Schema::create('payment_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('processed_by_user_id');
            $table->string('payment_status'); // paid, partial, unpaid
            $table->decimal('amount_paid', 10, 2)->nullable();
            $table->text('payment_notes')->nullable();
            $table->string('student_name');
            $table->string('student_email');
            $table->string('dormitory_name');
            $table->string('room_number')->nullable();
            $table->integer('semester_count')->nullable();
            $table->timestamp('payment_date')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
            $table->foreign('processed_by_user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('student_id');
            $table->index('payment_status');
            $table->index('archived_at');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_records');
    }
};
