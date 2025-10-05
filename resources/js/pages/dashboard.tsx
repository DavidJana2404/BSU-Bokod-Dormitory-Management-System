


import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDesc } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Bed, CalendarCheck2, Building2, UserCog, AlertTriangle } from 'lucide-react';
import React from 'react';

interface Room {
    room_id: number;
    room_number: string;
    type: string;
    price_per_semester: string;
    status: string;
}

interface CurrentStudent {
    student_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    semester_count: number;
}

interface DetailedRoom {
    room_id: number;
    room_number: string;
    type: string;
    price_per_semester: string;
    status: string;
    max_capacity: number;
    current_occupancy: number;
    available_capacity: number;
    is_at_capacity: boolean;
    current_students: CurrentStudent[];
    current_student: CurrentStudent | null; // Keep for backward compatibility
}

interface Dormitory {
    tenant_id: number;
    dormitory_name: string;
    address: string;
    contact_number: string;
    rooms: Room[];
}

export default function Dashboard() {
    const { isAdmin, dormitories, dormitory, studentsCount, roomsCount, bookingsCount, totalDormitories, totalRooms, totalManagers, totalStudents, rooms, auth, error } = usePage().props as unknown as any;
    const user = auth?.user;
    
    // Show error message if there's a server error
    if (error) {
        return (
            <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
                <Head title="Dashboard" />
                <div className="p-6">
                    <Alert variant="destructive" className="max-w-2xl mx-auto">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                </div>
            </AppLayout>
        );
    }
    
    if (user?.role === 'manager' && !user?.tenant_id) {
        return (
            <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
                <Head title="Dashboard" />
                <div className="flex items-center justify-center min-h-[60vh] p-6">
                    <Card className="p-8 text-center max-w-lg">
                        <CardHeader>
                            <CardTitle className="text-xl">No Assigned Dormitory</CardTitle>
                            <CardDesc>You are currently not assigned as a manager to any dormitory.</CardDesc>
                        </CardHeader>
                    </Card>
                </div>
            </AppLayout>
        );
    }


    if (isAdmin) {
        const safeDormitories: Dormitory[] = Array.isArray(dormitories) ? dormitories : [];
        return (
            <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
                <Head title="Admin Dashboard" />
                <div className="p-6 space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Building2 className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                        </div>
                        <p className="text-muted-foreground mb-8">Comprehensive overview of all dormitories and system metrics</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="p-6 text-center bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Building2 className="text-blue-600 dark:text-blue-400" size={28} />
                            </div>
                            <div className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Total Dormitories</div>
                            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalDormitories ?? 0}</div>
                        </Card>
                        <Card className="p-6 text-center bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Bed className="text-green-600 dark:text-green-400" size={28} />
                            </div>
                            <div className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">Total Rooms</div>
                            <div className="text-3xl font-bold text-green-900 dark:text-green-100">{totalRooms ?? 0}</div>
                        </Card>
                        <Card className="p-6 text-center bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <UserCog className="text-purple-600 dark:text-purple-400" size={28} />
                            </div>
                            <div className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-200">Total Managers</div>
                            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{totalManagers ?? 0}</div>
                        </Card>
                        <Card className="p-6 text-center bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Users className="text-yellow-600 dark:text-yellow-400" size={28} />
                            </div>
                            <div className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Total Students</div>
                            <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{totalStudents ?? 0}</div>
                        </Card>
                    </div>

                    {/* Detailed Dormitories Overview */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-muted/50 rounded-lg">
                                <Building2 className="text-foreground" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Dormitories Overview</h2>
                        </div>
                        
                        {safeDormitories.map((dormitory: Dormitory) => (
                            <Card key={dormitory.tenant_id} className="p-8 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all duration-300">
                                {/* Dormitory Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                                    <div className="flex items-center mb-4 md:mb-0">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl mr-4">
                                            <Building2 className="text-blue-600 dark:text-blue-400" size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground mb-1">{dormitory.dormitory_name}</h3>
                                            <p className="text-muted-foreground">{dormitory.address}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Contact Info */}
                                    <div className="text-left md:text-right">
                                        <div className="text-sm text-muted-foreground mb-1">Contact Information</div>
                                        <div className="text-sm font-semibold text-foreground bg-muted/50 px-3 py-1 rounded-full inline-block">{dormitory.contact_number}</div>
                                    </div>
                                </div>
                                
                                {/* Statistics Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Total Rooms */}
                                    <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 group">
                                        <CardContent className="p-6 text-center">
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Bed className="text-blue-600 dark:text-blue-400" size={24} />
                                            </div>
                                            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">{dormitory.rooms?.length || 0}</div>
                                            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Rooms</div>
                                        </CardContent>
                                    </Card>
                                    
                                    {/* Available Rooms */}
                                    <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 group">
                                        <CardContent className="p-6 text-center">
                                            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Bed className="text-green-600 dark:text-green-400" size={24} />
                                            </div>
                                            <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">{dormitory.rooms?.filter(r => r.status === 'available').length || 0}</div>
                                            <div className="text-sm font-medium text-green-700 dark:text-green-300">Available Rooms</div>
                                        </CardContent>
                                    </Card>
                                    
                                    {/* Occupied Rooms */}
                                    <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 group">
                                        <CardContent className="p-6 text-center">
                                            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Bed className="text-purple-600 dark:text-purple-400" size={24} />
                                            </div>
                                            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">{dormitory.rooms?.filter(r => r.status === 'occupied').length || 0}</div>
                                            <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Occupied Rooms</div>
                                        </CardContent>
                                    </Card>
                                </div>
                                
                                {/* Room Details */}
                                {dormitory.rooms && dormitory.rooms.length > 0 && (
                                    <div className="mt-8">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                                            <h4 className="text-lg font-semibold text-foreground">Room Details</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {dormitory.rooms.map((room) => (
                                                <Card key={room.room_id} className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 p-4 hover:shadow-md transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-950/40">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center">
                                                            <div className={`p-2 rounded-lg mr-3 ${
                                                                room.status === 'available' 
                                                                    ? 'bg-green-100 dark:bg-green-900/50'
                                                                    : room.status === 'occupied'
                                                                        ? 'bg-red-100 dark:bg-red-900/50'
                                                                        : 'bg-orange-100 dark:bg-orange-900/50'
                                                            }`}>
                                                                <Bed className={`${
                                                                    room.status === 'available' 
                                                                        ? 'text-green-600 dark:text-green-400'
                                                                        : room.status === 'occupied'
                                                                            ? 'text-red-600 dark:text-red-400'
                                                                            : 'text-orange-600 dark:text-orange-400'
                                                                }`} size={16} />
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold text-sm text-foreground">Room {room.room_number}</span>
                                                            </div>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            room.status === 'available' 
                                                                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                                                : room.status === 'occupied'
                                                                    ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                                                    : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                                                        }`}>
                                                            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        <span className="font-medium">{room.type}</span> • <span className="font-semibold">₱{room.price_per_semester || '2,000'}</span>/semester
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {(!dormitory.rooms || dormitory.rooms.length === 0) && (
                                    <div className="text-center py-12 mt-8">
                                        <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
                                            <Building2 className="text-muted-foreground" size={48} />
                                        </div>
                                        <p className="text-muted-foreground text-lg">No rooms available for this dormitory</p>
                                        <p className="text-muted-foreground/70 text-sm mt-2">Rooms will appear here once they are added to the system</p>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>

                </div>
            </AppLayout>
        );
    }

    const safeDormitory: Dormitory | undefined = dormitory;
    const safeStudentsCount = studentsCount || 0;
    const safeRoomsCount = roomsCount || 0;
    const safeBookingsCount = bookingsCount || 0;
    const safeRooms: DetailedRoom[] = Array.isArray(rooms) ? rooms : [];
    
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'occupied': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            case 'maintenance': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };
    
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />
            <div className="p-6 space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Building2 className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">{safeDormitory && safeDormitory.dormitory_name ? safeDormitory.dormitory_name : 'Manager Dashboard'} ✨</h1>
                    </div>
                    <p className="text-muted-foreground mb-8">Overview and management of your assigned dormitory</p>
                </div>
                
                {/* Enhanced Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 text-center bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Users className="text-yellow-600 dark:text-yellow-400" size={28} />
                        </div>
                        <div className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Total Students</div>
                        <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{safeStudentsCount}</div>
                    </Card>
                    <Card className="p-6 text-center bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Bed className="text-green-600 dark:text-green-400" size={28} />
                        </div>
                        <div className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">Total Rooms</div>
                        <div className="text-3xl font-bold text-green-900 dark:text-green-100">{safeRoomsCount}</div>
                    </Card>
                    <Card className="p-6 text-center bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            <CalendarCheck2 className="text-purple-600 dark:text-purple-400" size={28} />
                        </div>
                        <div className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-200">Total Bookings</div>
                        <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{safeBookingsCount}</div>
                    </Card>
                </div>
                
                {/* Rooms Overview Section */}
                {safeRooms.length > 0 && (
                    <div className="mt-8">
                        <div className="bg-blue-50 dark:bg-blue-900/30 px-6 py-4 rounded-lg border border-blue-200 dark:border-blue-700 mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                                        <Bed className="text-blue-600 dark:text-blue-400" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rooms Overview</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Detailed view of all rooms and their current occupancy</p>
                                    </div>
                                </div>
                                <div className="bg-blue-100 dark:bg-blue-800/30 px-3 py-1 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-600">
                                    {safeRooms.length} Room{safeRooms.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-6">
                                {safeRooms.map((room) => (
                                <Card key={room.room_id} className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 overflow-hidden hover:shadow-xl transition-all duration-300">
                                    {/* Room Header with Colored Background */}
                                    <div className={`px-6 py-5 border-b ${
                                        room.is_at_capacity 
                                            ? 'bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-700'
                                            : room.current_occupancy > 0
                                                ? 'bg-orange-100 dark:bg-orange-900/50 border-orange-200 dark:border-orange-700'
                                                : 'bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-700'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${
                                                    room.is_at_capacity 
                                                        ? 'bg-red-100 dark:bg-red-800/50'
                                                        : room.current_occupancy > 0
                                                            ? 'bg-orange-100 dark:bg-orange-800/50'
                                                            : 'bg-green-100 dark:bg-green-800/50'
                                                }`}>
                                                    <Bed className={`${
                                                        room.is_at_capacity 
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : room.current_occupancy > 0
                                                                ? 'text-orange-600 dark:text-orange-400'
                                                                : 'text-green-600 dark:text-green-400'
                                                    }`} size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Room {room.room_number}</h3>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            getStatusColor(room.status)
                                                        }`}>
                                                            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {room.type} • ₱{room.price_per_semester || '2,000'}/semester
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Capacity Badge */}
                                            <div className={`px-3 py-2 rounded-lg border ${
                                                room.is_at_capacity 
                                                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                                                    : room.current_occupancy > 0
                                                        ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
                                                        : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                                            }`}>
                                                <div className="text-sm font-semibold">
                                                    {room.current_occupancy}/{room.max_capacity} Students
                                                </div>
                                                <div className="text-xs opacity-75">
                                                    {room.is_at_capacity ? 'Full Capacity' : `${room.available_capacity} spaces left`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Students Section */}
                                    <div className="p-6">
                                        {room.current_students && room.current_students.length > 0 ? (
                                            <div>
                                                <div className="bg-muted/30 px-4 py-3 rounded-lg border border-border mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-blue-100 dark:bg-blue-800/50 rounded">
                                                            <Users className="text-blue-600 dark:text-blue-400" size={16} />
                                                        </div>
                                                        <span className="text-sm font-medium text-foreground">
                                                            Current Students ({room.current_students.length})
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Student Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {room.current_students.map((student, index) => (
                                                        <div key={student.student_id} className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                                            {/* Student Number Badge */}
                                                            <div className="flex items-start justify-between mb-2">
                                                                <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                                                                    Student {index + 1}
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Student Details */}
                                                            <div className="space-y-1">
                                                                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                                    {student.first_name} {student.last_name}
                                                                </div>
                                                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                                    <span>📧</span> {student.email}
                                                                </div>
                                                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                                    <span>📞</span> {student.phone}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                                                                    <div className="font-medium mb-1">Duration:</div>
                                                                    <div className="flex items-center gap-1">
                                                                        <span>📅</span>
                                                                        {student.semester_count} semester{student.semester_count !== 1 ? 's' : ''}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <span>💰</span>
                                                                        ₱{(student.semester_count * 2000).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    
                                                    {/* Empty Slots */}
                                                    {Array.from({ length: room.available_capacity }).map((_, index) => (
                                                        <div key={`empty-${index}`} className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 flex items-center justify-center">
                                                            <div className="text-center">
                                                                <Users className="mx-auto mb-1 text-gray-400" size={16} />
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Available Slot
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="bg-muted/30 px-4 py-3 rounded-lg border border-border mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-green-100 dark:bg-green-800/50 rounded">
                                                            <Bed className="text-green-600 dark:text-green-400" size={16} />
                                                        </div>
                                                        <span className="text-sm font-medium text-foreground">
                                                            Room Available - All {room.max_capacity} spaces free
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-center py-4">
                                                    <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                                        <Bed className="text-green-600 dark:text-green-400" size={24} />
                                                    </div>
                                                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                        Room Available
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                        All student spaces are ready for occupancy
                                                    </div>
                                                
                                                {/* Empty Slots Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 max-w-md mx-auto">
                                                    {Array.from({ length: room.max_capacity }).map((_, index) => (
                                                        <div key={`empty-${index}`} className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2 flex items-center justify-center">
                                                            <Users className="text-gray-400" size={12} />
                                                        </div>
                                                    ))}
                                                </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                                ))}
                        </div>
                    </div>
                )}
                
                {safeRooms.length === 0 && (
                    <div className="mt-8">
                        <Card className="p-12 text-center bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full w-fit mx-auto mb-6">
                                <Bed className="text-blue-600 dark:text-blue-400" size={48} />
                            </div>
                            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-3">No Rooms Available</h3>
                            <p className="text-blue-700 dark:text-blue-300 text-lg mb-4">No rooms have been added to this dormitory yet.</p>
                            <p className="text-blue-600 dark:text-blue-400">Contact your administrator to add rooms to this dormitory.</p>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}



 