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
            $table->string('parent_name')->nullable()->after('phone');
            $table->string('parent_phone')->nullable()->after('parent_name');
            $table->string('parent_relationship')->nullable()->after('parent_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn(['parent_name', 'parent_phone', 'parent_relationship']);
        });
    }
};
