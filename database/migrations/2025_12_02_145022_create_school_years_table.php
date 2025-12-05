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
        Schema::create('school_years', function (Blueprint $table) {
            $table->id();
            $table->string('year_label'); // e.g., "2025-2026"
            $table->integer('start_year');
            $table->integer('end_year');
            $table->boolean('is_current')->default(false);
            $table->timestamp('set_at')->nullable();
            $table->foreignId('set_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index('is_current');
            $table->index('start_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_years');
    }
};
