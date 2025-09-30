<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SetupStudentPasswords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'students:setup-passwords
                            {--default-password= : Set a default password for all students (default: student123)}
                            {--email= : Setup password for a specific student email}
                            {--list : List all students without passwords}
                            {--auto : Automatically generate random passwords for all students without passwords}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup passwords for student accounts that don\'t have passwords set';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('list')) {
            $this->listStudentsWithoutPasswords();
            return;
        }

        if ($this->option('email')) {
            $this->setupPasswordForStudent($this->option('email'));
            return;
        }

        if ($this->option('auto')) {
            $this->setupPasswordsForAllStudents(true);
            return;
        }

        $this->setupPasswordsForAllStudents(false);
    }

    private function listStudentsWithoutPasswords()
    {
        $students = Student::whereNull('password')
            ->orWhere('password', '')
            ->get(['student_id', 'first_name', 'last_name', 'email']);

        if ($students->isEmpty()) {
            $this->info('No students found without passwords.');
            return;
        }

        $this->info('Students without passwords:');
        $this->table(
            ['ID', 'Name', 'Email'],
            $students->map(function ($student) {
                return [
                    $student->student_id,
                    $student->first_name . ' ' . $student->last_name,
                    $student->email,
                ];
            })
        );
    }

    private function setupPasswordForStudent($email)
    {
        $student = Student::where('email', $email)->first();

        if (!$student) {
            $this->error("Student with email {$email} not found.");
            return;
        }

        if (!empty($student->password)) {
            $this->warn("Student {$email} already has a password set.");
            return;
        }

        $password = $this->secret('Enter password for ' . $student->first_name . ' ' . $student->last_name . ' (' . $email . ')');
        
        if (empty($password)) {
            $this->error('Password cannot be empty.');
            return;
        }

        $student->update(['password' => Hash::make($password)]);
        $this->info("Password set successfully for {$student->first_name} {$student->last_name} ({$email})");
    }

    private function setupPasswordsForAllStudents($auto = false)
    {
        $students = Student::whereNull('password')
            ->orWhere('password', '')
            ->get();

        if ($students->isEmpty()) {
            $this->info('No students found without passwords.');
            return;
        }

        $defaultPassword = $this->option('default-password') ?: 'student123';
        $updated = 0;

        $this->info("Found {$students->count()} students without passwords.");

        if (!$auto && !$this->confirm("Set passwords for all {$students->count()} students?")) {
            $this->info('Operation cancelled.');
            return;
        }

        foreach ($students as $student) {
            if ($auto) {
                // Generate random password
                $password = Str::random(12);
                $this->line("Generated password for {$student->first_name} {$student->last_name} ({$student->email}): {$password}");
            } else {
                $password = $defaultPassword;
            }

            $student->update(['password' => Hash::make($password)]);
            $updated++;
        }

        $this->info("Successfully set passwords for {$updated} students.");
        
        if (!$auto) {
            $this->warn("Default password used: {$defaultPassword}");
            $this->warn('Please inform students to change their passwords after first login.');
        }
    }
}
