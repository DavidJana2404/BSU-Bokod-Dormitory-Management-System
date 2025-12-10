<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\Student;
use App\Models\Booking;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Application;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class ArchiveController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Cashiers are not allowed to access archive functionality
        if ($user->role === 'cashier') {
            abort(403, 'Access denied. Cashiers do not have access to archive functionality.');
        }
        
        if ($user->role === 'admin') {
            // Admin can see archived dormitories (system-wide)
            $archivedDormitoriesQuery = Tenant::query();
            if (Schema::hasColumn('tenants', 'archived_at')) {
                $archivedDormitoriesQuery->whereNotNull('archived_at');
            }
            $archivedDormitories = $archivedDormitoriesQuery->get()
                ->map(function ($dormitory) {
                    return [
                        'id' => $dormitory->tenant_id,
                        'type' => 'dormitory',
                        'title' => $dormitory->dormitory_name,
                        'subtitle' => $dormitory->address . ' - ' . $dormitory->contact_number,
                        'archived_at' => $dormitory->archived_at,
                        'data' => $dormitory,
                    ];
                });
            
            // Admin can see archived staff users (managers and cashiers)
            $archivedUsersQuery = User::whereIn('role', ['manager', 'cashier']);
            if (Schema::hasColumn('users', 'archived_at')) {
                $archivedUsersQuery->whereNotNull('archived_at');
            } else {
                // If archived_at column doesn't exist, return empty collection
                $archivedUsersQuery->whereRaw('1 = 0');
            }
            $archivedUsers = $archivedUsersQuery->with('tenant')
                ->get()
                ->map(function ($staffUser) {
                    return [
                        'id' => $staffUser->id,
                        'type' => 'user',
                        'title' => $staffUser->name,
                        'subtitle' => $staffUser->email . ' - ' . ucfirst($staffUser->role) . ($staffUser->tenant ? ' (' . $staffUser->tenant->dormitory_name . ')' : ''),
                        'archived_at' => $staffUser->archived_at ?? null,
                        'data' => $staffUser,
                    ];
                });
                
            // Admin sees NO rooms in archive
            // These are managed by individual managers
            $archivedRooms = collect();
        } else {
            // Managers cannot see dormitories or staff users
            $archivedDormitories = collect();
            $archivedUsers = collect();
            
            // Manager can only see rooms from their own tenant
            $archivedRoomsQuery = Room::where('tenant_id', $user->tenant_id);
            if (Schema::hasColumn('rooms', 'archived_at')) {
                $archivedRoomsQuery->whereNotNull('archived_at');
            }
            $archivedRooms = $archivedRoomsQuery->get()
                ->map(function ($room) {
                    return [
                        'id' => $room->room_id,
                        'type' => 'room',
                        'title' => 'Room ' . $room->room_number,
                        'subtitle' => ucfirst($room->type) . ' - $' . $room->price_per_semester,
                        'archived_at' => $room->archived_at,
                        'data' => $room,
                    ];
                });
        }
        
        // Handle students and bookings based on user role
        if ($user->role === 'admin') {
            // Admin can see all archived students (system-wide)
            $archivedStudentsQuery = Student::query();
            if (Schema::hasColumn('students', 'archived_at')) {
                $archivedStudentsQuery->whereNotNull('archived_at');
            }
            $archivedStudents = $archivedStudentsQuery->with(['tenant'])
                ->get()
                ->map(function ($student) {
                    return [
                        'id' => $student->student_id,
                        'type' => 'student',
                        'title' => $student->first_name . ' ' . $student->last_name,
                        'subtitle' => $student->email . ($student->tenant ? ' - ' . $student->tenant->dormitory_name : ''),
                        'archived_at' => $student->archived_at,
                        'data' => $student,
                    ];
                });
            
            // Admin does NOT see bookings - those are managed by individual managers
            $archivedBookings = collect();
        } else {
            // Manager can only see students and bookings from their own tenant
            $archivedStudentsQuery = Student::where('tenant_id', $user->tenant_id);
            if (Schema::hasColumn('students', 'archived_at')) {
                $archivedStudentsQuery->whereNotNull('archived_at');
            }
            $archivedStudents = $archivedStudentsQuery->get()
                ->map(function ($student) {
                    return [
                        'id' => $student->student_id,
                        'type' => 'student',
                        'title' => $student->first_name . ' ' . $student->last_name,
                        'subtitle' => $student->email,
                        'archived_at' => $student->archived_at,
                        'data' => $student,
                    ];
                });
                
            $archivedBookingsQuery = Booking::where('tenant_id', $user->tenant_id);
            if (Schema::hasColumn('bookings', 'archived_at')) {
                $archivedBookingsQuery->whereNotNull('archived_at');
            }
            $archivedBookings = $archivedBookingsQuery->with(['student', 'room'])
                ->get()
                ->map(function ($booking) {
                    return [
                        'id' => $booking->booking_id,
                        'type' => 'booking',
                        'title' => 'Booking #' . $booking->booking_id,
                        'subtitle' => ($booking->student ? $booking->student->first_name . ' ' . $booking->student->last_name : 'Unknown Student') . 
                                     ' - Room ' . ($booking->room ? $booking->room->room_number : 'Unknown'),
                        'archived_at' => $booking->archived_at,
                        'data' => $booking,
                    ];
                });
        }
        
        // Handle archived applications based on user role
        if ($user->role === 'admin') {
            // Admin can see all archived applications (system-wide)
            $archivedApplicationsQuery = Application::query();
            if (Schema::hasColumn('applications', 'archived_at')) {
                $archivedApplicationsQuery->whereNotNull('archived_at');
            }
            $archivedApplications = $archivedApplicationsQuery->with(['tenant'])
                ->get()
                ->map(function ($application) {
                    return [
                        'id' => $application->id,
                        'type' => 'application',
                        'title' => $application->first_name . ' ' . $application->last_name,
                        'subtitle' => $application->email . ' - ' . ucfirst($application->status) . ($application->tenant ? ' (' . $application->tenant->dormitory_name . ')' : ''),
                        'archived_at' => $application->archived_at,
                        'data' => $application,
                    ];
                });
        } else {
            // Manager can only see applications from their own tenant
            $archivedApplicationsQuery = Application::where('tenant_id', $user->tenant_id);
            if (Schema::hasColumn('applications', 'archived_at')) {
                $archivedApplicationsQuery->whereNotNull('archived_at');
            }
            $archivedApplications = $archivedApplicationsQuery->get()
                ->map(function ($application) {
                    return [
                        'id' => $application->id,
                        'type' => 'application',
                        'title' => $application->first_name . ' ' . $application->last_name,
                        'subtitle' => $application->email . ' - ' . ucfirst($application->status),
                        'archived_at' => $application->archived_at,
                        'data' => $application,
                    ];
                });
        }
            
        // Combine all archived items and sort by archived date
        $archivedItems = collect()
            ->merge($archivedDormitories)
            ->merge($archivedUsers ?? collect())
            ->merge($archivedRooms)
            ->merge($archivedStudents)
            ->merge($archivedBookings)
            ->merge($archivedApplications)
            ->sortByDesc('archived_at')
            ->values();
            
        return Inertia::render('settings/archive', [
            'archivedItems' => $archivedItems,
            'stats' => [
                'dormitories' => $archivedDormitories->count(),
                'users' => isset($archivedUsers) ? $archivedUsers->count() : 0,
                'rooms' => $archivedRooms->count(),
                'students' => $archivedStudents->count(),
                'bookings' => $archivedBookings->count(),
                'applications' => $archivedApplications->count(),
                'total' => $archivedItems->count(),
            ],
        ]);
    }
    
    public function restore(Request $request, $type, $id)
    {
        $user = $request->user();
        
        // Cashiers are not allowed to access archive functionality
        if ($user->role === 'cashier') {
            abort(403, 'Access denied. Cashiers do not have access to archive functionality.');
        }
        
        switch ($type) {
            case 'dormitory':
                if ($user->role !== 'admin') {
                    return redirect()->back()->with('error', 'Unauthorized action.');
                }
                $item = Tenant::findOrFail($id);
                break;
            case 'user':
                if ($user->role !== 'admin') {
                    return redirect()->back()->with('error', 'Unauthorized action.');
                }
                $item = User::findOrFail($id);
                break;
            case 'room':
                $item = Room::findOrFail($id);
                break;
            case 'student':
                $item = Student::findOrFail($id);
                break;
            case 'booking':
                $item = Booking::findOrFail($id);
                break;
            case 'application':
                $item = Application::findOrFail($id);
                break;
            default:
                return redirect()->back()->with('error', 'Invalid item type.');
        }
        
        // Check if user has access to this item based on role
        if ($user->role === 'admin') {
            // Admin can restore dormitories, users, students, and applications (system-wide, but not bookings)
            if ($type !== 'dormitory' && $type !== 'user' && $type !== 'student' && $type !== 'application') {
                return redirect()->back()->with('error', 'Unauthorized action. Admins can only restore dormitories, staff users, students, and applications.');
            }
        } else {
            // Manager can restore rooms, students, bookings, applications from their tenant (but not dormitories)
            if ($type === 'dormitory') {
                return redirect()->back()->with('error', 'Unauthorized action. Managers cannot manage dormitories.');
            }
            if (isset($item->tenant_id) && $item->tenant_id !== $user->tenant_id) {
                return redirect()->back()->with('error', 'Unauthorized action.');
            }
        }
        
        $item->restore();
        
        return redirect()->back()->with('success', ucfirst($type) . ' restored successfully.');
    }
    
    public function forceDelete(Request $request, $type, $id)
    {
        $user = $request->user();
        
        // Cashiers are not allowed to access archive functionality
        if ($user->role === 'cashier') {
            abort(403, 'Access denied. Cashiers do not have access to archive functionality.');
        }
        
        switch ($type) {
            case 'dormitory':
                if ($user->role !== 'admin') {
                    return redirect()->back()->with('error', 'Unauthorized action.');
                }
                $item = Tenant::findOrFail($id);
                break;
            case 'user':
                if ($user->role !== 'admin') {
                    return redirect()->back()->with('error', 'Unauthorized action.');
                }
                $item = User::findOrFail($id);
                break;
            case 'room':
                $item = Room::findOrFail($id);
                break;
            case 'student':
                $item = Student::findOrFail($id);
                break;
            case 'booking':
                $item = Booking::findOrFail($id);
                break;
            case 'application':
                $item = Application::findOrFail($id);
                break;
            default:
                return redirect()->back()->with('error', 'Invalid item type.');
        }
        
        // Check if user has access to this item based on role
        if ($user->role === 'admin') {
            // Admin can delete dormitories, users, students, and applications (system-wide, but not bookings)
            if ($type !== 'dormitory' && $type !== 'user' && $type !== 'student' && $type !== 'application') {
                return redirect()->back()->with('error', 'Unauthorized action. Admins can only delete dormitories, staff users, students, and applications.');
            }
        } else {
            // Manager can delete rooms, students, bookings, applications from their tenant (but not dormitories)
            if ($type === 'dormitory') {
                return redirect()->back()->with('error', 'Unauthorized action. Managers cannot manage dormitories.');
            }
            if (isset($item->tenant_id) && $item->tenant_id !== $user->tenant_id) {
                return redirect()->back()->with('error', 'Unauthorized action.');
            }
        }
        
        $item->forceDelete();
        
        return redirect()->back()->with('success', ucfirst($type) . ' permanently deleted.');
    }
    
    public function clearAll(Request $request)
    {
        $user = $request->user();
        
        // Cashiers are not allowed to access archive functionality
        if ($user->role === 'cashier') {
            abort(403, 'Access denied. Cashiers do not have access to archive functionality.');
        }
        
        $deletedCount = 0;
        
        if ($user->role === 'admin') {
            // Admin can clear dormitories, users, students, and applications (system-wide, but not bookings)
            $dormitoriesQuery = Tenant::query();
            if (Schema::hasColumn('tenants', 'archived_at')) {
                $dormitoriesQuery->whereNotNull('archived_at');
            }
            $dormitoriesCount = $dormitoriesQuery->count();
            
            $usersQuery = User::whereIn('role', ['manager', 'cashier']);
            if (Schema::hasColumn('users', 'archived_at')) {
                $usersQuery->whereNotNull('archived_at');
            } else {
                $usersQuery->whereRaw('1 = 0');
            }
            $usersCount = $usersQuery->count();
            
            $studentsQuery = Student::query();
            if (Schema::hasColumn('students', 'archived_at')) {
                $studentsQuery->whereNotNull('archived_at');
            }
            $studentsCount = $studentsQuery->count();
            
            $applicationsQuery = Application::query();
            if (Schema::hasColumn('applications', 'archived_at')) {
                $applicationsQuery->whereNotNull('archived_at');
            }
            $applicationsCount = $applicationsQuery->count();
            
            $deletedCount = $dormitoriesCount + $usersCount + $studentsCount + $applicationsCount;
            
            // Force delete all archived items system-wide
            if (Schema::hasColumn('tenants', 'archived_at')) {
                Tenant::whereNotNull('archived_at')->delete();
            }
            if (Schema::hasColumn('users', 'archived_at')) {
                User::whereIn('role', ['manager', 'cashier'])->whereNotNull('archived_at')->delete();
            }
            if (Schema::hasColumn('students', 'archived_at')) {
                Student::whereNotNull('archived_at')->delete();
            }
            if (Schema::hasColumn('applications', 'archived_at')) {
                Application::whereNotNull('archived_at')->delete();
            }
        } else {
            // Manager can clear rooms, students, bookings, applications from their tenant
            $roomsQuery = Room::where('tenant_id', $user->tenant_id);
            if (Schema::hasColumn('rooms', 'archived_at')) {
                $roomsQuery->whereNotNull('archived_at');
            }
            $roomsCount = $roomsQuery->count();
            
            $studentsQuery = Student::where('tenant_id', $user->tenant_id);
            if (Schema::hasColumn('students', 'archived_at')) {
                $studentsQuery->whereNotNull('archived_at');
            }
            $studentsCount = $studentsQuery->count();
            
            $bookingsQuery = Booking::where('tenant_id', $user->tenant_id);
            if (Schema::hasColumn('bookings', 'archived_at')) {
                $bookingsQuery->whereNotNull('archived_at');
            }
            $bookingsCount = $bookingsQuery->count();
            
            $applicationsQuery = Application::where('tenant_id', $user->tenant_id);
            if (Schema::hasColumn('applications', 'archived_at')) {
                $applicationsQuery->whereNotNull('archived_at');
            }
            $applicationsCount = $applicationsQuery->count();
            
            $deletedCount = $roomsCount + $studentsCount + $bookingsCount + $applicationsCount;
            
            // Force delete all archived items for this tenant
            if (Schema::hasColumn('rooms', 'archived_at')) {
                Room::where('tenant_id', $user->tenant_id)->whereNotNull('archived_at')->delete();
            }
            if (Schema::hasColumn('students', 'archived_at')) {
                Student::where('tenant_id', $user->tenant_id)->whereNotNull('archived_at')->delete();
            }
            if (Schema::hasColumn('bookings', 'archived_at')) {
                Booking::where('tenant_id', $user->tenant_id)->whereNotNull('archived_at')->delete();
            }
            if (Schema::hasColumn('applications', 'archived_at')) {
                Application::where('tenant_id', $user->tenant_id)->whereNotNull('archived_at')->delete();
            }
        }
        
        $message = $deletedCount > 0 
            ? "Successfully cleared {$deletedCount} archived item(s)." 
            : "No archived items to clear.";
            
        return redirect()->back()->with('success', $message);
    }
}
