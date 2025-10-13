<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('registration_settings', function (Blueprint $table) {
            $table->id();
            $table->string('setting_key')->unique();
            $table->boolean('enabled')->default(true);
            $table->string('description')->nullable();
            $table->timestamps();
        });
        
        // Insert default settings
        $now = Carbon::now();
        DB::table('registration_settings')->insert([
            [
                'setting_key' => 'manager_registration',
                'enabled' => true,
                'description' => 'Allow manager account registration',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'setting_key' => 'cashier_registration',
                'enabled' => true,
                'description' => 'Allow cashier account registration', 
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registration_settings');
    }
};
