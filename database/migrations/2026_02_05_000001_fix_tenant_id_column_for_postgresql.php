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
        // Check if column already exists before adding
        if (!Schema::hasColumn('users', 'tenant_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedBigInteger('tenant_id')->nullable()->after('role');
                
                // Add foreign key with explicit name for PostgreSQL compatibility
                $table->foreign('tenant_id', 'fk_users_tenant_id')
                      ->references('tenant_id')->on('tenants')
                      ->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Only drop if column exists
        if (Schema::hasColumn('users', 'tenant_id')) {
            Schema::table('users', function (Blueprint $table) {
                // Drop foreign key first
                $table->dropForeign('fk_users_tenant_id');
                $table->dropColumn('tenant_id');
            });
        }
    }
};
