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
        Schema::table('students', function (Blueprint $table) {
            // Only add columns if they don't already exist
            if (!Schema::hasColumn('students', 'student_id_number')) {
                $table->string('student_id_number', 50)->nullable()->after('last_name');
            }
            if (!Schema::hasColumn('students', 'program_year')) {
                $table->string('program_year', 50)->nullable()->after('student_id_number');
            }
            if (!Schema::hasColumn('students', 'current_address')) {
                $table->text('current_address')->nullable()->after('program_year');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['student_id_number', 'program_year', 'current_address']);
        });
    }
};
