

import AppLayout from '@/layouts/app-layout';
import { usePage, router, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Users, Plus, Edit3, Archive, Mail, Phone, Shield, DollarSign, Plane, CheckCircle2, ChevronDown, Bed, Calendar, Eye, Search, Clock } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';
import WarningDialog from '@/components/warning-dialog';
import DormitorianStatusDialog from '@/components/dormitorian-status-dialog';

const emptyForm = { first_name: '', last_name: '', student_id: '', program_year: '', current_address: '', email: '', phone: '', parent_name: '', parent_phone: '', parent_relationship: '', password: '', password_confirmation: '' };

export default function Students() {
    const { students = [], errors = {}, error = null, show_assignment_notice = false } = usePage().props as {
        students?: any[];
        errors?: Record<string, any>;
        error?: string | null;
        show_assignment_notice?: boolean;
    };
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [expandedLeaveReasons, setExpandedLeaveReasons] = useState<Record<string, boolean>>({});
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const [pendingArchiveStudent, setPendingArchiveStudent] = useState<any>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusStudent, setStatusStudent] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [studentsPage, setStudentsPage] = useState(1);
    const STUDENTS_PER_PAGE = 10;
    
    // Filter states
    const [activeFilter, setActiveFilter] = useState<'all' | 'with-login' | 'paid' | 'present' | 'booked'>('all');

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
            student_id: student.student_id_number || '',
            program_year: student.program_year || '',
            current_address: student.current_address || '',
            email: student.email,
            phone: student.phone,
            parent_name: student.parent_name || '',
            parent_phone: student.parent_phone || '',
            parent_relationship: student.parent_relationship || '',
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
            return `WARNING: ${studentName} has an active booking in Room ${roomNumber}!\n\nArchiving this dormitorian will:\n• Archive the dormitorian and remove them from active dormitorians\n• Also archive their booking in Room ${roomNumber}\n• Free up the room for new bookings\n• You can restore both the dormitorian and their booking later from Archive settings\n\nAre you sure you want to archive this booked dormitorian?`;
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

    const handleViewStudent = (student: any) => {
        router.get(`/students/${student.student_id}`);
    };
    
    const handleUpdateStatus = (student: any) => {
        setStatusStudent(student);
        setStatusDialogOpen(true);
    };

    const studentList = Array.isArray(students) ? students : [];
    
    // Filter students based on search term and active filter
    const getFilteredStudents = () => {
        let students = studentList;
        
        // Apply specific filters
        if (activeFilter === 'with-login') {
            students = studentList.filter(s => s.password);
        } else if (activeFilter === 'paid') {
            students = studentList.filter(s => s.payment_status === 'paid');
        } else if (activeFilter === 'present') {
            students = studentList.filter(s => s.status === 'in' || !s.status);
        } else if (activeFilter === 'booked') {
            students = studentList.filter(s => s.is_currently_booked);
        }
        
        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            students = students.filter(student => (
                student.first_name.toLowerCase().includes(searchLower) ||
                student.last_name.toLowerCase().includes(searchLower) ||
                student.email.toLowerCase().includes(searchLower) ||
                (student.current_booking?.room_number || '').toString().toLowerCase().includes(searchLower)
            ));
        }
        
        return students;
    };
    
    const filteredStudents = getFilteredStudents();
    
    // Paginate students for infinite scroll
    const displayedStudents = filteredStudents.slice(0, studentsPage * STUDENTS_PER_PAGE);
    const hasMoreStudents = filteredStudents.length > displayedStudents.length;
    
    const loadMoreStudents = () => {
        if (hasMoreStudents) {
            setStudentsPage(prev => prev + 1);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dormitorians', href: '/students' }]}>
            <Head title="Dormitorians" />
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <Users className="text-blue-600 dark:text-blue-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dormitorians Management</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage dormitorian information and access credentials</p>
                        </div>
                    </div>
                    
                    {!error && (
                        <Button onClick={handleOpenAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus size={18} /> Add New Dormitorian
                        </Button>
                    )}
                </div>

                {/* Students Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* Total Students - Clickable */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'all' ? 'bg-blue-700' : 'bg-blue-600'} text-white`}
                                onClick={() => setActiveFilter('all')}
                                title="All Dormitorians"
                            >
                                <Users size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredStudents.length}</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">{searchTerm ? 'Filtered' : 'Total'} Dormitorians</div>
                            </div>
                        </div>
                        
                        {/* With Login Access - Clickable */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'with-login' ? 'bg-green-700' : 'bg-green-600'} text-white`}
                                onClick={() => setActiveFilter('with-login')}
                                title="Dormitorians With Login Access"
                            >
                                <Shield size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {filteredStudents.filter((s: any) => s.password).length}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">With Login Access</div>
                            </div>
                        </div>
                        
                        {/* Paid Students - Clickable */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'paid' ? 'bg-emerald-700' : 'bg-emerald-600'} text-white`}
                                onClick={() => setActiveFilter('paid')}
                                title="Dormitorians With Complete Payments"
                            >
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {filteredStudents.filter((s: any) => s.payment_status === 'paid').length}
                                </div>
                                <div className="text-sm text-emerald-600 dark:text-emerald-400">Payments Complete</div>
                            </div>
                        </div>
                        
                        {/* Present Students - Clickable */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'present' ? 'bg-purple-700' : 'bg-purple-600'} text-white`}
                                onClick={() => setActiveFilter('present')}
                                title="Currently Present Dormitorians"
                            >
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {studentList.filter((s: any) => s.status === 'in' || !s.status).length}
                                </div>
                                <div className="text-sm text-purple-600 dark:text-purple-400">Currently Present</div>
                            </div>
                        </div>
                        
                        {/* Booked Students - Clickable */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'booked' ? 'bg-orange-700' : 'bg-orange-600'} text-white`}
                                onClick={() => setActiveFilter('booked')}
                                title="Currently Booked Dormitorians"
                            >
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

                {/* Error Message */}
                {error && (
                    <Card className={`border ${show_assignment_notice ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10' : 'border-red-300 bg-red-50 dark:bg-red-900/10'}`}>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`rounded-lg p-3 ${show_assignment_notice ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                    <AlertCircle className={`${show_assignment_notice ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`} size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-semibold mb-2 ${show_assignment_notice ? 'text-yellow-800 dark:text-yellow-200' : 'text-red-800 dark:text-red-200'}`}>
                                        {show_assignment_notice ? 'Dormitory Assignment Required' : 'Unable to Load Dormitorians'}
                                    </h3>
                                    <p className={`text-sm ${show_assignment_notice ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300'}`}>
                                        {error as ReactNode}
                                    </p>
                                    {show_assignment_notice && (
                                        <div className="mt-4">
                                            <Link href="/assign-manager">
                                                <Button variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/20">
                                                    <Users size={16} className="mr-2" />
                                                    Go to Manager Assignment
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Students List */}
                {(!error && studentList.length > 0) ? (
                    <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                            {/* Search Bar */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <Users className="text-blue-600 dark:text-blue-400" size={24} />
                                    Dormitorians ({filteredStudents.length})
                                </h2>
                            </div>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    placeholder="Search dormitorians by name, email, or room number..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setStudentsPage(1); // Reset pagination when searching
                                    }}
                                    className="pl-10"
                                />
                            </div>
                            {searchTerm && (
                                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                    Found {filteredStudents.length} of {studentList.length} dormitorians
                                </div>
                            )}
                            
                            {/* Students List - Scrollable */}
                            <div className="max-h-[600px] overflow-y-auto space-y-3 scrollbar-system">
                                {displayedStudents.map((student: any) => (
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
                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Dormitorian Status</div>
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
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleUpdateStatus(student)}
                                                    className="h-8 px-3 text-xs border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950/20 w-full"
                                                >
                                                    <Clock size={12} className="mr-1" />
                                                    Status
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleViewStudent(student)}
                                                    className="h-8 px-3 text-xs border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20 w-full"
                                                >
                                                    <Eye size={12} className="mr-1" />
                                                    View
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleOpenEdit(student)}
                                                    className="h-8 px-3 text-xs w-full"
                                                >
                                                    <Edit3 size={12} className="mr-1" />
                                                    Edit
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleArchive(student)}
                                                    className="h-8 px-3 text-xs border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/20 w-full"
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
                                                {/* Dormitorian Status */}
                                                <div className="space-y-1">
                                                    <button 
                                                        onClick={() => handleUpdateStatus(student)}
                                                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer text-left flex items-center gap-1"
                                                    >
                                                        Dormitorian Status
                                                        <Clock size={10} className="opacity-60" />
                                                    </button>
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
                                                <div className="flex flex-wrap gap-2 justify-end">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleUpdateStatus(student)}
                                                        className="h-8 px-2.5 lg:px-3 text-xs border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950/20 flex-shrink-0"
                                                        title="Update Status"
                                                    >
                                                        <Clock size={12} className="lg:mr-1" />
                                                        <span className="hidden lg:inline">Status</span>
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleViewStudent(student)}
                                                        className="h-8 px-2.5 lg:px-3 text-xs border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20 flex-shrink-0"
                                                        title="View Details"
                                                    >
                                                        <Eye size={12} className="lg:mr-1" />
                                                        <span className="hidden lg:inline">View</span>
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleOpenEdit(student)}
                                                        className="h-8 px-2.5 lg:px-3 text-xs flex-shrink-0"
                                                        title="Edit Dormitorian"
                                                    >
                                                        <Edit3 size={12} className="lg:mr-1" />
                                                        <span className="hidden lg:inline">Edit</span>
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleArchive(student)}
                                                        className="h-8 px-2.5 lg:px-3 text-xs border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/20 flex-shrink-0"
                                                        title="Archive Dormitorian"
                                                    >
                                                        <Archive size={12} className="lg:mr-1" />
                                                        <span className="hidden lg:inline">Archive</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                                ))}
                                        
                                {/* Load More Button */}
                                {hasMoreStudents && (
                                    <div className="pt-4 text-center">
                                        <Button
                                            variant="outline"
                                            onClick={loadMoreStudents}
                                            className="text-sm"
                                        >
                                            Load More Dormitorians
                                        </Button>
                                    </div>
                                )}
                            </div>
                            
                            {filteredStudents.length === 0 && searchTerm && (
                                <div className="text-center py-8">
                                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <Users className="text-gray-400" size={32} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No dormitorians found</h3>
                                    <p className="text-gray-500 dark:text-gray-500">No dormitorians match your search criteria.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    !error && (
                        <Card className="p-12 text-center">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Users className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No dormitorians found</h3>
                            <p className="text-gray-500 dark:text-gray-500 mb-6">Start by adding your first dormitorian to manage dormitory residents.</p>
                            <Button onClick={handleOpenAdd} className="gap-2">
                                <Plus size={16} /> Create Your First Dormitorian
                            </Button>
                        </Card>
                    )
                )}

                {/* Add/Edit Student Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-lg mx-auto max-h-[90vh] overflow-y-auto scrollbar-system">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Update Dormitorian' : 'Add Dormitorian'}</DialogTitle>
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
                        
                        {/* Student Information */}
                        <div className="border-t pt-4 mt-2">
                            <h3 className="text-sm font-semibold mb-3">Student Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="student_id">Student ID No. *</Label>
                                    <Input 
                                        id="student_id" 
                                        name="student_id" 
                                        value={form.student_id} 
                                        onChange={handleChange} 
                                        placeholder="Enter student ID number"
                                        required 
                                    />
                                    {(errors as any)?.student_id && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {(errors as any).student_id}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="program_year">Program & Year Level *</Label>
                                    <Input 
                                        id="program_year" 
                                        name="program_year" 
                                        value={form.program_year} 
                                        onChange={(e) => {
                                            const uppercased = e.target.value.toUpperCase();
                                            setForm({ ...form, program_year: uppercased });
                                        }}
                                        placeholder="e.g., BSIT 4, BIT 1, BSE 3"
                                        required 
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Format: Program Year (e.g., BSIT 4, BIT 1)
                                    </p>
                                    {(errors as any)?.program_year && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {(errors as any).program_year}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="current_address">Current Address *</Label>
                                    <Textarea 
                                        id="current_address" 
                                        name="current_address" 
                                        value={form.current_address} 
                                        onChange={handleChange} 
                                        placeholder="Enter complete current address"
                                        rows={3}
                                        maxLength={500}
                                        required 
                                    />
                                    <p className="text-xs text-muted-foreground text-right mt-1">
                                        {form.current_address.length}/500 characters
                                    </p>
                                    {(errors as any)?.current_address && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {(errors as any).current_address}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Contact Information */}
                        <div className="border-t pt-4 mt-2">
                            <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                                    {(errors as any)?.email && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {(errors as any).email}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
                                    {(errors as any)?.phone && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {(errors as any).phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Parent/Guardian Emergency Contact */}
                        <div className="border-t pt-4 mt-2">
                            <h3 className="text-sm font-semibold mb-3">Parent/Guardian Emergency Contact</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="parent_name">Parent/Guardian Name *</Label>
                                    <Input id="parent_name" name="parent_name" value={form.parent_name} onChange={handleChange} required />
                                    {(errors as any)?.parent_name && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {(errors as any).parent_name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="parent_phone">Parent/Guardian Phone *</Label>
                                    <Input id="parent_phone" name="parent_phone" value={form.parent_phone} onChange={handleChange} required />
                                    {(errors as any)?.parent_phone && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {(errors as any).parent_phone}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="parent_relationship">Relationship *</Label>
                                    <Select value={form.parent_relationship} onValueChange={(value) => setForm({ ...form, parent_relationship: value })} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select relationship" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mother">Mother</SelectItem>
                                            <SelectItem value="Father">Father</SelectItem>
                                            <SelectItem value="Guardian">Guardian</SelectItem>
                                            <SelectItem value="Grandmother">Grandmother</SelectItem>
                                            <SelectItem value="Grandfather">Grandfather</SelectItem>
                                            <SelectItem value="Aunt">Aunt</SelectItem>
                                            <SelectItem value="Uncle">Uncle</SelectItem>
                                            <SelectItem value="Sibling">Sibling</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {(errors as any)?.parent_relationship && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {(errors as any).parent_relationship}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t pt-4">
                            <Label htmlFor="password">
                                Password {!isEdit ? '(Optional - Required only for dormitorian login access)' : '(Leave blank to keep current password)'}
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
                
                {/* View Student Modal */}
                <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                    <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl mx-auto max-h-[90vh] overflow-y-auto scrollbar-system">
                        <DialogHeader>
                            <DialogTitle>Student Details</DialogTitle>
                            <DialogDescription>
                                View detailed information about this student.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedStudent && (
                            <div className="space-y-6">
                                {/* Student Information */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</Label>
                                        <p className="text-base font-semibold">{selectedStudent.first_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</Label>
                                        <p className="text-base font-semibold">{selectedStudent.last_name}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</Label>
                                        <p className="text-base">{selectedStudent.email}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</Label>
                                        <p className="text-base">{selectedStudent.phone}</p>
                                    </div>
                                </div>

                                {/* Status Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Student Status</Label>
                                        <div className="mt-1">
                                            {selectedStudent.status === 'on_leave' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800">
                                                    <Plane size={12} className="mr-1" />On Leave
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                                                    <CheckCircle2 size={12} className="mr-1" />Present
                                                </span>
                                            )}
                                        </div>
                                        {selectedStudent.leave_reason && (
                                            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                                                <p className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">Leave Reason:</p>
                                                <p className="text-yellow-800 dark:text-yellow-300">{selectedStudent.leave_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Login Access</Label>
                                        <div className="mt-1">
                                            {selectedStudent.password ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                                                    <CheckCircle size={12} className="mr-1" />Enabled
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800">
                                                    <XCircle size={12} className="mr-1" />Disabled
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Room and Payment Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Room Status</Label>
                                        <div className="mt-1">
                                            {selectedStudent.is_currently_booked ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800">
                                                    <Bed size={12} className="mr-1" />Room {selectedStudent.current_booking?.room_number}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800">
                                                    <XCircle size={12} className="mr-1" />No Room
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</Label>
                                        <div className="mt-1">
                                            {selectedStudent.payment_status === 'paid' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                                                    <CheckCircle size={12} className="mr-1" />Paid
                                                </span>
                                            ) : selectedStudent.payment_status === 'partial' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800">
                                                    <AlertCircle size={12} className="mr-1" />Partial
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800">
                                                    <XCircle size={12} className="mr-1" />Unpaid
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Details */}
                                {selectedStudent.is_currently_booked && selectedStudent.current_booking && (
                                    <div className="pt-4 border-t">
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Booking Details</Label>
                                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="font-medium text-blue-700 dark:text-blue-400">Duration</p>
                                                    <p className="text-blue-600 dark:text-blue-300">
                                                        {selectedStudent.current_booking.semester_count} semester{selectedStudent.current_booking.semester_count !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-blue-700 dark:text-blue-400">Total Fee</p>
                                                    <p className="text-blue-600 dark:text-blue-300">
                                                        ₱{(selectedStudent.current_booking.total_fee || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Student ID */}
                                <div className="pt-4 border-t">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Student ID: {selectedStudent.student_id}
                                    </div>
                                </div>
                            </div>
                        )}
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
                
                {/* Dormitorian Status Update Dialog */}
                <DormitorianStatusDialog
                    open={statusDialogOpen}
                    onClose={() => {
                        setStatusDialogOpen(false);
                        setStatusStudent(null);
                    }}
                    student={statusStudent}
                />
            </div>
        </AppLayout>
    );
}
