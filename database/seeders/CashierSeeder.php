<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CashierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test cashier user
        User::create([
            'name' => 'Test Cashier',
            'email' => 'cashier@test.com',
            'password' => Hash::make('password'),
            'role' => 'cashier',
            'is_active' => true,
            'tenant_id' => null, // Cashiers don't belong to specific tenants
        ]);
        
        $this->command->info('Cashier user created: cashier@test.com / password');
    }
}
