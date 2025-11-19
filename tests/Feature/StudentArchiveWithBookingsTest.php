<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Student;
use App\Models\Booking;
use App\Models\Room;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

class StudentArchiveWithBookingsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that archiving a student also archives their bookings.
     */
    public function test_archiving_student_archives_their_bookings(): void
    {
        // Create a tenant (dormitory)
        $tenant = Tenant::factory()->create();
        
        // Create a room
        $room = Room::factory()->create([
            'tenant_id' => $tenant->tenant_id,
            'room_number' => '101',
            'status' => 'occupied',
        ]);
        
        // Create a student
        $student = Student::factory()->create([
            'tenant_id' => $tenant->tenant_id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
        ]);
        
        // Create a booking for the student
        $booking = Booking::factory()->create([
            'tenant_id' => $tenant->tenant_id,
            'student_id' => $student->student_id,
            'room_id' => $room->room_id,
            'semester_count' => 1,
            'archived_at' => null,
        ]);
        
        // Verify the student and booking are not archived
        $this->assertNull($student->archived_at);
        $this->assertNull($booking->fresh()->archived_at);
        
        // Archive the student
        $student->archive();
        
        // Verify the student is archived
        $this->assertNotNull($student->fresh()->archived_at);
        
        // Verify the booking is also archived
        $this->assertNotNull($booking->fresh()->archived_at);
    }

    /**
     * Test that restoring a student also restores their bookings.
     */
    public function test_restoring_student_restores_their_bookings(): void
    {
        // Create a tenant (dormitory)
        $tenant = Tenant::factory()->create();
        
        // Create a room
        $room = Room::factory()->create([
            'tenant_id' => $tenant->tenant_id,
            'room_number' => '102',
            'status' => 'occupied',
        ]);
        
        // Create a student
        $student = Student::factory()->create([
            'tenant_id' => $tenant->tenant_id,
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@example.com',
        ]);
        
        // Create a booking for the student
        $booking = Booking::factory()->create([
            'tenant_id' => $tenant->tenant_id,
            'student_id' => $student->student_id,
            'room_id' => $room->room_id,
            'semester_count' => 1,
            'archived_at' => null,
        ]);
        
        // Archive the student (and their booking)
        $student->archive();
        
        // Verify both are archived
        $this->assertNotNull($student->fresh()->archived_at);
        $this->assertNotNull($booking->fresh()->archived_at);
        
        // Restore the student
        $student->fresh()->restore();
        
        // Verify the student is restored
        $this->assertNull($student->fresh()->archived_at);
        
        // Verify the booking is also restored
        $this->assertNull($booking->fresh()->archived_at);
    }

    /**
     * Test that archiving a student with multiple bookings archives all of them.
     */
    public function test_archiving_student_archives_all_bookings(): void
    {
        // Create a tenant (dormitory)
        $tenant = Tenant::factory()->create();
        
        // Create rooms
        $room1 = Room::factory()->create([
            'tenant_id' => $tenant->tenant_id,
            'room_number' => '201',
        ]);
        
        $room2 = Room::factory()->create([
            'tenant_id' => $tenant->tenant_id,
            'room_number' => '202',
        ]);
        
        // Create a student
        $student = Student::factory()->create([
            'tenant_id' => $tenant->tenant_id,
            'first_name' => 'Bob',
            'last_name' => 'Johnson',
            'email' => 'bob.johnson@example.com',
        ]);
        
        // Create multiple bookings for the student
        $booking1 = Booking::factory()->create([
            'tenant_id' => $tenant->tenant_id,
            'student_id' => $student->student_id,
            'room_id' => $room1->room_id,
            'semester_count' => 1,
            'archived_at' => null,
        ]);
        
        $booking2 = Booking::factory()->create([
            'tenant_id' => $tenant->tenant_id,
            'student_id' => $student->student_id,
            'room_id' => $room2->room_id,
            'semester_count' => 2,
            'archived_at' => null,
        ]);
        
        // Archive the student
        $student->archive();
        
        // Verify all bookings are archived
        $this->assertNotNull($booking1->fresh()->archived_at);
        $this->assertNotNull($booking2->fresh()->archived_at);
    }
}
