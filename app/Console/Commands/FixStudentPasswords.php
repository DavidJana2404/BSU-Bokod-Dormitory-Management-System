<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;

class FixStudentPasswords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-student-passwords';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and fix student accounts that have null passwords';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking student accounts...');
        
        $students = Student::all();
        $this->info('Found ' . $students->count() . ' student accounts');
        
        foreach ($students as $student) {
            $this->info('Student ID: ' . $student->student_id . ', Email: ' . $student->email . ', Has Password: ' . ($student->password ? 'Yes' : 'No'));
            
            if (!$student->password) {
                $this->warn('Student ' . $student->email . ' has no password - this will prevent login');
                
                if ($this->confirm('Do you want to set a default password for ' . $student->email . '?')) {
                    $defaultPassword = 'student123';
                    $student->password = Hash::make($defaultPassword);
                    $student->save();
                    $this->info('Set default password "' . $defaultPassword . '" for ' . $student->email);
                }
            }
        }
        
        $this->info('Student password check completed.');
    }
}
