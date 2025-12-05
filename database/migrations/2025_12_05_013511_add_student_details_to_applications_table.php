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
        Schema::table('applications', function (Blueprint $table) {
            // Only add columns if they don't already exist
            if (!Schema::hasColumn('applications', 'student_id')) {
                $table->string('student_id')->nullable()->after('last_name');
            }
            if (!Schema::hasColumn('applications', 'program_year')) {
                $table->string('program_year')->nullable()->after('student_id'); // Format: BSIT 4, BIT 1, BSE 3
            }
            if (!Schema::hasColumn('applications', 'current_address')) {
                $table->text('current_address')->nullable()->after('program_year');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn(['student_id', 'program_year', 'current_address']);
        });
    }
};
