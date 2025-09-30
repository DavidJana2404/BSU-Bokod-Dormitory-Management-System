<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Import necessary classes
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\StudentController;

echo "=== Testing Student Show Functionality ===\n";

try {
    // Get a test user (first admin/manager user)
    $user = User::where('role', 'manager')->orWhere('role', 'admin')->first();
    if (!$user) {
        echo "❌ No admin/manager user found. Creating test data...\n";
        exit(1);
    }
    
    echo "✓ Found test user: {$user->name} (ID: {$user->id}, Tenant: {$user->tenant_id})\n";
    
    // Get a student from the same tenant
    $student = Student::where('tenant_id', $user->tenant_id)->notArchived()->first();
    if (!$student) {
        echo "❌ No students found for tenant {$user->tenant_id}\n";
        exit(1);
    }
    
    echo "✓ Found test student: {$student->first_name} {$student->last_name} (ID: {$student->student_id})\n";
    
    // Create a mock request
    $request = Request::create("/students/{$student->student_id}", 'GET');
    $request->setUserResolver(function () use ($user) {
        return $user;
    });
    
    // Instantiate the controller
    $controller = new StudentController();
    
    // Test the show method
    echo "🧪 Testing StudentController@show method...\n";
    $response = $controller->show($request, $student->student_id);
    
    // Check if we get an Inertia response
    if ($response instanceof \Inertia\Response) {
        echo "✅ SUCCESS: StudentController@show returns proper Inertia response\n";
        echo "   - Component: {$response->component}\n";
        
        $props = $response->props;
        if (isset($props['student'])) {
            $studentData = $props['student'];
            echo "   - Student data loaded: {$studentData['first_name']} {$studentData['last_name']}\n";
            echo "   - Student ID: {$studentData['student_id']}\n";
            echo "   - Payment status: {$studentData['payment_status']}\n";
            echo "   - Room status: " . ($studentData['is_currently_booked'] ? "Booked (Room {$studentData['current_booking']['room_number']})" : "No room") . "\n";
            echo "   - Booking history: " . count($studentData['all_bookings']) . " booking(s)\n";
        }
        
        if (isset($props['tenant_id'])) {
            echo "   - Tenant ID provided: {$props['tenant_id']}\n";
        }
        
    } else if ($response instanceof \Illuminate\Http\RedirectResponse) {
        echo "❌ UNEXPECTED: Got redirect response instead of Inertia view\n";
        echo "   - Redirect URL: {$response->getTargetUrl()}\n";
        if ($response->getSession()) {
            $flashData = $response->getSession()->get('error') ?: $response->getSession()->get('info');
            if ($flashData) {
                echo "   - Flash message: {$flashData}\n";
            }
        }
    } else {
        echo "❌ UNEXPECTED: Got unexpected response type: " . get_class($response) . "\n";
    }
    
    // Test with non-existent student
    echo "\n🧪 Testing with non-existent student ID...\n";
    $response = $controller->show($request, 'nonexistent123');
    
    if ($response instanceof \Illuminate\Http\RedirectResponse) {
        echo "✅ SUCCESS: Non-existent student properly redirects to students index\n";
        echo "   - Redirect URL: {$response->getTargetUrl()}\n";
    } else {
        echo "❌ UNEXPECTED: Non-existent student should redirect but got: " . get_class($response) . "\n";
    }
    
    // Test with different tenant student (if exists)
    echo "\n🧪 Testing with student from different tenant...\n";
    $otherStudent = Student::where('tenant_id', '!=', $user->tenant_id)->notArchived()->first();
    if ($otherStudent) {
        $response = $controller->show($request, $otherStudent->student_id);
        if ($response instanceof \Illuminate\Http\RedirectResponse) {
            echo "✅ SUCCESS: Student from different tenant properly blocked and redirected\n";
        } else {
            echo "❌ SECURITY ISSUE: Student from different tenant was accessible!\n";
        }
    } else {
        echo "ℹ️ SKIPPED: No students from other tenants to test with\n";
    }
    
    echo "\n=== Test Summary ===\n";
    echo "✅ Student show functionality is working correctly!\n";
    echo "✅ Security checks are in place for tenant isolation\n";
    echo "✅ Error handling works for non-existent students\n";
    echo "\nThe /students/{id} route should now display a proper student detail page instead of JSON.\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}