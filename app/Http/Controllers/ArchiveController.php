<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\Student;
use App\Models\Booking;
use App\Models\Tenant;
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
            $archivedDormitories = Tenant::archived()
                ->get()
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
                
            // Admin sees NO rooms, students, or bookings in archive
            // These are managed by individual managers
            $archivedRooms = collect();
        } else {
            // Managers cannot see dormitories (they don't manage dormitories)
            $archivedDormitories = collect();
            
            // Manager can only see rooms from their own tenant
            $archivedRooms = Room::where('tenant_id', $user->tenant_id)
                ->archived()
                ->get()
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
            // Admin sees NO students or bookings in archive
            // These are managed by individual managers within their dormitories
            $archivedStudents = collect();
            $archivedBookings = collect();
        } else {
            // Manager can only see students and bookings from their own tenant
            $archivedStudents = Student::where('tenant_id', $user->tenant_id)
                ->archived()
                ->get()
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
                
            $archivedBookings = Booking::where('tenant_id', $user->tenant_id)
                ->archived()
                ->with(['student', 'room'])
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
            
        // Combine all archived items and sort by archived date
        $archivedItems = collect()
            ->merge($archivedDormitories)
            ->merge($archivedRooms)
            ->merge($archivedStudents)
            ->merge($archivedBookings)
            ->sortByDesc('archived_at')
            ->values();
            
        return Inertia::render('settings/archive', [
            'archivedItems' => $archivedItems,
            'stats' => [
                'dormitories' => $archivedDormitories->count(),
                'rooms' => $archivedRooms->count(),
                'students' => $archivedStudents->count(),
                'bookings' => $archivedBookings->count(),
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
            case 'room':
                $item = Room::findOrFail($id);
                break;
            case 'student':
                $item = Student::findOrFail($id);
                break;
            case 'booking':
                $item = Booking::findOrFail($id);
                break;
            default:
                return redirect()->back()->with('error', 'Invalid item type.');
        }
        
        // Check if user has access to this item based on role
        if ($user->role === 'admin') {
            // Admin can only restore dormitories
            if ($type !== 'dormitory') {
                return redirect()->back()->with('error', 'Unauthorized action. Admins can only restore dormitories.');
            }
        } else {
            // Manager can restore rooms, students, bookings from their tenant (but not dormitories)
            if ($type === 'dormitory') {
                return redirect()->back()->with('error', 'Unauthorized action. Managers cannot manage dormitories.');
            }
            if ($item->tenant_id !== $user->tenant_id) {
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
            case 'room':
                $item = Room::findOrFail($id);
                break;
            case 'student':
                $item = Student::findOrFail($id);
                break;
            case 'booking':
                $item = Booking::findOrFail($id);
                break;
            default:
                return redirect()->back()->with('error', 'Invalid item type.');
        }
        
        // Check if user has access to this item based on role
        if ($user->role === 'admin') {
            // Admin can only delete dormitories
            if ($type !== 'dormitory') {
                return redirect()->back()->with('error', 'Unauthorized action. Admins can only delete dormitories.');
            }
        } else {
            // Manager can delete rooms, students, bookings from their tenant (but not dormitories)
            if ($type === 'dormitory') {
                return redirect()->back()->with('error', 'Unauthorized action. Managers cannot manage dormitories.');
            }
            if ($item->tenant_id !== $user->tenant_id) {
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
            // Admin can only clear dormitories (system-wide)
            $deletedCount = Tenant::archived()->count();
            Tenant::archived()->forceDelete();
        } else {
            // Manager can clear rooms, students, bookings from their tenant
            $roomsCount = Room::where('tenant_id', $user->tenant_id)->archived()->count();
            $studentsCount = Student::where('tenant_id', $user->tenant_id)->archived()->count();
            $bookingsCount = Booking::where('tenant_id', $user->tenant_id)->archived()->count();
            
            $deletedCount = $roomsCount + $studentsCount + $bookingsCount;
            
            // Force delete all archived items for this tenant
            Room::where('tenant_id', $user->tenant_id)->archived()->forceDelete();
            Student::where('tenant_id', $user->tenant_id)->archived()->forceDelete();
            Booking::where('tenant_id', $user->tenant_id)->archived()->forceDelete();
        }
        
        $message = $deletedCount > 0 
            ? "Successfully cleared {$deletedCount} archived item(s)." 
            : "No archived items to clear.";
            
        return redirect()->back()->with('success', $message);
    }
}
