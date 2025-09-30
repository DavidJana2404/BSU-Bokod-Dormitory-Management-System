<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Student;
use App\Models\User;

echo "=== Checking Database Data ===\n";

echo "\n--- Users ---\n";
$users = User::take(3)->get(['id', 'name', 'email']);
foreach ($users as $user) {
    echo "User: {$user->name} (ID: {$user->id}, Email: {$user->email})\n";
}

echo "\n--- Students ---\n";
$students = Student::take(3)->get(['student_id', 'first_name', 'last_name', 'tenant_id']);
foreach ($students as $student) {
    echo "Student: {$student->first_name} {$student->last_name} (ID: {$student->student_id}, Tenant: '{$student->tenant_id}')\n";
}