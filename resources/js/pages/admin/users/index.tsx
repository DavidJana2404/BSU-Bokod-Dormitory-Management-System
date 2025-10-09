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
    ShieldCheck, UserCheck, UserX, Building2, Settings
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

export default function AdminUsers() {
    const { staffUsers = [], students = [], errors = {} } = usePage().props as unknown as {
        staffUsers: StaffUser[];
        students: Student[];
        errors: any;
    };
    
    // Dialog states
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    
    // Form states
    const [roleForm, setRoleForm] = useState(emptyRoleForm);
    
    // Edit states
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    
    const [processing, setProcessing] = useState(false);
    const [expandedLeaveReasons, setExpandedLeaveReasons] = useState<Record<string, boolean>>({});
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{type: string, id: string | number, user?: any} | null>(null);

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
        }
    };

    const getWarningMessage = () => {
        if (!pendingAction || !pendingAction.user) return '';
        
        const user = pendingAction.user;
        const userName = user.name;
        const userType = user.userType;
        
        if (pendingAction.type === 'toggle_status') {
            return user.is_active 
                ? `Are you sure you want to deactivate ${userName}?\\n\\nDeactivating this ${userType} will:\\n• Prevent them from logging in\\n• Restrict access to the system\\n• You can reactivate them later\\n\\nConfirm deactivation?`
                : `Are you sure you want to activate ${userName}?\\n\\nActivating this ${userType} will:\\n• Allow them to log in\\n• Grant access to the system\\n\\nConfirm activation?`;
        }
        
        return '';
    };

    const studentList = Array.isArray(students) ? students : [];
    const staffUserList = Array.isArray(staffUsers) ? staffUsers : [];
    const managerList = staffUserList.filter(user => user.role === 'manager');
    const cashierList = staffUserList.filter(user => user.role === 'cashier');

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
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-600 text-white rounded-lg p-2">
                                <Shield size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{staffUserList.length}</div>
                                <div className="text-sm text-purple-600 dark:text-purple-400">Staff Users</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-green-600 text-white rounded-lg p-2">
                                <Settings size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{managerList.length}/{cashierList.length}</div>
                                <div className="text-sm text-green-600 dark:text-green-400">Mgr/Cashier</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 text-white rounded-lg p-2">
                                <Users size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{studentList.length}</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Students</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-600 text-white rounded-lg p-2">
                                <UserCheck size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {staffUserList.filter(u => u.is_active).length}
                                </div>
                                <div className="text-sm text-emerald-600 dark:text-emerald-400">Active Staff</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-600 text-white rounded-lg p-2">
                                <Bed size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {studentList.filter(s => s.is_currently_booked).length}
                                </div>
                                <div className="text-sm text-orange-600 dark:text-orange-400">Booked Students</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-600 text-white rounded-lg p-2">
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

                {/* Staff Users Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Shield className="text-purple-600 dark:text-purple-400" size={24} />
                            Staff Users ({staffUserList.length})
                        </h2>
                    </div>
                    
                    {staffUserList.length > 0 ? (
                        <div className="space-y-3">
                            {staffUserList.map((user) => (
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
                    )}
                </div>


                {/* Students Section - Dropdown Table Format */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Users className="text-blue-600 dark:text-blue-400" size={24} />
                            Students ({studentList.length})
                        </h2>
                    </div>
                    
                    {studentList.length > 0 ? (
                        <div className="space-y-3">
                            {studentList.map((student) => (
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
                            <p className="text-gray-500 dark:text-gray-500 mb-6">No students are currently registered in the system.</p>
                        </Card>
                    )}
                </div>

                {/* Role Edit Dialog */}
                <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                    <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
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