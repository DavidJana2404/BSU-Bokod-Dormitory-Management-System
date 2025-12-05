import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StudentAppLayout from '@/layouts/student-app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import React, { useState } from 'react';
import { 
    Calendar, 
    Mail, 
    Phone, 
    User, 
    CheckCircle, 
    Clock, 
    Wifi,
    Car,
    CalendarCheck,
    Bed,
    UserCheck,
    Building2,
    UserCheck2,
    Plane,
    Edit,
    CheckCircle2,
    AlertCircle,
    MessageSquare,
    X
} from 'lucide-react';
import StudentCleaningScheduleComponent from '@/components/student-cleaning-schedule';
import { StudentDashboardProps } from '@/types';

interface StayStatus {
    status: string;
    color: string;
    bgColor: string;
    icon: React.ComponentType<any>;
    description: string;
}

export default function StudentDashboard({ student, cleaningSchedules, dormitorians = [] }: StudentDashboardProps & { dormitorians?: { student_id: number; first_name: string; last_name: string; }[] }) {


    /**
     * Get stay status with enhanced information based on semester booking
     */
    const getStayStatus = (): StayStatus => {
        if (!student.current_booking || !student.current_booking.semester_count) {
            return { 
                status: 'No Booking', 
                color: 'text-gray-600', 
                bgColor: 'bg-gray-100',
                icon: Clock,
                description: 'No active booking found'
            };
        }
        
        // For semester-based booking, we consider the booking as active if it exists
        const semesterCount = student.current_booking.semester_count;
        const semesterText = semesterCount === 1 ? 'semester' : 'semesters';
        
        return { 
            status: 'Current Booking', 
            color: 'text-green-600', 
            bgColor: 'bg-green-100',
            icon: CheckCircle,
            description: `Enrolled for ${semesterCount} ${semesterText}`
        };
    };

    const stayInfo = getStayStatus();
    const StatusIcon = stayInfo.icon;
    
    // Status management state
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    
    // Form for status updates
    const { data, setData, put, processing, errors, reset } = useForm({
        status: student.status || 'in',
        leave_reason: student.leave_reason || '',
    });
    
    /**
     * Get student status information with styling
     */
    const getStudentStatus = () => {
        const status = student.status || 'in';
        
        if (status === 'on_leave') {
            return {
                label: 'On Leave',
                color: 'text-yellow-800',
                bgColor: 'bg-yellow-100',
                borderColor: 'border-yellow-200',
                icon: Plane,
                description: student.leave_reason || 'Away from dormitory'
            };
        } else {
            return {
                label: 'Present',
                color: 'text-green-800',
                bgColor: 'bg-green-100',
                borderColor: 'border-green-200',
                icon: CheckCircle2,
                description: 'Currently at dormitory'
            };
        }
    };
    
    const studentStatus = getStudentStatus();
    const StudentStatusIcon = studentStatus.icon;
    
    /**
     * Handle status update submission
     */
    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        
        put('/student/status', {
            onSuccess: () => {
                setIsStatusDialogOpen(false);
                reset();
            }
        });
    };
    
    /**
     * Open status dialog with current values
     */
    const openStatusDialog = () => {
        setData({
            status: student.status || 'in',
            leave_reason: student.leave_reason || '',
        });
        setIsStatusDialogOpen(true);
    };

    return (
        <StudentAppLayout 
            student={student}
            breadcrumbs={[
                { label: 'Student Portal', href: '/student/dashboard' },
                { label: 'Dashboard' }
            ]}
        >
            <Head title="Student Dashboard" />

            <div className="p-6 space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <User className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Welcome back, {student.first_name}!</h1>
                    </div>
                    <p className="text-muted-foreground mb-8">Your personal dashboard and accommodation overview</p>
                </div>
                
                {/* Enhanced Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 text-center bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            <StatusIcon className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <div className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Stay Status</div>
                        <div className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-1">{stayInfo.status}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">{stayInfo.description}</div>
                    </Card>
                    
                    <Card className="p-6 text-center bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            <CalendarCheck className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                        <div className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">Semester Count</div>
                        <div className="text-xl font-bold text-green-900 dark:text-green-100 mb-1">
                            {student.current_booking?.semester_count || 0}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                            {student.current_booking?.semester_count === 1 ? 'Semester' : 'Semesters'} Enrolled
                        </div>
                    </Card>
                    
                    <Card className="p-6 text-center bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Calendar className="text-purple-600 dark:text-purple-400" size={24} />
                        </div>
                        <div className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-200">Total Fee</div>
                        <div className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-1">
                            ₱{student.current_booking?.total_fee?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400">
                            Semester Fee
                        </div>
                    </Card>
                    
                    <Card className="p-6 text-center bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Bed className="text-orange-600 dark:text-orange-400" size={24} />
                        </div>
                        <div className="text-lg font-semibold mb-2 text-orange-800 dark:text-orange-200">
                            Room Assignment
                        </div>
                        {student.current_booking?.room ? (
                            <>
                                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-1">
                                    {student.current_booking.room.room_number}
                                </div>
                                <div className="text-xs text-orange-600 dark:text-orange-400">
                                    {student.current_booking.room.room_type}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-1">
                                    No Room
                                </div>
                                <div className="text-xs text-orange-600 dark:text-orange-400">
                                    Assigned Yet
                                </div>
                            </>
                        )}
                    </Card>
                </div>

                {/* Main Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Personal Information - Modern Card */}
                    <Card className="bg-white dark:bg-gray-900 border dark:border-gray-700 overflow-hidden">
                        {/* Card Header with Background */}
                        <div className="bg-blue-50 dark:bg-blue-900/30 px-6 py-4 border-b border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-lg">
                                    <UserCheck className="text-blue-600 dark:text-blue-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Your account details</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {student.first_name} {student.last_name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Address</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{student.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{student.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    
                    {/* Student Status Card */}
                    <Card className="bg-white dark:bg-gray-900 border dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300" onClick={openStatusDialog}>
                        {/* Card Header with Background */}
                        <div className={`px-6 py-4 border-b ${student.status === 'on_leave' 
                                ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700'
                                : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${student.status === 'on_leave'
                                    ? 'bg-yellow-100 dark:bg-yellow-800/50'
                                    : 'bg-green-100 dark:bg-green-800/50'}`}>
                                    <StudentStatusIcon className={`${student.status === 'on_leave'
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-green-600 dark:text-green-400'}`} size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Student Status</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Your dormitory presence</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-6">
                            <div className="space-y-4">
                                {/* Status Badge */}
                                <div className="flex items-center justify-center mb-4">
                                    <Badge className={`px-6 py-2 text-sm font-semibold ${student.status === 'on_leave'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                        {studentStatus.label}
                                    </Badge>
                                </div>
                                
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <UserCheck2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Status</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{studentStatus.label}</p>
                                    </div>
                                </div>
                                
                                {student.status === 'on_leave' && student.leave_reason && (
                                    <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <MessageSquare className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Leave Reason</p>
                                            <p className="text-md text-yellow-900 dark:text-yellow-300">{student.leave_reason}</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-center pt-2">
                                    <div className={`flex items-center gap-1 text-xs ${student.status === 'on_leave'
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-green-600 dark:text-green-400'}`}>
                                        <Edit size={12} />
                                        Click to update status
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Stay Information - Modern Card */}
                    <Card className="bg-white dark:bg-gray-900 border dark:border-gray-700 overflow-hidden lg:col-span-1">
                        {/* Card Header with Status Color */}
                        <div className={`px-6 py-4 border-b ${
                            stayInfo.status === 'Current Booking' 
                                ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                    stayInfo.status === 'Current Booking' 
                                        ? 'bg-green-100 dark:bg-green-800/50'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                    <StatusIcon className={`${
                                        stayInfo.status === 'Current Booking' 
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`} size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Stay Information</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{stayInfo.description}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-6">
                            <div className="space-y-4">
                                {/* Status Badge */}
                                <div className="flex items-center justify-center mb-6">
                                    <Badge className={`px-6 py-2 text-sm font-semibold ${
                                        stayInfo.status === 'Current Booking' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                    }`}>
                                        {stayInfo.status}
                                    </Badge>
                                </div>

                                {/* Semester Information Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                                        <CalendarCheck className="mx-auto mb-2 text-green-600 dark:text-green-400" size={24} />
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Semester Count</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {student.current_booking?.semester_count || 0}
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400">
                                            {(student.current_booking?.semester_count || 0) === 1 ? 'Semester' : 'Semesters'}
                                        </p>
                                    </div>
                                    
                                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg text-center">
                                        <Calendar className="mx-auto mb-2 text-purple-600 dark:text-purple-400" size={24} />
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Fee</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                            ₱{student.current_booking?.total_fee?.toLocaleString() || '0'}
                                        </p>
                                        <p className="text-xs text-purple-600 dark:text-purple-400">
                                            Semester Fee
                                        </p>
                                    </div>
                                </div>

                                {/* Room Assignment Info */}
                                {student.current_booking?.room && (
                                    <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg text-center">
                                        <Bed className="mx-auto mb-2 text-orange-600 dark:text-orange-400" size={20} />
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Room Assignment</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            Room {student.current_booking.room.room_number}
                                        </p>
                                        <p className="text-xs text-orange-600 dark:text-orange-400">
                                            {student.current_booking.room.room_type}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Cleaning Schedule Section */}
                <div className="mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Room Cleaning Schedule</h2>
                            <p className="text-gray-600 dark:text-gray-400">Your assigned cleaning days for the week</p>
                        </div>
                    </div>
                    
                    <StudentCleaningScheduleComponent 
                        schedules={cleaningSchedules}
                        roomNumber={student.current_booking?.room?.room_number}
                        studentId={student.student_id}
                        dormitorians={dormitorians}
                    />
                </div>

                {/* Cleaning Penalties and Mop Schedule */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Cleaning Penalties Card */}
                    <Card className="bg-white dark:bg-gray-900 border dark:border-gray-700 overflow-hidden">
                        <div className="bg-red-50 dark:bg-red-900/30 px-6 py-4 border-b border-red-200 dark:border-red-700">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 dark:bg-red-800/50 p-2 rounded-lg">
                                    <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cleaning Penalties</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Fines for not completing assigned cleaning duties</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-100 dark:bg-red-900/50 rounded-full w-8 h-8 flex items-center justify-center">
                                            <span className="text-sm font-bold text-red-600 dark:text-red-400">1st</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">First Offense</span>
                                    </div>
                                    <span className="text-lg font-bold text-red-600 dark:text-red-400">₱50</span>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-100 dark:bg-red-900/50 rounded-full w-8 h-8 flex items-center justify-center">
                                            <span className="text-sm font-bold text-red-600 dark:text-red-400">2nd</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Second Offense</span>
                                    </div>
                                    <span className="text-lg font-bold text-red-600 dark:text-red-400">₱100</span>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-100 dark:bg-red-900/50 rounded-full w-8 h-8 flex items-center justify-center">
                                            <span className="text-sm font-bold text-red-600 dark:text-red-400">3rd</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Third Offense</span>
                                    </div>
                                    <span className="text-lg font-bold text-red-600 dark:text-red-400">₱200</span>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-orange-100 dark:bg-orange-900/50 rounded-full w-8 h-8 flex items-center justify-center">
                                            <AlertCircle className="text-orange-600 dark:text-orange-400" size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Continuous Violation</span>
                                    </div>
                                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">Community Service</span>
                                </div>
                            </div>
                            
                            <Alert className="mt-4 border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    Please complete your assigned cleaning duties on time to avoid penalties.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </Card>
                    
                    {/* Mop Schedule Card */}
                    <Card className="bg-white dark:bg-gray-900 border dark:border-gray-700 overflow-hidden">
                        <div className="bg-blue-50 dark:bg-blue-900/30 px-6 py-4 border-b border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-lg">
                                    <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mop Schedule</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly mopping rotation schedule</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="space-y-3">
                                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Week 1</span>
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">MWF</Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Monday, Wednesday, Friday</p>
                                </div>
                                
                                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">Week 2</span>
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">TThSa</Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Tuesday, Thursday, Saturday</p>
                                </div>
                                
                                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">Week 3</span>
                                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">MWF</Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Monday, Wednesday, Friday</p>
                                </div>
                                
                                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">Week 4</span>
                                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">TThSu</Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Tuesday, Thursday, Sunday</p>
                                </div>
                            </div>
                            
                            <Alert className="mt-4 border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
                                <Calendar className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    Follow the weekly rotation to ensure all areas are properly cleaned.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </Card>
                </div>

                {/* Dormitory Services & Information */}
                <div className="mt-8 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dormitory Services & Information</h2>
                    
                    {/* Services Card */}
                    <Card className="bg-white dark:bg-gray-900 border dark:border-gray-700 overflow-hidden">
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 px-6 py-4 border-b border-yellow-200 dark:border-yellow-700">
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-100 dark:bg-yellow-800/50 p-2 rounded-lg">
                                    <Building2 className="text-yellow-600 dark:text-yellow-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Available Services</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Enjoy our amenities during your stay</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <Wifi className="text-blue-600 dark:text-blue-400" size={18} />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Free Wi-Fi</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                    <Car className="text-purple-600 dark:text-purple-400" size={18} />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Parking Available</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
                
                {/* Student Status Update Dialog */}
                <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <UserCheck2 className="text-blue-600" size={20} />
                                Update Student Status
                            </DialogTitle>
                            <DialogDescription>
                                Update your current dormitory status. Select "On Leave" if you're temporarily away from the dormitory.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleStatusUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Current Status</Label>
                                <Select 
                                    value={data.status} 
                                    onValueChange={(value) => setData('status', value as 'in' | 'on_leave')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="text-green-600" size={16} />
                                                Present at Dormitory
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="on_leave">
                                            <div className="flex items-center gap-2">
                                                <Plane className="text-yellow-600" size={16} />
                                                On Leave
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{errors.status}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                            
                            {data.status === 'on_leave' && (
                                <div className="space-y-2">
                                    <Label htmlFor="leave_reason">Reason for Leave</Label>
                                    <Textarea
                                        id="leave_reason"
                                        placeholder="Please provide a reason for your leave (e.g., vacation, family visit, etc.)"
                                        value={data.leave_reason}
                                        onChange={(e) => setData('leave_reason', e.target.value)}
                                        rows={3}
                                    />
                                    {errors.leave_reason && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{errors.leave_reason}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            )}
                            
                            {data.status === 'in' && student.status === 'on_leave' && (
                                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertDescription>
                                        Welcome back! Your status will be updated to show you're present at the dormitory.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </form>
                        
                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsStatusDialogOpen(false)}
                                disabled={processing}
                            >
                                <X size={16} className="mr-1" />
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                onClick={handleStatusUpdate}
                                disabled={processing || (data.status === 'on_leave' && !data.leave_reason.trim())}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {processing ? (
                                    <>
                                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Update Status
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </StudentAppLayout>
    );
}
