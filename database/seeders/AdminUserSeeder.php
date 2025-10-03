<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This seeder will promote the first user to admin role
     */
    public function run(): void
    {
        // Check if admin already exists
        if (User::where('role', 'admin')->exists()) {
            $this->command->info('Admin user already exists. Skipping...');
            return;
        }

        // Get the first user (oldest by ID)
        $firstUser = User::orderBy('id')->first();
        
        if (!$firstUser) {
            $this->command->error('No users found in the system.');
            return;
        }

        // Promote to admin
        $firstUser->update(['role' => 'admin']);
        
        $this->command->info("Successfully promoted '{$firstUser->name}' ({$firstUser->email}) to admin role.");
    }
}
