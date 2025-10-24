<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

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
        
        // Update existing records with default values
        DB::table('applications')
            ->whereNull('parent_name')
            ->update([
                'parent_name' => 'Not Provided',
                'parent_phone' => '09000000000',
                'parent_relationship' => 'Not Specified'
            ]);
        
        // Now make columns required
        Schema::table('applications', function (Blueprint $table) {
            $table->string('parent_name')->nullable(false)->change();
            $table->string('parent_phone')->nullable(false)->change();
            $table->string('parent_relationship')->nullable(false)->change();
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
