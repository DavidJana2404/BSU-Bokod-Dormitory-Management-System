import AppLayout from '@/layouts/app-layout';
import { usePage, router, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Head } from '@inertiajs/react';
import { 
    Users, 
    Mail, 
    Phone, 
    Shield, 
    DollarSign, 
    Plane, 
    CheckCircle2, 
    CheckCircle, 
    XCircle, 
    AlertCircle, 
    Bed, 
    Calendar, 
    MapPin,
    Clock,
    Edit3,
    ArrowLeft,
    User,
    CreditCard,
    Building2,
    CalendarDays,
    History
} from 'lucide-react';

interface Student {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    payment_status: string;
    payment_date?: string;
    amount_paid?: number;
    payment_notes?: string;
    status: string;
    leave_reason?: string;
    status_updated_at?: string;
    password: boolean;
    login_status: string;
    needs_password_setup: boolean;
    password_status: string;
    has_booking: boolean;
    booking_count: number;
    tenant_id: string;
    current_booking?: {
        booking_id: string;
        room_id: string;
        room_number: string;
        room_type: string;
        semester_count: number;
        total_fee: number;
    };
    all_bookings: Array<{
        booking_id: string;
        room_id: string;
        room_number: string;
        room_type: string;
        dormitory_name: string;
        semester_count: number;
        total_fee: number;
        is_current: boolean;
        created_at: string;
    }>;
    is_currently_booked: boolean;
    created_at: string;
    updated_at: string;
}

export default function StudentShow() {
    const { student } = usePage<{ student: Student }>().props;
    
    const handleEdit = () => {
        // Navigate back to students index page and trigger edit modal
        router.get('/students', {}, {
            onSuccess: () => {
                // The edit functionality is handled in the index page
                // We could potentially pass a parameter to auto-open the edit modal
            }
        });
    };

    const getStatusBadge = (status: string, reason?: string) => {
        if (status === 'on_leave') {
            return (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800">
                    <Plane size={12} className="mr-1" />
                    On Leave
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                <CheckCircle2 size={12} className="mr-1" />
                Present
            </Badge>
        );
    };

    const getLoginStatusBadge = (hasPassword: boolean) => {
        if (hasPassword) {
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                    <CheckCircle size={12} className="mr-1" />
                    Can Login
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800">
                <XCircle size={12} className="mr-1" />
                No Access
            </Badge>
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        if (status === 'paid') {
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                    <CheckCircle size={12} className="mr-1" />
                    Paid
                </Badge>
            );
        } else if (status === 'partial') {
            return (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800">
                    <AlertCircle size={12} className="mr-1" />
                    Partial
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800">
                <XCircle size={12} className="mr-1" />
                Unpaid
            </Badge>
        );
    };

    const getRoomStatusBadge = (isBooked: boolean, roomNumber?: string) => {
        if (isBooked && roomNumber) {
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800">
                    <Bed size={12} className="mr-1" />
                    Room {roomNumber}
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800">
                <XCircle size={12} className="mr-1" />
                No Room
            </Badge>
        );
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Students', href: '/students' },
            { title: `${student.first_name} ${student.last_name}`, href: `/students/${student.student_id}` }
        ]}>
            <Head title={`${student.first_name} ${student.last_name} - Student Details`} />
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/students">
                            <Button variant="outline" size="sm" className="gap-2">
                                <ArrowLeft size={16} />
                                Back to Students
                            </Button>
                        </Link>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                                <User className="text-blue-600 dark:text-blue-400" size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {student.first_name} {student.last_name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">Student Details & Information</p>
                            </div>
                        </div>
                    </div>
                    
                    <Button onClick={handleEdit} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Edit3 size={18} />
                        Edit Student
                    </Button>
                </div>

                {/* Quick Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Student Status</p>
                                    {getStatusBadge(student.status, student.leave_reason)}
                                </div>
                                <CheckCircle2 className="text-green-500" size={20} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Login Access</p>
                                    {getLoginStatusBadge(student.password)}
                                </div>
                                <Shield className="text-blue-500" size={20} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment Status</p>
                                    {getPaymentStatusBadge(student.payment_status)}
                                </div>
                                <CreditCard className="text-green-500" size={20} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Room Status</p>
                                    {getRoomStatusBadge(student.is_currently_booked, student.current_booking?.room_number)}
                                </div>
                                <Building2 className="text-purple-500" size={20} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users size={20} />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</label>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{student.first_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</label>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{student.last_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Student ID</label>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{student.student_id}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-blue-500" />
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{student.email}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</label>
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-green-500" />
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{student.phone}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</label>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-purple-500" />
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {formatDate(student.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Leave Reason (if on leave) */}
                            {student.status === 'on_leave' && student.leave_reason && (
                                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <Plane className="text-yellow-600 mt-0.5" size={16} />
                                        <div>
                                            <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Leave Reason</h4>
                                            <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">{student.leave_reason}</p>
                                            {student.status_updated_at && (
                                                <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-2">
                                                    Status updated: {formatDateTime(student.status_updated_at)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Current Booking & Payment Info */}
                    <div className="space-y-6">
                        {/* Current Booking */}
                        {student.is_currently_booked && student.current_booking ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bed size={20} />
                                        Current Booking
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Room Number</label>
                                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                            {student.current_booking.room_number}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Room Type</label>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {student.current_booking.room_type}
                                        </p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</label>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {student.current_booking.semester_count} semester{student.current_booking.semester_count !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Fee</label>
                                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            ₱{student.current_booking.total_fee.toLocaleString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bed size={20} />
                                        Room Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-4">
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                            <XCircle className="text-gray-400" size={24} />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">No Current Booking</p>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm">Student is not assigned to any room</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign size={20} />
                                    Payment Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</label>
                                    {getPaymentStatusBadge(student.payment_status)}
                                </div>
                                
                                {student.amount_paid && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount Paid</label>
                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                            ${student.amount_paid.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                
                                {student.payment_date && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Date</label>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatDate(student.payment_date)}
                                        </p>
                                    </div>
                                )}
                                
                                {student.payment_notes && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Notes</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                            {student.payment_notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Booking History */}
                {student.all_bookings && student.all_bookings.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History size={20} />
                                Booking History
                                <Badge variant="outline">{student.all_bookings.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {student.all_bookings.map((booking, index) => (
                                    <div 
                                        key={booking.booking_id}
                                        className={`border rounded-lg p-4 ${
                                            booking.is_current 
                                                ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20' 
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${
                                                    booking.is_current 
                                                        ? 'bg-blue-600 text-white' 
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                    <Bed size={16} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                            Room {booking.room_number}
                                                        </h4>
                                                        {booking.is_current && (
                                                            <Badge className="bg-blue-600 text-white text-xs">Current</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {booking.room_type} • {booking.dormitory_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {booking.semester_count} semester{booking.semester_count !== 1 ? 's' : ''}
                                                </p>
                                                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                    ₱{booking.total_fee.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Booked: {formatDateTime(booking.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}