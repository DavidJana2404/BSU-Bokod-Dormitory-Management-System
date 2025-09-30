<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\Tenant;
use Illuminate\Support\Facades\Hash;

class TestStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test tenant if it doesn't exist
        $tenant = Tenant::first();
        
        if (!$tenant) {
            $tenant = Tenant::create([
                'tenant_id' => 1,
                'dormitory_name' => 'Test Dormitory',
                'location' => 'Test Location',
                'updated_at' => now()
            ]);
        }
        
        // Create a test student with status fields
        $student = Student::create([
            'tenant_id' => $tenant->tenant_id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'student@test.com',
            'phone' => '1234567890',
            'password' => Hash::make('password'),
            'check_in_date' => now(),
            'check_out_date' => now()->addMonths(4), // 4 month stay
            'payment_status' => 'unpaid',
            'status' => 'in', // Default status
            'leave_reason' => null,
            'status_updated_at' => now(),
        ]);
        
        $this->command->info('Test student created:');
        $this->command->info('Email: student@test.com');
        $this->command->info('Password: password');
        $this->command->info('Status: in');
        $this->command->info('Student can now log in and test status functionality');
    }
}