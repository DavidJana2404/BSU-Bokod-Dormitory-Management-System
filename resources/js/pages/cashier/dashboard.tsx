import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Mail, Phone, Edit3 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface Student {
    student_id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dormitory_name: string;
    room_number: string | null;
    payment_status: 'unpaid' | 'paid' | 'partial';
    payment_date: string | null;
    amount_paid: number | null;
    payment_notes: string | null;
    price_per_semester: number;
    semester_count: number | null;
    total_fee: number | null;
    tenant_id: number;
    booking_id: number | null;
    has_booking: boolean;
}

interface Stats {
    total_students: number;
    paid_students: number;
    unpaid_students: number;
    partial_students: number;
    total_revenue: number;
    payment_rate: number;
}

interface CashierDashboardProps extends PageProps {
    students: Student[];
    stats: Stats;
    success?: string;
    error?: string;
}

export default function CashierDashboard() {
    const { students, stats, success, error } = usePage<CashierDashboardProps>().props;
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Filter students based on search term and status filter
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.dormitory_name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterStatus === 'all' || student.payment_status === filterStatus;
        
        return matchesSearch && matchesFilter;
    });

    const openPaymentDialog = (student: Student) => {
        setSelectedStudent(student);
        setPaymentStatus(student.payment_status);
        setAmountPaid(student.amount_paid?.toString() || '');
        setPaymentNotes(student.payment_notes || '');
        setIsDialogOpen(true);
    };
    
    // Automatically set amount when payment status changes
    useEffect(() => {
        if (selectedStudent && paymentStatus === 'paid') {
            // Set the full amount from the total semester fee (only if student has a booking)
            if (selectedStudent.has_booking && selectedStudent.total_fee) {
                setAmountPaid(selectedStudent.total_fee.toString());
            } else {
                setAmountPaid('0');
            }
        } else if (paymentStatus === 'unpaid') {
            // Clear amount for unpaid status
            setAmountPaid('');
        }
        // For partial payments, let the user enter manually
    }, [paymentStatus, selectedStudent]);

    const handleUpdatePayment = () => {
        if (!selectedStudent) return;

        router.put(`/cashier/students/${selectedStudent.student_id}/payment`, {
            payment_status: paymentStatus,
            amount_paid: paymentStatus === 'unpaid' ? null : parseFloat(amountPaid) || 0,
            payment_notes: paymentNotes,
        }, {
            onSuccess: () => {
                setIsDialogOpen(false);
                setSelectedStudent(null);
            },
            onError: (errors) => {
                console.error('Error updating payment:', errors);
            }
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="text-green-600" size={16} />;
            case 'partial': return <AlertCircle className="text-yellow-600" size={16} />;
            case 'unpaid': return <XCircle className="text-red-600" size={16} />;
            default: return <Clock className="text-gray-600" size={16} />;
        }
    };


    return (
        <AppLayout breadcrumbs={[{ title: 'Cashier Dashboard', href: '/cashier/dashboard' }]}>
            <Head title="Cashier Dashboard" />
            <div className="p-6 space-y-8">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <DollarSign className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Cashier Dashboard</h1>
                    </div>
                    <p className="text-muted-foreground mb-8">Manage student payments and track payment status across all dormitories</p>
                </div>

                {/* Flash Messages */}
                {success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}
                
                {error && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 text-center bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full w-fit mx-auto mb-4">
                            <Users className="text-blue-600 dark:text-blue-400" size={28} />
                        </div>
                        <div className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Total Students</div>
                        <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total_students}</div>
                    </Card>

                    <Card className="p-6 text-center bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                        <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full w-fit mx-auto mb-4">
                            <CheckCircle className="text-green-600 dark:text-green-400" size={28} />
                        </div>
                        <div className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">Paid Students</div>
                        <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.paid_students}</div>
                    </Card>

                    <Card className="p-6 text-center bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                        <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full w-fit mx-auto mb-4">
                            <XCircle className="text-red-600 dark:text-red-400" size={28} />
                        </div>
                        <div className="text-lg font-semibold mb-2 text-red-800 dark:text-red-200">Unpaid Students</div>
                        <div className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.unpaid_students}</div>
                    </Card>

                    <Card className="p-6 text-center bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full w-fit mx-auto mb-4">
                            <TrendingUp className="text-purple-600 dark:text-purple-400" size={28} />
                        </div>
                        <div className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-200">Payment Rate</div>
                        <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.payment_rate}%</div>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                        <div className="flex-1">
                            <Label htmlFor="search">Search Students</Label>
                            <Input
                                id="search"
                                placeholder="Search by name, email, or dormitory..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="status-filter">Filter by Status</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-48 mt-1">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Students</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end gap-2 pt-6 lg:pt-0">
                            <div className="text-sm text-muted-foreground">
                                Showing {filteredStudents.length} of {students.length} students
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Student Payment Management */}
                <div className="space-y-6">
                    {/* Section Header */}
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                            <DollarSign className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Student Payment Management</h2>
                            <p className="text-gray-600 dark:text-gray-400">Individual payment tracking and management</p>
                        </div>
                    </div>

                    {/* Students Cards */}
                    {filteredStudents.length > 0 ? (
                        <div className="space-y-4">
                            {filteredStudents.map((student) => (
                                <Card key={student.student_id} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                                    <CardContent className="p-5">
                                        {/* Mobile Layout */}
                                        <div className="block lg:hidden space-y-4">
                                            {/* Student Header */}
                                            <div className="flex items-start gap-4">
                                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex-shrink-0">
                                                    <DollarSign className="text-green-600 dark:text-green-400" size={20} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">
                                                        {student.full_name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                        <Mail size={14} className="text-blue-500" />
                                                        <span className="truncate">{student.email}</span>
                                                    </div>
                                                    
                                                    {/* Payment Information - Optimized Grid */}
                                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Payment Status</div>
                                                            <div className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border w-full justify-center ${
                                                                student.payment_status === 'paid' 
                                                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                                                    : student.payment_status === 'partial'
                                                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
                                                                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800'
                                                            }`}>
                                                                {getStatusIcon(student.payment_status)}
                                                                <span className="ml-1.5">
                                                                    {student.payment_status.charAt(0).toUpperCase() + student.payment_status.slice(1)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 text-center">
                                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Amount Paid</div>
                                                            <div className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border w-full justify-center ${
                                                                student.amount_paid 
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800'
                                                                    : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800'
                                                            }`}>
                                                                <CheckCircle size={12} className="mr-1.5" />
                                                                {student.amount_paid ? `₱${student.amount_paid.toLocaleString()}` : 'No Payment'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Total Fee & Payment Info */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1 text-center">
                                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                {student.has_booking ? 'Total Fee' : 'Status'}
                                                            </div>
                                                            {student.has_booking ? (
                                                                <>
                                                                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                                        ₱{student.total_fee?.toLocaleString() || 'N/A'}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {student.semester_count} semester{student.semester_count !== 1 ? 's' : ''}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                                                        No Booking
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Not assigned to room
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1 text-center">
                                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Payment Date</div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {student.payment_date 
                                                                    ? new Date(student.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                                    : 'Not paid'
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Action Button */}
                                                <div className="flex flex-col justify-start flex-shrink-0">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => openPaymentDialog(student)}
                                                        className="h-8 px-3 text-xs"
                                                    >
                                                        <Edit3 size={12} className="mr-1" />
                                                        Update
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Compact Details Section */}
                                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{student.phone}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dormitory</div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{student.dormitory_name}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Room</div>
                                                        <div className={`font-medium ${
                                                            student.room_number 
                                                                ? 'text-gray-900 dark:text-gray-100' 
                                                                : 'text-orange-600 dark:text-orange-400'
                                                        }`}>
                                                            {student.room_number ? `${student.room_number}` : 'None'}
                                                        </div>
                                                    </div>
                                                </div>
                                                {student.payment_notes && (
                                                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                        <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Payment Notes</div>
                                                        <div className="text-sm text-blue-800 dark:text-blue-300">
                                                            {student.payment_notes}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden lg:block">
                                            <div className="grid grid-cols-12 xl:grid-cols-20 gap-4 items-center">
                                                {/* Student Info - 4 columns on lg, 5 on xl */}
                                                <div className="col-span-4 xl:col-span-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 flex-shrink-0">
                                                            <DollarSign className="text-green-600 dark:text-green-400" size={20} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base xl:text-lg truncate">
                                                                {student.full_name}
                                                            </h3>
                                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                                                <Mail size={14} className="text-blue-500" />
                                                                <span className="truncate">{student.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mt-1">
                                                                <Phone size={12} className="text-green-500" />
                                                                <span className="truncate">{student.phone}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Dormitory & Room - 2 columns on lg, 2 on xl */}
                                                <div className="col-span-2 xl:col-span-2">
                                                    <div className="space-y-1">
                                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Location</div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {student.dormitory_name}
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                                            {student.room_number ? `Room ${student.room_number}` : 'No Room Assigned'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Payment Information - Optimized 4 columns */}
                                                <div className="col-span-4 xl:col-span-9 grid grid-cols-4 gap-3">
                                                    {/* Payment Status */}
                                                    <div className="space-y-1">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                                                        <div className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border w-full justify-center ${
                                                            student.payment_status === 'paid' 
                                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                                                : student.payment_status === 'partial'
                                                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
                                                                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800'
                                                        }`}>
                                                            {getStatusIcon(student.payment_status)}
                                                            <span className="ml-1.5">
                                                                {student.payment_status.charAt(0).toUpperCase() + student.payment_status.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Total Fee */}
                                                    <div className="space-y-1 text-center">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {student.has_booking ? 'Total Fee' : 'Status'}
                                                        </div>
                                                        {student.has_booking ? (
                                                            <>
                                                                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                                    ₱{student.total_fee?.toLocaleString() || 'N/A'}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {student.semester_count} sem
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                                                    No Booking
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    No room
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Amount Paid */}
                                                    <div className="space-y-1 text-center">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Amount Paid</div>
                                                        <div className={`text-sm font-semibold ${
                                                            student.amount_paid 
                                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                                : 'text-gray-500 dark:text-gray-400'
                                                        }`}>
                                                            {student.amount_paid ? `₱${student.amount_paid.toLocaleString()}` : 'No Payment'}
                                                        </div>
                                                    </div>

                                                    {/* Payment Date */}
                                                    <div className="space-y-1 text-center">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Payment Date</div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {student.payment_date 
                                                                ? new Date(student.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                                : 'Not paid'
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions - Compact */}
                                                <div className="col-span-2 xl:col-span-4">
                                                    <div className="flex justify-end">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            onClick={() => openPaymentDialog(student)}
                                                            className="h-8 px-3 text-xs"
                                                        >
                                                            <Edit3 size={12} className="mr-1" />
                                                            Update
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment Notes Section for Desktop - Compact */}
                                            {student.payment_notes && (
                                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                    <div className="flex items-start gap-2">
                                                        <div className="text-xs font-medium text-blue-700 dark:text-blue-400 flex-shrink-0">Notes:</div>
                                                        <div className="text-sm text-blue-800 dark:text-blue-300">
                                                            {student.payment_notes}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-12 text-center">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No students found</h3>
                            <p className="text-gray-500 dark:text-gray-500">No students match your search criteria or payment status filter.</p>
                        </Card>
                    )}
                </div>

                {/* Payment Update Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Update Payment Status</DialogTitle>
                            <DialogDescription>
                                Update payment information for {selectedStudent?.full_name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="payment-status">Payment Status</Label>
                                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unpaid">Unpaid</SelectItem>
                                        <SelectItem value="partial">Partial Payment</SelectItem>
                                        <SelectItem value="paid">Fully Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {paymentStatus === 'partial' && (
                                <div>
                                    <Label htmlFor="amount-paid">Amount Paid (₱)</Label>
                                    <Input
                                        id="amount-paid"
                                        type="number"
                                        step="0.01"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            )}
                            
                            {paymentStatus === 'paid' && selectedStudent && (
                                <div>
                                    <Label htmlFor="amount-display">Amount Paid (₱)</Label>
                                    {selectedStudent.has_booking && selectedStudent.total_fee ? (
                                        <div className="p-3 bg-muted rounded-md border">
                                            <div className="text-sm font-medium">
                                                ₱{selectedStudent.total_fee.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Full payment for {selectedStudent.semester_count} semester{selectedStudent.semester_count !== 1 ? 's' : ''} (₱2,000/semester)
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-md">
                                            <div className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                                Student has no active booking
                                            </div>
                                            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                                Cannot process payment without a room booking
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div>
                                <Label htmlFor="payment-notes">Notes (Optional)</Label>
                                <Input
                                    id="payment-notes"
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                    placeholder="Add any notes about this payment..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdatePayment}>
                                Update Payment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}