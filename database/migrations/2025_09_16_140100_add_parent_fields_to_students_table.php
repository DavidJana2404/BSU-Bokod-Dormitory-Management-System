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
            if (!Schema::hasColumn('students', 'parent_name')) {
                $table->string('parent_name')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('students', 'parent_phone')) {
                $table->string('parent_phone', 20)->nullable()->after('parent_name');
            }
            if (!Schema::hasColumn('students', 'parent_relationship')) {
                $table->string('parent_relationship', 50)->nullable()->after('parent_phone');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['parent_name', 'parent_phone', 'parent_relationship']);
        });
    }
};
