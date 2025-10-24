import AppLayout from '@/layouts/app-layout';
import { usePage, router, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { 
    CheckCircle, XCircle, AlertCircle, Users, Edit3, Mail, Phone, Shield, 
    DollarSign, Plane, CheckCircle2, ChevronDown, Bed, Calendar, Eye, 
    ShieldCheck, UserCheck, UserX, Building2, Settings, Plus, Archive, Search
} from 'lucide-react';
import { Head } from '@inertiajs/react';
import WarningDialog from '@/components/warning-dialog';

interface StaffUser {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    role: string;
    tenant: { tenant_id: number; dormitory_name: string } | null;
}

interface Student {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: boolean;
    status: string;
    leave_reason: string | null;
    payment_status: string;
    is_currently_booked: boolean;
    dormitory: { tenant_id: number; dormitory_name: string } | null;
    current_booking: {
        room_number: string;
        semester_count: number;
        total_fee: number;
    } | null;
}

const emptyRoleForm = { role: 'manager' };
const emptyStudentForm = { first_name: '', last_name: '', email: '', phone: '', password: '', password_confirmation: '' };

export default function AdminUsers() {
    const { staffUsers = [], students = [], errors = {}, registrationEnabled = true } = usePage().props as unknown as {
        staffUsers: StaffUser[];
        students: Student[];
        errors: any;
        registrationEnabled: boolean;
    };
    
    // Dialog states
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [studentDialogOpen, setStudentDialogOpen] = useState(false);
    const [viewStudentModalOpen, setViewStudentModalOpen] = useState(false);
    
    // Form states
    const [roleForm, setRoleForm] = useState(emptyRoleForm);
    const [studentForm, setStudentForm] = useState(emptyStudentForm);
    
    // Edit states
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [isEditStudent, setIsEditStudent] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    
    const [processing, setProcessing] = useState(false);
    const [expandedLeaveReasons, setExpandedLeaveReasons] = useState<Record<string, boolean>>({});
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{type: string, id: string | number, user?: any, student?: any} | null>(null);
    const [toggleProcessing, setToggleProcessing] = useState(false);
    
    // Filter states
    const [activeFilter, setActiveFilter] = useState<'all' | 'staff' | 'students' | 'managers' | 'cashiers' | 'active-staff' | 'booked-students' | 'paid-students'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [studentsPage, setStudentsPage] = useState(1);
    const STUDENTS_PER_PAGE = 10;

    // Role edit functions
    const handleOpenRoleEdit = (user: StaffUser) => {
        setRoleForm({ role: user.role });
        setEditingUserId(user.id);
        setRoleDialogOpen(true);
    };

    const handleRoleSubmit = (e: any) => {
        e.preventDefault();
        setProcessing(true);
        
        router.put(`/admin/users/${editingUserId}/role`, roleForm, {
            onSuccess: () => {
                setRoleDialogOpen(false);
                setRoleForm(emptyRoleForm);
                setEditingUserId(null);
                setProcessing(false);
            },
            onError: () => {
                setProcessing(false);
            },
        });
    };


    const toggleLeaveReason = (studentId: string) => {
        setExpandedLeaveReasons(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const handleUserStatusToggle = (userId: number, user: any, userType: string) => {
        setPendingAction({ type: 'toggle_status', id: userId, user: { ...user, userType } });
        setWarningDialogOpen(true);
    };
    
    // Student management functions
    const handleOpenAddStudent = () => {
        setStudentForm(emptyStudentForm);
        setIsEditStudent(false);
        setEditingStudentId(null);
        setStudentDialogOpen(true);
    };
    
    const handleOpenEditStudent = (student: Student) => {
        setStudentForm({
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            phone: student.phone,
            password: '',
            password_confirmation: '',
        });
        setIsEditStudent(true);
        setEditingStudentId(student.student_id);
        setStudentDialogOpen(true);
    };
    
    const handleCloseStudentDialog = () => {
        setStudentDialogOpen(false);
        setStudentForm(emptyStudentForm);
        setIsEditStudent(false);
        setEditingStudentId(null);
    };
    
    const handleStudentFormChange = (e: any) => {
        setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
    };
    
    const handleStudentSubmit = (e: any) => {
        e.preventDefault();
        setProcessing(true);
        
        if (isEditStudent && editingStudentId) {
            router.put(`/admin/students/${editingStudentId}`, studentForm, {
                onSuccess: () => {
                    handleCloseStudentDialog();
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                },
            });
        } else {
            router.post('/admin/students', studentForm, {
                onSuccess: () => {
                    handleCloseStudentDialog();
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                },
            });
        }
    };
    
    const handleViewStudent = (student: Student) => {
        setSelectedStudent(student);
        setViewStudentModalOpen(true);
    };
    
    const handleArchiveStudent = (student: Student) => {
        setPendingAction({ type: 'archive_student', id: student.student_id, student });
        setWarningDialogOpen(true);
    };
    
    const handleArchiveStaffUser = (user: StaffUser) => {
        setPendingAction({ type: 'archive_user', id: user.id, user });
        setWarningDialogOpen(true);
    };

    const confirmAction = () => {
        if (!pendingAction) return;
        
        if (pendingAction.type === 'toggle_status') {
            router.post(`/admin/users/${pendingAction.id}/toggle-active`, {}, {
                onSuccess: () => {
                    setWarningDialogOpen(false);
                    setPendingAction(null);
                },
                onError: () => {
                    setWarningDialogOpen(false);
                    setPendingAction(null);
                }
            });
        } else if (pendingAction.type === 'archive_student') {
            router.delete(`/admin/students/${pendingAction.id}`, {
                onSuccess: () => {
                    setWarningDialogOpen(false);
                    setPendingAction(null);
                },
                onError: () => {
                    setWarningDialogOpen(false);
                    setPendingAction(null);
                }
            });
        } else if (pendingAction.type === 'archive_user') {
            router.delete(`/admin/users/${pendingAction.id}`, {
                onSuccess: () => {
                    setWarningDialogOpen(false);
                    setPendingAction(null);
                },
                onError: () => {
                    setWarningDialogOpen(false);
                    setPendingAction(null);
                }
            });
        }
    };

    const toggleRegistration = () => {
        if (toggleProcessing) return; // Prevent multiple clicks
        
        setToggleProcessing(true);
        
        router.post('/admin/users/toggle-registration', {}, {
            onSuccess: (page) => {
                setToggleProcessing(false);
                console.log('Registration toggle success', page);
                // Success message will be shown by the backend
            },
            onError: (errors) => {
                setToggleProcessing(false);
                console.error('Registration toggle error:', errors);
                // Error handling if needed
            },
            onFinish: () => {
                setToggleProcessing(false);
            }
        });
    };

    const getWarningMessage = () => {
        if (!pendingAction) return '';
        
        if (pendingAction.type === 'toggle_status' && pendingAction.user) {
            const user = pendingAction.user;
            const userName = user.name;
            const userType = user.userType;
            
            return user.is_active 
                ? `Are you sure you want to deactivate ${userName}?\\n\\nDeactivating this ${userType} will:\\n• Prevent them from logging in\\n• Restrict access to the system\\n• You can reactivate them later\\n\\nConfirm deactivation?`
                : `Are you sure you want to activate ${userName}?\\n\\nActivating this ${userType} will:\\n• Allow them to log in\\n• Grant access to the system\\n\\nConfirm activation?`;
        }
        
        if (pendingAction.type === 'archive_student' && pendingAction.student) {
            const student = pendingAction.student;
            const studentName = `${student.first_name} ${student.last_name}`;
            
            if (student.is_currently_booked && student.current_booking) {
                const roomNumber = student.current_booking.room_number;
                return `WARNING: ${studentName} has an active booking in Room ${roomNumber}!\\n\\nArchiving this student will:\\n• Keep their booking record but mark the student as archived\\n• The room assignment will remain until the booking period ends\\n• You can restore the student later from Archive settings\\n\\nAre you sure you want to archive this booked student?`;
            } else {
                return `Are you sure you want to archive ${studentName}?\\n\\nYou can restore them later from the Archive settings.`;
            }
        }
        
        if (pendingAction.type === 'archive_user' && pendingAction.user) {
            const user = pendingAction.user;
            const userName = user.name;
            const userRole = user.role;
            
            return `Are you sure you want to archive ${userName} (${userRole})?\\n\\nArchiving this staff user will:\\n• Remove them from active staff listings\\n• They won't be able to log in\\n• You can restore them later from Archive settings\\n\\nConfirm archiving?`;
        }
        
        return '';
    };

    const studentList = Array.isArray(students) ? students : [];
    const staffUserList = Array.isArray(staffUsers) ? staffUsers : [];
    const managerList = staffUserList.filter(user => user.role === 'manager');
    const cashierList = staffUserList.filter(user => user.role === 'cashier');
    
    // Filter students based on search term and active filter
    const getFilteredStudents = () => {
        let students = studentList;
        
        // Apply specific filters
        if (activeFilter === 'booked-students') {
            students = studentList.filter(s => s.is_currently_booked);
        } else if (activeFilter === 'paid-students') {
            students = studentList.filter(s => s.payment_status === 'paid');
        }
        
        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            students = students.filter(student => (
                student.first_name.toLowerCase().includes(searchLower) ||
                student.last_name.toLowerCase().includes(searchLower) ||
                student.email.toLowerCase().includes(searchLower) ||
                (student.dormitory?.dormitory_name || '').toLowerCase().includes(searchLower)
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
        <AppLayout breadcrumbs={[{ title: 'Users', href: '/admin/users' }]}>
            <Head title="Users Management" />
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <Users className="text-blue-600 dark:text-blue-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users Management</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage all system users: managers, cashiers, and students</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {/* All Users Filter */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'all' ? 'bg-gray-700' : 'bg-gray-600'} text-white`}
                                onClick={() => setActiveFilter('all')}
                                title="All Users"
                            >
                                <UserCheck size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{staffUserList.length + studentList.length}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">All Users</div>
                            </div>
                        </div>
                        
                        {/* Staff Users Filter */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'staff' ? 'bg-purple-700' : 'bg-purple-600'} text-white`}
                                onClick={() => setActiveFilter('staff')}
                                title="Staff Users Only"
                            >
                                <Shield size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{staffUserList.length}</div>
                                <div className="text-sm text-purple-600 dark:text-purple-400">Staff Users</div>
                            </div>
                        </div>
                        
                        {/* Manager/Cashier Ratio - Clickable for Managers */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'managers' ? 'bg-green-700' : 'bg-green-600'} text-white`}
                                onClick={() => setActiveFilter('managers')}
                                title="Managers Only"
                            >
                                <Settings size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{managerList.length}/{cashierList.length}</div>
                                <div className="text-sm text-green-600 dark:text-green-400">Mgr/Cashier</div>
                            </div>
                        </div>
                        
                        {/* Students Filter */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'students' ? 'bg-blue-700' : 'bg-blue-600'} text-white`}
                                onClick={() => setActiveFilter('students')}
                                title="Students Only"
                            >
                                <Users size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{studentList.length}</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Students</div>
                            </div>
                        </div>
                        
                        {/* Active Staff - Clickable */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'active-staff' ? 'bg-emerald-700' : 'bg-emerald-600'} text-white`}
                                onClick={() => setActiveFilter('active-staff')}
                                title="Active Staff Only"
                            >
                                <UserCheck size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {staffUserList.filter(u => u.is_active).length}
                                </div>
                                <div className="text-sm text-emerald-600 dark:text-emerald-400">Active Staff</div>
                            </div>
                        </div>
                        
                        {/* Booked Students - Clickable */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'booked-students' ? 'bg-orange-700' : 'bg-orange-600'} text-white`}
                                onClick={() => setActiveFilter('booked-students')}
                                title="Booked Students Only"
                            >
                                <Bed size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {studentList.filter(s => s.is_currently_booked).length}
                                </div>
                                <div className="text-sm text-orange-600 dark:text-orange-400">Booked Students</div>
                            </div>
                        </div>
                        
                        {/* Paid Students - Clickable */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'paid-students' ? 'bg-cyan-700' : 'bg-cyan-600'} text-white`}
                                onClick={() => setActiveFilter('paid-students')}
                                title="Paid Students Only"
                            >
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                                    {studentList.filter(s => s.payment_status === 'paid').length}
                                </div>
                                <div className="text-sm text-cyan-600 dark:text-cyan-400">Paid Students</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registration Control Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Settings className="text-orange-600 dark:text-orange-400" size={24} />
                            Account Registration Control
                        </h2>
                    </div>
                    
                    <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`rounded-lg p-2 ${
                                        registrationEnabled 
                                            ? 'bg-green-50 dark:bg-green-900/20'
                                            : 'bg-red-50 dark:bg-red-900/20'
                                    }`}>
                                        <Settings className={`${
                                            registrationEnabled 
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`} size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">New Account Registration</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Control whether new users can create accounts via the registration form
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${
                                        registrationEnabled 
                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800'
                                    }`}>
                                        {registrationEnabled ? (
                                            <>
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                                Registration Enabled
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                                Registration Disabled
                                            </>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={registrationEnabled ? "destructive" : "default"}
                                        onClick={toggleRegistration}
                                        disabled={toggleProcessing}
                                        className="text-sm"
                                    >
                                        {toggleProcessing ? (
                                            <>
                                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                                                {registrationEnabled ? 'Disabling...' : 'Enabling...'}
                                            </>
                                        ) : registrationEnabled ? (
                                            <>Disable Registration</>
                                        ) : (
                                            <>Enable Registration</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Staff Users Section */}
                {(activeFilter === 'all' || activeFilter === 'staff' || activeFilter === 'managers' || activeFilter === 'active-staff') && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Shield className="text-purple-600 dark:text-purple-400" size={24} />
                            {activeFilter === 'managers' ? `Managers (${managerList.length})` : 
                             activeFilter === 'active-staff' ? `Active Staff (${staffUserList.filter(u => u.is_active).length})` :
                             `Staff Users (${staffUserList.length})`}
                        </h2>
                    </div>
                    
                    {(() => {
                        let filteredStaff = staffUserList;
                        if (activeFilter === 'managers') {
                            filteredStaff = managerList;
                        } else if (activeFilter === 'active-staff') {
                            filteredStaff = staffUserList.filter(u => u.is_active);
                        }
                        
                        return filteredStaff.length > 0 ? (
                            <div className="space-y-3">
                                {filteredStaff.map((user) => (
                                <Card key={user.id} className="border border-gray-200 dark:border-gray-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`rounded-lg p-2 ${
                                                    user.role === 'manager' 
                                                        ? 'bg-purple-50 dark:bg-purple-900/20'
                                                        : 'bg-green-50 dark:bg-green-900/20'
                                                }`}>
                                                    {user.role === 'manager' ? (
                                                        <Shield className="text-purple-600 dark:text-purple-400" size={18} />
                                                    ) : (
                                                        <Settings className="text-green-600 dark:text-green-400" size={18} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</h3>
                                                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            user.role === 'manager'
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400'
                                                                : 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                                                        }`}>
                                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Mail size={12} className="text-blue-500" />
                                                        {user.email}
                                                    </div>
                                                    {user.tenant && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            <Building2 size={12} className="text-green-500" />
                                                            {user.tenant.dormitory_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    user.is_active 
                                                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800'
                                                }`}>
                                                    {user.is_active ? (
                                                        <>
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></div>
                                                            Inactive
                                                        </>
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleOpenRoleEdit(user)}
                                                    className="text-xs"
                                                >
                                                    <Edit3 size={12} className="mr-1" />
                                                    Role
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={user.is_active ? "destructive" : "default"}
                                                    onClick={() => handleUserStatusToggle(user.id, user, user.role)}
                                                    className="text-xs"
                                                >
                                                    {user.is_active ? (
                                                        <><UserX size={12} className="mr-1" />Deactivate</>
                                                    ) : (
                                                        <><UserCheck size={12} className="mr-1" />Activate</>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleArchiveStaffUser(user)}
                                                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                                                >
                                                    <Archive size={12} className="mr-1" />
                                                    Archive
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 text-center">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                    <Shield className="text-gray-400" size={24} />
                                </div>
                                <p className="text-gray-500 dark:text-gray-500">No staff users found</p>
                            </Card>
                        );
                    })()}
                </div>
                )}

                {/* Students Section - Separate Scrollable Container */}
                {(activeFilter === 'all' || activeFilter === 'students' || activeFilter === 'booked-students' || activeFilter === 'paid-students') && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Users className="text-blue-600 dark:text-blue-400" size={24} />
                            {activeFilter === 'booked-students' ? `Booked Students (${studentList.filter(s => s.is_currently_booked).length})` :
                             activeFilter === 'paid-students' ? `Paid Students (${studentList.filter(s => s.payment_status === 'paid').length})` :
                             `Students (${filteredStudents.length})`}
                        </h2>
                        <Button onClick={handleOpenAddStudent} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus size={18} /> Add New Student
                        </Button>
                    </div>
                    
                    {/* Students Container with Search and Scrolling */}
                    <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                            {/* Search Bar */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <Input
                                        placeholder="Search students by name, email, or dormitory..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setStudentsPage(1); // Reset pagination when searching
                                        }}
                                        className="pl-10"
                                    />
                                </div>
                                {searchTerm && (
                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        Found {filteredStudents.length} of {studentList.length} students
                                    </div>
                                )}
                            </div>
                            
                            {/* Students List - Scrollable */}
                            <div className="max-h-[600px] overflow-y-auto space-y-3 scrollbar-system">
                                {displayedStudents.length > 0 ? (
                                    <>
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
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                                        {student.first_name} {student.last_name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                        <Mail size={12} className="text-blue-500" />
                                                        <span className="truncate">{student.email}</span>
                                                    </div>
                                                    {student.dormitory && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                            <Building2 size={12} className="text-green-500" />
                                                            <span className="truncate">{student.dormitory.dormitory_name}</span>
                                                        </div>
                                                    )}
                                                    
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
                                                    onClick={() => handleOpenEditStudent(student)}
                                                    className="h-8 px-3 text-xs"
                                                >
                                                    <Edit3 size={12} className="mr-1" />
                                                    Edit
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleArchiveStudent(student)}
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
                                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm xl:text-base truncate">
                                                                {student.first_name} {student.last_name}
                                                            </h3>
                                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs xl:text-sm">
                                                                <Mail size={12} className="text-blue-500" />
                                                                <span className="truncate">{student.email}</span>
                                                            </div>
                                                            {student.dormitory && (
                                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs xl:text-sm">
                                                                    <Building2 size={12} className="text-green-500" />
                                                                    <span className="truncate">{student.dormitory.dormitory_name}</span>
                                                                </div>
                                                            )}
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
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleViewStudent(student)}
                                                        className="h-8 px-3 text-xs border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20"
                                                    >
                                                        <Eye size={12} className="mr-1" />
                                                        View
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleOpenEditStudent(student)}
                                                        className="h-8 px-3 text-xs"
                                                    >
                                                        <Edit3 size={12} className="mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleArchiveStudent(student)}
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
                                        
                                        {/* Load More Button */}
                                        {hasMoreStudents && (
                                            <div className="text-center pt-4">
                                                <Button 
                                                    onClick={loadMoreStudents}
                                                    variant="outline"
                                                    className="text-sm"
                                                >
                                                    Load More Students ({filteredStudents.length - displayedStudents.length} remaining)
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <Users className="text-gray-400" size={32} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                            {searchTerm ? 'No students found' : 'No students registered'}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-500">
                                            {searchTerm 
                                                ? `No students match "${searchTerm}". Try a different search term.`
                                                : 'No students are currently registered in the system.'
                                            }
                                        </p>
                                        {searchTerm && (
                                            <Button 
                                                onClick={() => setSearchTerm('')}
                                                variant="outline" 
                                                className="mt-4 text-sm"
                                            >
                                                Clear Search
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                )}

                {/* Student Add/Edit Dialog */}
                <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
                    <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-lg mx-auto max-h-[90vh] overflow-y-auto scrollbar-system">
                        <DialogHeader>
                            <DialogTitle>{isEditStudent ? 'Update Student' : 'Add Student'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleStudentSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="first_name">First Name</Label>
                                <Input id="first_name" name="first_name" value={studentForm.first_name} onChange={handleStudentFormChange} required />
                                {(errors as any)?.first_name && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {(errors as any).first_name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input id="last_name" name="last_name" value={studentForm.last_name} onChange={handleStudentFormChange} required />
                                {(errors as any)?.last_name && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {(errors as any).last_name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" value={studentForm.email} onChange={handleStudentFormChange} required />
                                {(errors as any)?.email && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {(errors as any).email}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" value={studentForm.phone} onChange={handleStudentFormChange} required />
                                {(errors as any)?.phone && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {(errors as any).phone}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="password">
                                    Password {!isEditStudent ? '(Optional - Required only for student login access)' : '(Leave blank to keep current password)'}
                                </Label>
                                <Input 
                                    id="password" 
                                    name="password" 
                                    type="password" 
                                    value={studentForm.password} 
                                    onChange={handleStudentFormChange} 
                                    placeholder={isEditStudent ? 'Leave blank to keep current password' : 'Min 8 characters if setting up login'} 
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
                                    Confirm Password {studentForm.password && '(Required when setting password)'}
                                </Label>
                                <Input 
                                    id="password_confirmation" 
                                    name="password_confirmation" 
                                    type="password" 
                                    value={studentForm.password_confirmation} 
                                    onChange={handleStudentFormChange} 
                                    placeholder={studentForm.password ? 'Must match password above' : 'Only required if password is set'} 
                                    disabled={!studentForm.password}
                                />
                                {(errors as any)?.password_confirmation && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {(errors as any).password_confirmation}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={handleCloseStudentDialog} disabled={processing}>Cancel</Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Processing...' : (isEditStudent ? 'Update' : 'Add Student')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
                
                {/* View Student Modal */}
                <Dialog open={viewStudentModalOpen} onOpenChange={setViewStudentModalOpen}>
                    <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl mx-auto max-h-[90vh] overflow-y-auto scrollbar-system">
                        <DialogHeader>
                            <DialogTitle>Student Details</DialogTitle>
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

                {/* Role Edit Dialog */}
                <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                    <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-lg mx-auto max-h-[90vh] overflow-y-auto scrollbar-system">
                        <DialogHeader>
                            <DialogTitle>Edit User Role</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleRoleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="user_role">Role</Label>
                                <select
                                    id="user_role"
                                    value={roleForm.role}
                                    onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    required
                                >
                                    <option value="manager">Manager</option>
                                    <option value="cashier">Cashier</option>
                                </select>
                                {(errors as any)?.role && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {(errors as any).role}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => {
                                        setRoleDialogOpen(false);
                                        setRoleForm(emptyRoleForm);
                                        setEditingUserId(null);
                                    }} 
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Role'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                
                {/* Warning Dialog */}
                <WarningDialog
                    open={warningDialogOpen}
                    onClose={() => {
                        setWarningDialogOpen(false);
                        setPendingAction(null);
                    }}
                    onConfirm={confirmAction}
                    title="Confirm Action"
                    message={getWarningMessage()}
                    confirmText="Confirm"
                    isDestructive={false}
                />
            </div>
        </AppLayout>
    );
}