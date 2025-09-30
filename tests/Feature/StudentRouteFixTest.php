<?php

use App\Models\User;
use App\Models\Student;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('student show route returns proper Inertia page', function () {
    // Create a tenant and user for the test
    $tenant = Tenant::create([
        'tenant_id' => 'TEST001',
        'dormitory_name' => 'Test Dormitory',
        'address' => 'Test Address',
        'contact_number' => '09171234567',
    ]);
    
    $user = User::create([
        'name' => 'Test Admin',
        'email' => 'admin@test.com',
        'password' => Hash::make('password'),
        'role' => 'admin',
        'is_active' => true,
    ]);
    
    // Set tenant_id manually for testing (it may not exist in test database)
    $user->tenant_id = $tenant->tenant_id;
    
    // Create a student
    $student = Student::create([
        'tenant_id' => $tenant->tenant_id,
        'first_name' => 'Test',
        'last_name' => 'Student',
        'email' => 'student@test.com',
        'phone' => '09171234568',
        'password' => null,
        'status' => 'in',
        'payment_status' => 'unpaid',
    ]);
    
    // Act as the admin user and visit the student show route
    $response = $this->actingAs($user)
        ->get("/students/{$student->student_id}");
    
    // Should now return a successful Inertia response with student show page
    $response->assertStatus(200);
    
    // Test that we get an Inertia response (not JSON)
    $this->assertArrayHasKey('component', $response->viewData('page'));
    $this->assertEquals('students/show', $response->viewData('page')['component']);
    
    // Test that student data is present
    $this->assertArrayHasKey('student', $response->viewData('page')['props']);
    $studentData = $response->viewData('page')['props']['student'];
    $this->assertEquals($student->student_id, $studentData['student_id']);
    $this->assertEquals('Test', $studentData['first_name']);
    $this->assertEquals('Student', $studentData['last_name']);
});

test('student update redirects properly', function () {
    // Create a tenant and user for the test
    $tenant = Tenant::create([
        'tenant_id' => 'TEST002',
        'dormitory_name' => 'Test Dormitory 2',
        'address' => 'Test Address 2',
        'contact_number' => '09171234569',
    ]);
    
    $user = User::create([
        'name' => 'Test Admin 2',
        'email' => 'admin2@test.com',
        'password' => Hash::make('password'),
        'role' => 'admin',
        'is_active' => true,
    ]);
    
    // Set tenant_id manually for testing (it may not exist in test database)
    $user->tenant_id = $tenant->tenant_id;
    
    // Create a student
    $student = Student::create([
        'tenant_id' => $tenant->tenant_id,
        'first_name' => 'Test',
        'last_name' => 'Student',
        'email' => 'student2@test.com',
        'phone' => '09171234570',
        'password' => null,
        'status' => 'in',
        'payment_status' => 'unpaid',
    ]);
    
    // Act as the admin user and update the student
    $response = $this->actingAs($user)
        ->put("/students/{$student->student_id}", [
            'first_name' => 'Updated',
            'last_name' => 'Student',
            'email' => 'updated@test.com',
            'phone' => '09171234571',
        ]);
    
    // Should redirect to students index
    $response->assertRedirect(route('students.index'));
    $response->assertSessionHas('success', 'Student updated successfully.');
});
