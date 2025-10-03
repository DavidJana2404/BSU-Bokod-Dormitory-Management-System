<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminSetupController extends Controller
{
    /**
     * Promote the first user to admin (temporary endpoint for initial setup)
     * This should be removed after initial admin setup
     */
    public function promoteFirstUserToAdmin(Request $request)
    {
        // Security check: Only allow if no admin exists yet
        if (User::where('role', 'admin')->exists()) {
            return response()->json([
                'error' => 'Admin user already exists. This endpoint is disabled.'
            ], 403);
        }

        // Get the first user (oldest by ID)
        $firstUser = User::orderBy('id')->first();
        
        if (!$firstUser) {
            return response()->json([
                'error' => 'No users found in the system.'
            ], 404);
        }

        // Promote to admin
        $firstUser->update(['role' => 'admin']);

        return response()->json([
            'success' => true,
            'message' => "User '{$firstUser->name}' ({$firstUser->email}) has been promoted to admin.",
            'user' => [
                'id' => $firstUser->id,
                'name' => $firstUser->name,
                'email' => $firstUser->email,
                'role' => $firstUser->role,
            ]
        ]);
    }

    /**
     * Promote specific user to admin by email (with basic security)
     */
    public function promoteUserByEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'setup_key' => 'required|string'
        ]);

        // Basic security check - you can change this key
        $expectedKey = env('ADMIN_SETUP_KEY', 'admin-setup-2024');
        if ($request->setup_key !== $expectedKey) {
            return response()->json(['error' => 'Invalid setup key'], 403);
        }

        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $oldRole = $user->role;
        $user->update(['role' => 'admin']);

        return response()->json([
            'success' => true,
            'message' => "User '{$user->name}' ({$user->email}) has been promoted from {$oldRole} to admin.",
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }
}