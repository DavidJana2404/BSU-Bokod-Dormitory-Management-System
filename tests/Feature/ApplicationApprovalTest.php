<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Application;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Inertia\Testing\AssertableInertia as Assert;

class ApplicationApprovalTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private $user;
    private $tenant;
    private $application;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a tenant
        $this->tenant = Tenant::create([
            'dormitory_name' => 'Test Dormitory',
            'address' => '123 Test Street',
            'contact_number' => '555-1234',
        ]);

        // Create a user/manager
        $this->user = User::create([
            'name' => 'Test Manager',
            'email' => 'manager@test.com',
            'password' => bcrypt('password123A'),
            'role' => 'manager',
        ]);
        
        // Manually set tenant_id for testing
        $this->user->tenant_id = $this->tenant->tenant_id;

        // Create a test application
        $this->application = Application::create([
            'tenant_id' => $this->tenant->tenant_id,
            'first_name' => 'John',
            'last_name' => 'Applicant',
            'email' => 'john.applicant@example.com',
            'phone' => '09171234567',
            'additional_info' => 'Test application',
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function it_can_approve_a_pending_application()
    {
        $response = $this->actingAs($this->user)
            ->put("/applications/{$this->application->id}/approve");

        $response->assertStatus(302);
        $response->assertRedirect('/applications');
        $response->assertSessionHas('success');
        
        // Verify application was updated
        $this->application->refresh();
        $this->assertEquals('approved', $this->application->status);
        $this->assertEquals($this->user->id, $this->application->processed_by);
        $this->assertNotNull($this->application->processed_at);
        
        // Verify student was created
        $this->assertDatabaseHas('students', [
            'first_name' => 'John',
            'last_name' => 'Applicant',
            'email' => 'john.applicant@example.com',
            'tenant_id' => $this->tenant->tenant_id,
            'status' => 'in',
            'payment_status' => 'unpaid',
        ]);
        
        // Verify student has no password initially
        $student = Student::where('email', 'john.applicant@example.com')->first();
        $this->assertNull($student->password);
    }

    /** @test */
    public function it_can_reject_a_pending_application()
    {
        $rejectionReason = 'Does not meet requirements';
        
        $response = $this->actingAs($this->user)
            ->put("/applications/{$this->application->id}/reject", [
                'rejection_reason' => $rejectionReason,
            ]);

        $response->assertStatus(302);
        $response->assertRedirect('/applications');
        $response->assertSessionHas('success', 'Application rejected successfully.');
        
        // Verify application was updated
        $this->application->refresh();
        $this->assertEquals('rejected', $this->application->status);
        $this->assertEquals($rejectionReason, $this->application->rejection_reason);
        $this->assertEquals($this->user->id, $this->application->processed_by);
        $this->assertNotNull($this->application->processed_at);
        
        // Verify no student was created
        $this->assertDatabaseMissing('students', [
            'email' => 'john.applicant@example.com',
        ]);
    }

    /** @test */
    public function it_prevents_processing_already_processed_applications()
    {
        // Mark application as already approved
        $this->application->update([
            'status' => 'approved',
            'processed_by' => $this->user->id,
            'processed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->put("/applications/{$this->application->id}/approve");

        $response->assertStatus(302);
        $response->assertRedirect('/applications');
        $response->assertSessionHas('error', 'Application has already been processed.');
    }

    /** @test */
    public function it_requires_rejection_reason_when_rejecting()
    {
        $response = $this->actingAs($this->user)
            ->put("/applications/{$this->application->id}/reject", [
                'rejection_reason' => '',
            ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['rejection_reason']);
        
        // Verify application was not updated
        $this->application->refresh();
        $this->assertEquals('pending', $this->application->status);
    }

    /** @test */
    public function it_prevents_unauthorized_application_processing()
    {
        // Create another tenant and application
        $otherTenant = Tenant::create([
            'dormitory_name' => 'Other Dormitory',
            'address' => '456 Other Street',
            'contact_number' => '555-5678',
        ]);

        $otherApplication = Application::create([
            'tenant_id' => $otherTenant->tenant_id,
            'first_name' => 'Jane',
            'last_name' => 'Applicant',
            'email' => 'jane.applicant@example.com',
            'phone' => '09177654321',
            'additional_info' => 'Other tenant application',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)
            ->put("/applications/{$otherApplication->id}/approve");

        $response->assertStatus(302);
        $response->assertRedirect('/applications');
        $response->assertSessionHas('error', 'You do not have permission to process this application.');
        
        // Verify application was not processed
        $otherApplication->refresh();
        $this->assertEquals('pending', $otherApplication->status);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $response = $this->put("/applications/{$this->application->id}/approve");

        $response->assertStatus(302);
        $response->assertRedirect('/login');
    }

    /** @test */
    public function applications_index_shows_processed_applications_correctly()
    {
        // Create some processed applications with explicit timestamps
        $approvedApp = Application::create([
            'tenant_id' => $this->tenant->tenant_id,
            'first_name' => 'Jane',
            'last_name' => 'Approved',
            'email' => 'jane.approved@example.com',
            'phone' => '09171234568',
            'status' => 'approved',
            'processed_by' => $this->user->id,
            'processed_at' => now()->subHours(2),
            'created_at' => now()->subHours(1), // oldest
        ]);

        $rejectedApp = Application::create([
            'tenant_id' => $this->tenant->tenant_id,
            'first_name' => 'Bob',
            'last_name' => 'Rejected',
            'email' => 'bob.rejected@example.com',
            'phone' => '09171234569',
            'status' => 'rejected',
            'rejection_reason' => 'Test rejection',
            'processed_by' => $this->user->id,
            'processed_at' => now()->subHours(1),
            'created_at' => now()->subMinutes(30), // middle
        ]);
        
        // Update the pending application to be newest
        $this->application->update(['created_at' => now()]); // newest

        $response = $this->actingAs($this->user)
            ->get('/applications');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('applications/index')
            ->has('applications', 3) // pending + approved + rejected
            ->where('applications.0.status', 'pending') // newest (original pending application)
            ->where('applications.1.status', 'approved') // second (approved application)
            ->where('applications.2.status', 'rejected') // third (rejected application)
        );
    }
}