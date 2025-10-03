

import AppLayout from '@/layouts/app-layout';
import { usePage, router, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Users, Plus, Edit3, Archive, Mail, Phone, Shield, DollarSign, Plane, CheckCircle2, ChevronDown, Bed, Calendar, Eye } from 'lucide-react';
import { Head } from '@inertiajs/react';
import WarningDialog from '@/components/warning-dialog';

const emptyForm = { first_name: '', last_name: '', email: '', phone: '', password: '', password_confirmation: '' };

export default function Students() {
    const { students = [], errors = {} } = usePage().props;
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [expandedLeaveReasons, setExpandedLeaveReasons] = useState<Record<string, boolean>>({});
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const [pendingArchiveStudent, setPendingArchiveStudent] = useState<any>(null);

    const handleOpenAdd = () => {
        setForm(emptyForm);
        setIsEdit(false);
        setEditId(null);
        setOpen(true);
    };

    const handleOpenEdit = (student: any) => {
        setForm({
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            phone: student.phone,
            password: '',
            password_confirmation: '',
        });
        setIsEdit(true);
        setEditId(student.student_id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setForm(emptyForm);
        setIsEdit(false);
        setEditId(null);
    };

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        setProcessing(true);
        
        if (isEdit && editId) {
            router.put(`/students/${editId}`, form, {
                onSuccess: () => {
                    handleClose();
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                },
            });
        } else {
            router.post('/students', form, {
                onSuccess: () => {
                    handleClose();
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                },
            });
        }
    };

    const handleArchive = (student: any) => {
        setPendingArchiveStudent(student);
        setWarningDialogOpen(true);
    };
    
    const confirmArchive = () => {
        if (!pendingArchiveStudent) return;
        
        router.delete(`/students/${pendingArchiveStudent.student_id}`, {
            onSuccess: () => {
                // Close the warning dialog and reset state after successful archive
                setWarningDialogOpen(false);
                setPendingArchiveStudent(null);
            },
            onError: () => {
                // Close the warning dialog even on error to prevent it from staying open
                setWarningDialogOpen(false);
                setPendingArchiveStudent(null);
            }
        });
    };
    
    const getArchiveWarningMessage = (student: any) => {
        if (!student) return '';
        
        const studentName = `${student.first_name} ${student.last_name}`;
        
        if (student.is_currently_booked && student.current_booking) {
            const roomNumber = student.current_booking.room_number;
            return `WARNING: ${studentName} has an active booking in Room ${roomNumber}!\n\nArchiving this student will:\n• Keep their booking record but mark the student as archived\n• The room assignment will remain until the booking period ends\n• You can restore the student later from Archive settings\n\nAre you sure you want to archive this booked student?`;
        } else {
            return `Are you sure you want to archive ${studentName}?\n\nYou can restore them later from the Archive settings.`;
        }
    };

    const toggleLeaveReason = (studentId: string) => {
        setExpandedLeaveReasons(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const studentList = Array.isArray(students) ? students : [];

    return (
        <AppLayout breadcrumbs={[{ title: 'Students', href: '/students' }]}>
            <Head title="Students" />
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <Users className="text-blue-600 dark:text-blue-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Students Management</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage student information and access credentials</p>
                        </div>
                    </div>
                    
                    <Button onClick={handleOpenAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus size={18} /> Add New Student
                    </Button>
                </div>

                {/* Students Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 text-white rounded-lg p-2">
                                <Users size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{studentList.length}</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Total Students</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-green-600 text-white rounded-lg p-2">
                                <Shield size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {studentList.filter((s: any) => s.password).length}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">With Login Access</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-600 text-white rounded-lg p-2">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {studentList.filter((s: any) => s.payment_status === 'paid').length}
                                </div>
                                <div className="text-sm text-emerald-600 dark:text-emerald-400">Payments Complete</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-600 text-white rounded-lg p-2">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {studentList.filter((s: any) => s.status === 'in' || !s.status).length}
                                </div>
                                <div className="text-sm text-purple-600 dark:text-purple-400">Currently Present</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-600 text-white rounded-lg p-2">
                                <Bed size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {studentList.filter((s: any) => s.is_currently_booked).length}
                                </div>
                                <div className="text-sm text-orange-600 dark:text-orange-400">Currently Booked</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                {studentList.length > 0 ? (
                    <div className="space-y-3">
                        {studentList.map((student: any) => (
                            <Card key={student.student_id} className="border border-gray-200 dark:border-gray-700">
                                <CardContent className="p-4">
                                    {/* Mobile Layout */}
                                    <div className="block lg:hidden space-y-4">
                                        {/* Student Header */}
                                        <div className="flex items-start gap-3">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex-shrink-0">
                                                <Users className="text-blue-600 dark:text-blue-400" size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <Link href={`/students/${student.student_id}`}>
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                                                        {student.first_name} {student.last_name}
                                                    </h3>
                                                </Link>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    <Mail size={12} className="text-blue-500" />
                                                    <span className="truncate">{student.email}</span>
                                                </div>
                                                
                                                {/* Status Badges in Grid Layout */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Student Status</div>
                                                        {student.status === 'on_leave' && student.leave_reason ? (
                                                            <button
                                                                onClick={() => toggleLeaveReason(student.student_id)}
                                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border w-full justify-center transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900/30 ${
                                                                    'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
                                                                }`}
                                                            >
                                                                <Plane size={12} className="mr-1" />
                                                                On Leave
                                                                <ChevronDown 
                                                                    size={12} 
                                                                    className={`ml-1 transition-transform duration-200 ${
                                                                        expandedLeaveReasons[student.student_id] ? 'rotate-180' : ''
                                                                    }`}
                                                                />
                                                            </button>
                                                        ) : (
                                                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border w-full justify-center ${
                                                                (student.status === 'on_leave')
                                                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
                                                                    : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                                            }`}>
                                                                {(student.status === 'on_leave') ? (
                                                                    <><Plane size={12} className="mr-1" />On Leave</>
                                                                ) : (
                                                                    <><CheckCircle2 size={12} className="mr-1" />Present</>
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        {/* Expandable Leave Reason */}
                                                        {student.leave_reason && student.status === 'on_leave' && expandedLeaveReasons[student.student_id] && (
                                                            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                                                                <div className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">Leave Reason:</div>
                                                                <div className="text-yellow-800 dark:text-yellow-300">
                                                                    {student.leave_reason}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Login Access</div>
                                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border w-full justify-center ${
                                                            student.password 
                                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                                                : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800'
                                                        }`}>
                                                            {student.password ? (
                                                                <><CheckCircle size={12} className="mr-1" />Can Login</>
                                                            ) : (
                                                                <><XCircle size={12} className="mr-1" />No Access</>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Room Status</div>
                                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border w-full justify-center ${
                                                            student.is_currently_booked 
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800'
                                                                : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800'
                                                        }`}>
                                                            {student.is_currently_booked ? (
                                                                <><Bed size={12} className="mr-1" />Room {student.current_booking?.room_number}</>
                                                            ) : (
                                                                <><XCircle size={12} className="mr-1" />No Room</>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Status</div>
                                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border w-full justify-center ${
                                                            student.payment_status === 'paid' 
                                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                                                : student.payment_status === 'partial'
                                                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
                                                                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800'
                                                        }`}>
                                                            {student.payment_status === 'paid' ? (
                                                                <><CheckCircle size={12} className="mr-1" />Paid</>
                                                            ) : student.payment_status === 'partial' ? (
                                                                <><AlertCircle size={12} className="mr-1" />Partial</>
                                                            ) : (
                                                                <><XCircle size={12} className="mr-1" />Unpaid</>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Action Buttons - Moved to right side */}
                                            <div className="flex flex-col gap-2 flex-shrink-0">
                                                <Link href={`/students/${student.student_id}`}>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="h-8 px-3 text-xs w-full border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20"
                                                    >
                                                        <Eye size={12} className="mr-1" />
                                                        View
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleOpenEdit(student)}
                                                    className="h-8 px-3 text-xs"
                                                >
                                                    <Edit3 size={12} className="mr-1" />
                                                    Edit
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleArchive(student)}
                                                    className="h-8 px-3 text-xs border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/20"
                                                >
                                                    <Archive size={12} className="mr-1" />
                                                    Archive
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Additional Details Section */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                                <Phone size={16} className="text-green-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.phone}</div>
                                                </div>
                                            </div>
                                            
                                            {/* Booking Details */}
                                            {student.is_currently_booked && student.current_booking && (
                                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                                    <Calendar size={16} className="text-blue-500 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Booking Details</div>
                                                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                                            {student.current_booking.semester_count} semester{student.current_booking.semester_count !== 1 ? 's' : ''}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            ₱{(student.current_booking.total_fee || 0).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden lg:block">
                                        <div className="grid grid-cols-12 xl:grid-cols-16 gap-4 items-start">
                                            {/* Student Info - 3 columns on lg, 3 on xl */}
                                            <div className="col-span-3 xl:col-span-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 flex-shrink-0">
                                                        <Users className="text-blue-600 dark:text-blue-400" size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link href={`/students/${student.student_id}`}>
                                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm xl:text-base truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                                                                {student.first_name} {student.last_name}
                                                            </h3>
                                                        </Link>
                                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs xl:text-sm">
                                                            <Mail size={12} className="text-blue-500" />
                                                            <span className="truncate">{student.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact & Booking Info - 3 columns on lg, 3 on xl */}
                                            <div className="col-span-3 xl:col-span-3 space-y-2">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs xl:text-sm">
                                                    <Phone size={12} className="text-green-500 flex-shrink-0" />
                                                    <span className="truncate">{student.phone}</span>
                                                </div>
                                                
                                                {/* Booking Details for Desktop */}
                                                {student.is_currently_booked && student.current_booking && (
                                                    <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-xs xl:text-sm">
                                                        <Calendar size={12} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">Booking Details:</div>
                                                            <div className="font-medium text-gray-900 dark:text-gray-100 text-xs leading-tight">
                                                                {student.current_booking.semester_count} semester{student.current_booking.semester_count !== 1 ? 's' : ''}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                ₱{(student.current_booking.total_fee || 0).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status Badges - 4 columns on lg, 6 on xl */}
                                            <div className="col-span-4 xl:col-span-6 grid grid-cols-1 lg:grid-cols-4 gap-3">
                                                {/* Student Status */}
                                                <div className="space-y-1">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Student Status</div>
                                                    {student.status === 'on_leave' && student.leave_reason ? (
                                                        <button
                                                            onClick={() => toggleLeaveReason(student.student_id)}
                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border w-full justify-center transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900/30 ${
                                                                'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
                                                            }`}
                                                        >
                                                            <Plane size={10} className="mr-1" />
                                                            On Leave
                                                            <ChevronDown 
                                                                size={10} 
                                                                className={`ml-1 transition-transform duration-200 ${
                                                                    expandedLeaveReasons[student.student_id] ? 'rotate-180' : ''
                                                                }`}
                                                            />
                                                        </button>
                                                    ) : (
                                                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border w-full justify-center ${
                                                            (student.status === 'on_leave')
                                                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
                                                                : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                                        }`}>
                                                            {(student.status === 'on_leave') ? (
                                                                <><Plane size={10} className="mr-1" />On Leave</>
                                                            ) : (
                                                                <><CheckCircle2 size={10} className="mr-1" />Present</>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Expandable Leave Reason for Desktop */}
                                                    {student.leave_reason && student.status === 'on_leave' && expandedLeaveReasons[student.student_id] && (
                                                        <div className="mt-1 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                                                            <div className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">Reason:</div>
                                                            <div className="text-yellow-800 dark:text-yellow-300 leading-tight">
                                                                {student.leave_reason}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Login Access */}
                                                <div className="space-y-1">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Login Access</div>
                                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border w-full justify-center ${
                                                        student.password 
                                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                                            : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800'
                                                    }`}>
                                                        {student.password ? (
                                                            <><CheckCircle size={10} className="mr-1" />Enabled</>
                                                        ) : (
                                                            <><XCircle size={10} className="mr-1" />Disabled</>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Room Status */}
                                                <div className="space-y-1">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Room Status</div>
                                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border w-full justify-center ${
                                                        student.is_currently_booked 
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800'
                                                            : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800'
                                                    }`}>
                                                        {student.is_currently_booked ? (
                                                            <><Bed size={10} className="mr-1" />Room {student.current_booking?.room_number}</>
                                                        ) : (
                                                            <><XCircle size={10} className="mr-1" />No Room</>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Payment Status */}
                                                <div className="space-y-1">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Payment Status</div>
                                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border w-full justify-center ${
                                                        student.payment_status === 'paid' 
                                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                                            : student.payment_status === 'partial'
                                                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
                                                                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800'
                                                    }`}>
                                                        {student.payment_status === 'paid' ? (
                                                            <><CheckCircle size={10} className="mr-1" />Paid</>
                                                        ) : student.payment_status === 'partial' ? (
                                                            <><AlertCircle size={10} className="mr-1" />Partial</>
                                                        ) : (
                                                            <><XCircle size={10} className="mr-1" />Unpaid</>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions - 2 columns on lg, 4 on xl */}
                                            <div className="col-span-2 xl:col-span-4">
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={`/students/${student.student_id}`}>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-8 px-3 text-xs border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20"
                                                        >
                                                            <Eye size={12} className="mr-1" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleOpenEdit(student)}
                                                        className="h-8 px-3 text-xs"
                                                    >
                                                        <Edit3 size={12} className="mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleArchive(student)}
                                                        className="h-8 px-3 text-xs border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/20"
                                                    >
                                                        <Archive size={12} className="mr-1" />
                                                        Archive
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Users className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No students found</h3>
                        <p className="text-gray-500 dark:text-gray-500 mb-6">Start by adding your first student to manage dormitory residents.</p>
                        <Button onClick={handleOpenAdd} className="gap-2">
                            <Plus size={16} /> Create Your First Student
                        </Button>
                    </Card>
                )}

                {/* Add/Edit Student Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Update Student' : 'Add Student'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="first_name">First Name</Label>
                            <Input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} required />
                            {(errors as any)?.first_name && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {(errors as any).first_name}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} required />
                            {(errors as any)?.last_name && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {(errors as any).last_name}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                            {(errors as any)?.email && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {(errors as any).email}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
                            {(errors as any)?.phone && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {(errors as any).phone}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="password">
                                Password {!isEdit ? '(Optional - Required only for student login access)' : '(Leave blank to keep current password)'}
                            </Label>
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                value={form.password} 
                                onChange={handleChange} 
                                placeholder={isEdit ? 'Leave blank to keep current password' : 'Min 8 characters if setting up login'} 
                            />
                            {(errors as any)?.password && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {(errors as any).password}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="password_confirmation">
                                Confirm Password {form.password && '(Required when setting password)'}
                            </Label>
                            <Input 
                                id="password_confirmation" 
                                name="password_confirmation" 
                                type="password" 
                                value={form.password_confirmation} 
                                onChange={handleChange} 
                                placeholder={form.password ? 'Must match password above' : 'Only required if password is set'} 
                                disabled={!form.password}
                            />
                            {(errors as any)?.password_confirmation && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {(errors as any).password_confirmation}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>Cancel</Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Processing...' : (isEdit ? 'Update' : 'Add Student')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
                </Dialog>
                
                {/* Archive Warning Dialog */}
                <WarningDialog
                    open={warningDialogOpen}
                    onClose={() => {
                        setWarningDialogOpen(false);
                        setPendingArchiveStudent(null);
                    }}
                    onConfirm={confirmArchive}
                    title="Archive Student?"
                    message={getArchiveWarningMessage(pendingArchiveStudent)}
                    confirmText="Archive Student"
                    isDestructive={true}
                />
            </div>
        </AppLayout>
    );
}
