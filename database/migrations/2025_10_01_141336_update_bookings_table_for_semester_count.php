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
        Schema::table('bookings', function (Blueprint $table) {
            // Remove the date columns
            $table->dropColumn(['check_in_date', 'check_out_date']);
            
            // Add semester count column
            $table->integer('semester_count')->default(1)->after('room_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Remove semester count column
            $table->dropColumn('semester_count');
            
            // Add back the date columns
            $table->date('check_in_date')->nullable()->after('room_id');
            $table->date('check_out_date')->nullable()->after('check_in_date');
        });
    }
};