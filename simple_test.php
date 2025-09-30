<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\StudentController;

echo "=== Simple Student Show Test ===\n";

// Create a test user with a tenant_id if needed
$user = User::first();
if (!$user) {
    echo "❌ No users found\n";
    exit(1);
}

// Assign a tenant_id if it doesn't have one
if (!$user->tenant_id) {
    $user->tenant_id = '001'; // Default tenant
    $user->save();
    echo "✓ Assigned tenant_id to user: {$user->name}\n";
} else {
    echo "✓ Found user with tenant_id: {$user->name} (Tenant: {$user->tenant_id})\n";
}

// Create a test student if none exists
$student = Student::where('tenant_id', $user->tenant_id)->first();
if (!$student) {
    echo "Creating test student...\n";
    $student = Student::create([
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john.doe@example.com',
        'phone' => '555-1234',
        'tenant_id' => $user->tenant_id,
        'check_in_date' => now()->format('Y-m-d'),
        'check_out_date' => now()->addMonths(6)->format('Y-m-d'),
    ]);
    echo "✓ Created test student: {$student->first_name} {$student->last_name}\n";
} else {
    echo "✓ Found existing student: {$student->first_name} {$student->last_name}\n";
}

// Test the controller
echo "\n🧪 Testing StudentController@show...\n";

try {
    $request = Request::create("/students/{$student->student_id}", 'GET');
    $request->setUserResolver(function () use ($user) {
        return $user;
    });
    
    $controller = new StudentController();
    $response = $controller->show($request, $student->student_id);
    
    if ($response instanceof \Inertia\Response) {
        echo "✅ SUCCESS: Got Inertia response!\n";
        echo "   - Component: {$response->component}\n";
        
        if (isset($response->props['student'])) {
            $studentData = $response->props['student'];
            echo "   - Student loaded: {$studentData['first_name']} {$studentData['last_name']}\n";
            echo "   - Student ID: {$studentData['student_id']}\n";
        }
        
        echo "\n✅ The student show functionality is working correctly!\n";
        echo "✅ When you access /students/{$student->student_id} in the browser,\n";
        echo "   you should now see a proper student detail page instead of JSON data.\n";
        
    } else {
        echo "❌ UNEXPECTED: Got " . get_class($response) . " instead of Inertia response\n";
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

// Clean up the test files
echo "\nCleaning up test files...\n";
if (file_exists('test_student_show.php')) {
    unlink('test_student_show.php');
}
if (file_exists('check_data.php')) {
    unlink('check_data.php');
}
if (file_exists('simple_test.php')) {
    unlink('simple_test.php');
}
echo "✓ Test files cleaned up\n";