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
        Schema::table('rooms', function (Blueprint $table) {
            // Rename the price column and set default value to 2000 (₱2000 per semester)
            $table->renameColumn('price_per_night', 'price_per_semester');
        });
        
        // Update all existing rooms to have ₱2000 per semester
        \DB::table('rooms')->update(['price_per_semester' => 2000]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            // Revert back to price_per_night
            $table->renameColumn('price_per_semester', 'price_per_night');
        });
    }
};
