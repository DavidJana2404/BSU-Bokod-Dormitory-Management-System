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
        Schema::table('cleaning_reports', function (Blueprint $table) {
            // Drop the foreign key first
            $table->dropForeign(['cleaning_schedule_id']);
            
            // Make the column nullable
            $table->unsignedBigInteger('cleaning_schedule_id')->nullable()->change();
            
            // Re-add the foreign key
            $table->foreign('cleaning_schedule_id')->references('id')->on('cleaning_schedules')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cleaning_reports', function (Blueprint $table) {
            // Drop the foreign key
            $table->dropForeign(['cleaning_schedule_id']);
            
            // Make the column not nullable again
            $table->unsignedBigInteger('cleaning_schedule_id')->nullable(false)->change();
            
            // Re-add the foreign key with cascade
            $table->foreign('cleaning_schedule_id')->references('id')->on('cleaning_schedules')->onDelete('cascade');
        });
    }
};
