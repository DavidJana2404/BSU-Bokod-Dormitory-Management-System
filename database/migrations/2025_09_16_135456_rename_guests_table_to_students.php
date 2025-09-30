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
        // Rename the table
        Schema::rename('guests', 'students');
        
        // Rename the primary key column
        Schema::table('students', function (Blueprint $table) {
            $table->renameColumn('guest_id', 'student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rename primary key back
        Schema::table('students', function (Blueprint $table) {
            $table->renameColumn('student_id', 'guest_id');
        });
        
        // Rename table back
        Schema::rename('students', 'guests');
    }
};
