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
        Schema::table('payment_records', function (Blueprint $table) {
            $table->unsignedBigInteger('school_year_id')->nullable()->after('processed_by_user_id');
            $table->foreign('school_year_id')->references('id')->on('school_years')->onDelete('set null');
            $table->index('school_year_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_records', function (Blueprint $table) {
            $table->dropForeign(['school_year_id']);
            $table->dropIndex(['school_year_id']);
            $table->dropColumn('school_year_id');
        });
    }
};
