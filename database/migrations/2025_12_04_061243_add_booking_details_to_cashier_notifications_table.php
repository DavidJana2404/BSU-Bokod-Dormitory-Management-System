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
        Schema::table('cashier_notifications', function (Blueprint $table) {
            $table->timestamp('booked_at')->nullable()->after('booking_id');
            $table->timestamp('archived_at')->nullable()->after('booked_at');
            $table->integer('days_stayed')->nullable()->after('archived_at');
            $table->decimal('calculated_cost', 10, 2)->nullable()->after('days_stayed');
            $table->integer('total_semesters')->nullable()->after('calculated_cost');
            $table->string('room_number')->nullable()->after('total_semesters');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cashier_notifications', function (Blueprint $table) {
            $table->dropColumn(['booked_at', 'archived_at', 'days_stayed', 'calculated_cost', 'total_semesters', 'room_number']);
        });
    }
};
