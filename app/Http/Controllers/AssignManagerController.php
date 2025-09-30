<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\User;
use Inertia\Inertia;

class AssignManagerController extends Controller
{
    public function index()
    {

        //get all the managers
        $managers = User::where('role', 'manager')->get();

        //get all the dormitories
        $dormitories = Tenant::all();

        //prepare manager assignments
        $managerAssignments = $managers->map(function ($manager) use ($dormitories) {
            $dormitory = $manager->tenant_id
            ? $dormitories->firstWhere('tenant_id', $manager->tenant_id)
            : null;
            
            return [
                'id' => $manager->id,
                'name' => $manager->name,
                'email' => $manager->email,
                'is_active' => $manager->is_active,
                'dormitory' => $dormitory ? [
                    'tenant_id' => $dormitory->tenant_id,
                    'dormitory_name' => $dormitory->dormitory_name,
                ] : null,
            ];
        });

        $dormitoryAssignments = $dormitories->map(function ($dormitory) use ($managers) {
            $manager = $managers->firstWhere('tenant_id', $dormitory->tenant_id);
            return [
                'tenant_id' => $dormitory->tenant_id,
                'dormitory_name' => $dormitory->dormitory_name,
                'manager' => $manager ? [
                    'id' => $manager->id,
                    'name' => $manager->name,
                    'email' => $manager->email,
                ] : null,
            ];
        });

        return Inertia::render('assign-manager', [
            'managers' => $managerAssignments,
            'dormitories' => $dormitoryAssignments,
        ]);

    }

    public function assign(Request $request, $managerId)
{
    $request->validate([
        'tenant_id' => 'required|exists:tenants,tenant_id',
    ]);

    $manager = User::where('role', 'manager')
        ->where('id', $managerId)
        ->firstOrFail();

    $manager->tenant_id = $request->tenant_id;
    $manager->save();

    return redirect()->route('assign-manager');
}

public function unassign($managerId)
{
    $manager = User::where('role', 'manager')
        ->where('id', $managerId)
        ->firstOrFail();

    $manager->tenant_id = null;
    $manager->save();

    return redirect()->route('assign-manager');
}


public function toggleActive($id)
{
    $user = User::findOrFail($id);
    $user->is_active = !$user->is_active;
    $user->save();

    return back()->with('success', 'User status updated successfully!');
}

}
