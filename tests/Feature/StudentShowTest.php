<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\Room;
use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Inertia\Testing\AssertableInertia as Assert;

class StudentShowTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private $user;
    private $tenant;
    private $student;

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

        // Create a student
        $this->student = Student::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone' => '555-0123',
            'tenant_id' => $this->tenant->tenant_id,
        ]);
    }

    /** @test */
    public function it_displays_student_details_page_for_valid_student()
    {
        $response = $this->actingAs($this->user)
            ->get("/students/{$this->student->student_id}");

        $response->assertStatus(200);
        
        $response->assertInertia(fn (Assert $page) => $page
            ->component('students/show')
            ->has('student')
            ->where('student.student_id', $this->student->student_id)
            ->where('student.first_name', 'John')
            ->where('student.last_name', 'Doe')
            ->where('student.email', 'john.doe@example.com')
            ->where('student.phone', '555-0123')
            ->where('student.tenant_id', $this->tenant->tenant_id)
            ->where('tenant_id', $this->tenant->tenant_id)
        );
    }

    /** @test */
    public function it_includes_booking_information_in_student_details()
    {
        // Create a room and booking for the student
        $room = Room::create([
            'tenant_id' => $this->tenant->tenant_id,
            'room_number' => '101',
            'type' => 'Standard',
            'capacity' => 2,
            'max_capacity' => 4,
            'price_per_semester' => 500.00,
        ]);

        $booking = Booking::create([
            'student_id' => $this->student->student_id,
            'room_id' => $room->room_id,
            'check_in_date' => now()->subDay(),
            'check_out_date' => now()->addMonths(6),
        ]);

        $response = $this->actingAs($this->user)
            ->get("/students/{$this->student->student_id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->has('student.all_bookings', 1)
            ->where('student.is_currently_booked', true)
            ->has('student.current_booking')
            ->where('student.current_booking.room_number', '101')
            ->where('student.current_booking.room_type', 'Standard')
        );
    }

    /** @test */
    public function it_redirects_when_student_not_found()
    {
        $response = $this->actingAs($this->user)
            ->get("/students/nonexistent123");

        $response->assertStatus(302);
        $response->assertRedirect('/students');
        $response->assertSessionHas('error', 'Student not found or you do not have permission to view this student.');
    }

    /** @test */
    public function it_blocks_access_to_student_from_different_tenant()
    {
        // Create another tenant and student
        $otherTenant = Tenant::create([
            'dormitory_name' => 'Other Dormitory',
            'address' => '456 Other Street',
            'contact_number' => '555-5678',
        ]);

        $otherStudent = Student::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@example.com',
            'phone' => '555-9876',
            'tenant_id' => $otherTenant->tenant_id,
        ]);

        $response = $this->actingAs($this->user)
            ->get("/students/{$otherStudent->student_id}");

        $response->assertStatus(302);
        $response->assertRedirect('/students');
        $response->assertSessionHas('error', 'Student not found or you do not have permission to view this student.');
    }

    /** @test */
    public function it_redirects_unauthenticated_users_to_login()
    {
        $response = $this->get("/students/{$this->student->student_id}");

        $response->assertStatus(302);
        $response->assertRedirect('/login');
    }

    /** @test */
    public function it_includes_payment_information_in_student_details()
    {
        // Update student with payment information
        $this->student->update([
            'payment_status' => 'paid',
            'payment_date' => now()->toDateString(),
            'amount_paid' => 500.00,
            'payment_notes' => 'Paid in full for semester',
        ]);

        $response = $this->actingAs($this->user)
            ->get("/students/{$this->student->student_id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('student.payment_status', 'paid')
            ->where('student.amount_paid', 500.00)
            ->where('student.payment_notes', 'Paid in full for semester')
            ->has('student.payment_date')
        );
    }

    /** @test */
    public function it_includes_student_status_information()
    {
        // Update student status to on leave
        $this->student->update([
            'status' => 'on_leave',
            'leave_reason' => 'Medical leave for treatment',
            'status_updated_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->get("/students/{$this->student->student_id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('student.status', 'on_leave')
            ->where('student.leave_reason', 'Medical leave for treatment')
            ->has('student.status_updated_at')
        );
    }

    /** @test */
    public function it_includes_login_access_information()
    {
        // Student with password (can login)
        $this->student->update([
            'password' => bcrypt('student123A'),
        ]);

        $response = $this->actingAs($this->user)
            ->get("/students/{$this->student->student_id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('student.password', true)
            ->where('student.login_status', 'enabled')
            ->where('student.needs_password_setup', false)
        );
    }

    /** @test */
    public function it_properly_maps_multiple_bookings_history()
    {
        // Create multiple rooms and bookings
        $room1 = Room::create([
            'tenant_id' => $this->tenant->tenant_id,
            'room_number' => '101',
            'type' => 'Standard',
            'capacity' => 2,
            'max_capacity' => 4,
            'price_per_semester' => 500.00,
        ]);

        $room2 = Room::create([
            'tenant_id' => $this->tenant->tenant_id,
            'room_number' => '102',
            'type' => 'Deluxe',
            'capacity' => 1,
            'max_capacity' => 2,
            'price_per_semester' => 700.00,
        ]);

        // Past booking
        $pastBooking = Booking::create([
            'student_id' => $this->student->student_id,
            'room_id' => $room1->room_id,
            'check_in_date' => now()->subMonths(8),
            'check_out_date' => now()->subMonths(2),
        ]);

        // Current booking
        $currentBooking = Booking::create([
            'student_id' => $this->student->student_id,
            'room_id' => $room2->room_id,
            'check_in_date' => now()->subMonth(),
            'check_out_date' => now()->addMonths(5),
        ]);

        $response = $this->actingAs($this->user)
            ->get("/students/{$this->student->student_id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->has('student.all_bookings', 2)
            ->where('student.is_currently_booked', true)
            ->where('student.booking_count', 2)
            ->where('student.current_booking.room_number', '102') // Current booking
            ->where('student.current_booking.room_type', 'Deluxe')
        );
    }

    /** @test */
    public function it_handles_archived_students_correctly()
    {
        // Archive the student
        $this->student->archive();

        $response = $this->actingAs($this->user)
            ->get("/students/{$this->student->student_id}");

        $response->assertStatus(302);
        $response->assertRedirect('/students');
        $response->assertSessionHas('error', 'Student not found or you do not have permission to view this student.');
    }

    /** @test */
    public function it_includes_created_and_updated_timestamps()
    {
        $response = $this->actingAs($this->user)
            ->get("/students/{$this->student->student_id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->has('student.created_at')
            ->has('student.updated_at')
        );
    }
}