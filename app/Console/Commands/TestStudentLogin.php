<?php

namespace App\Console\Commands;

use App\Models\Student;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class TestStudentLogin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'student:setup {action=list} {email?} {password?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup and test student login functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');
        
        switch ($action) {
            case 'list':
                $this->listStudents();
                break;
            case 'set-password':
                $this->setStudentPassword();
                break;
            case 'create':
                $this->createTestStudent();
                break;
            case 'test-login':
                $this->testStudentLogin();
                break;
            default:
                $this->error('Invalid action. Available actions: list, set-password, create, test-login');
        }
    }
    
    private function listStudents()
    {
        $students = Student::select('student_id', 'first_name', 'last_name', 'email', 'password')->get();
        
        $this->info('Current students with login status:');
        $this->line('');
        
        if ($students->isEmpty()) {
            $this->warn('No students found.');
            return;
        }
        
        $headers = ['ID', 'Name', 'Email', 'Login Status'];
        $rows = [];
        
        foreach ($students as $student) {
            $loginStatus = $student->password ? '✓ Can Login' : '✗ No Password';
            $rows[] = [
                $student->student_id,
                $student->first_name . ' ' . $student->last_name,
                $student->email,
                $loginStatus
            ];
        }
        
        $this->table($headers, $rows);
        $this->line('');
        $this->comment('To set a password for a student: php artisan student:setup set-password student@example.com newpassword');
    }
    
    private function setStudentPassword()
    {
        $email = $this->argument('email') ?? $this->ask('Enter student email');
        $password = $this->argument('password') ?? $this->secret('Enter new password');
        
        if (!$email || !$password) {
            $this->error('Email and password are required.');
            return;
        }
        
        $student = Student::where('email', $email)->first();
        
        if (!$student) {
            $this->error('Student not found with email: ' . $email);
            return;
        }
        
        $student->update(['password' => Hash::make($password)]);
        
        $this->info("Password set successfully for student: {$student->first_name} {$student->last_name}");
        $this->comment("Student can now login at: /login using email: {$email}");
    }
    
    private function createTestStudent()
    {
        $email = $this->ask('Enter student email', 'student@test.com');
        $firstName = $this->ask('Enter first name', 'Test');
        $lastName = $this->ask('Enter last name', 'Student');
        $phone = $this->ask('Enter phone number', '1234567890');
        $password = $this->secret('Enter password for login');
        
        if (Student::where('email', $email)->exists()) {
            $this->error('A student with this email already exists.');
            return;
        }
        
        $student = Student::create([
            'tenant_id' => 1, // Default tenant
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'password' => Hash::make($password),
        ]);
        
        $this->info("Test student created successfully!");
        $this->line("ID: {$student->student_id}");
        $this->line("Name: {$firstName} {$lastName}");
        $this->line("Email: {$email}");
        $this->comment("Student can login at: /login");
    }
    
    private function testStudentLogin()
    {
        $email = $this->ask('Enter student email to test');
        $password = $this->secret('Enter password');
        
        $student = Student::where('email', $email)->first();
        
        if (!$student) {
            $this->error('Student not found with email: ' . $email);
            return;
        }
        
        if (!$student->password) {
            $this->error('Student has no password set.');
            return;
        }
        
        if (Hash::check($password, $student->password)) {
            $this->info('✓ Password check successful!');
            
            // Test manual authentication
            Auth::login($student);
            if (Auth::check()) {
                $this->info('✓ Auth::login() successful!');
                $this->info('Authenticated user: ' . Auth::user()->email);
                $this->info('User model type: ' . get_class(Auth::user()));
                
                // Test session
                session(['user_type' => 'student']);
                $this->info('✓ Session user_type set to: ' . session('user_type'));
                
                Auth::logout();
                $this->info('✓ Test completed successfully!');
            } else {
                $this->error('✗ Auth::login() failed');
            }
        } else {
            $this->error('✗ Password check failed');
        }
    }
}
