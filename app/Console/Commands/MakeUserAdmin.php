<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeUserAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:make-admin {email : The email address of the user to promote}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Promote a user to admin role by email address';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        // Find the user by email
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email '{$email}' not found.");
            return Command::FAILURE;
        }
        
        // Check if user is already admin
        if ($user->role === 'admin') {
            $this->info("User '{$user->name}' ({$email}) is already an admin.");
            return Command::SUCCESS;
        }
        
        // Update user role to admin
        $user->update(['role' => 'admin']);
        
        $this->info("Successfully promoted '{$user->name}' ({$email}) to admin role.");
        
        return Command::SUCCESS;
    }
}
