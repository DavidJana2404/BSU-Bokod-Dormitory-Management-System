import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, DollarSign, CheckCircle, XCircle, AlertCircle, Mail, Archive, Calendar, User } from 'lucide-react';
import React, { useState } from 'react';
import WarningDialog from '@/components/warning-dialog';

interface PaymentRecord {
    id: number;
    student_id: number;
    student_name: string;
    student_email: string;
    dormitory_name: string;
    room_number: string | null;
    payment_status: string;
    amount_paid: number | null;
    payment_notes: string | null;
    semester_count: number | null;
    payment_date: string | null;
    processed_by: string;
    created_at: string;
}

interface RecordsPageProps extends PageProps {
    records: PaymentRecord[];
    success?: string;
    error?: string;
}

export default function PaymentRecords() {
    const { records, success, error } = usePage<RecordsPageProps>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);

    const filteredRecords = records.filter(record => {
        const matchesSearch = record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            record.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            record.dormitory_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || record.payment_status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleArchive = (record: PaymentRecord) => {
        setSelectedRecord(record);
        setArchiveDialogOpen(true);
    };

    const confirmArchive = () => {
        if (!selectedRecord) return;
        router.post(`/cashier/records/${selectedRecord.id}/archive`);
        setArchiveDialogOpen(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                    <CheckCircle size={12} className="mr-1" />Paid
                </span>;
            case 'partial':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800">
                    <AlertCircle size={12} className="mr-1" />Partial
                </span>;
            case 'unpaid':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800">
                    <XCircle size={12} className="mr-1" />Unpaid
                </span>;
            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Payment Records', href: '/cashier/records' }]}>
            <Head title="Payment Records" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <FileText className="text-purple-600 dark:text-purple-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Payment Records</h1>
                        <p className="text-muted-foreground">View all payment transaction history</p>
                    </div>
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

                {/* Filters */}
                <Card className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <Label htmlFor="search">Search Records</Label>
                            <Input
                                id="search"
                                placeholder="Search by Dormitorian Name, email, or dormitory..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="status-filter">Filter by Status</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-48 mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Records</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Records List */}
                <Card>
                    <CardContent className="p-6">
                        <div className="max-h-[700px] overflow-y-auto space-y-3 pr-2 scrollbar-system">
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((record) => (
                                    <Card key={record.id} className="border border-gray-200 dark:border-gray-700">
                                        <CardContent className="p-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                                <div className="lg:col-span-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                                                            <DollarSign className="text-purple-600 dark:text-purple-400" size={18} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                                {record.student_name}
                                                            </h3>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                <Mail size={12} />
                                                                <span className="truncate">{record.student_email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="lg:col-span-2">
                                                    <div className="text-sm">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Dormitory</div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{record.dormitory_name}</div>
                                                        {record.room_number && (
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">Room {record.room_number}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="lg:col-span-2 text-center">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
                                                    {getStatusBadge(record.payment_status)}
                                                </div>

                                                <div className="lg:col-span-2 text-center">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Amount</div>
                                                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {record.amount_paid ? `â‚±${record.amount_paid.toLocaleString()}` : 'N/A'}
                                                    </div>
                                                </div>

                                                <div className="lg:col-span-2 flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleArchive(record)}
                                                        className="text-xs"
                                                    >
                                                        <Archive size={12} className="mr-1" />
                                                        Archive
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    <span>Transaction: {new Date(record.created_at).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <User size={12} />
                                                    <span>By: {record.processed_by}</span>
                                                </div>
                                            </div>

                                            {record.payment_notes && (
                                                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                                                    <span className="font-medium text-blue-700 dark:text-blue-400">Note: </span>
                                                    <span className="text-blue-800 dark:text-blue-300">{record.payment_notes}</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="mx-auto text-gray-400" size={48} />
                                    <h3 className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-400">No records found</h3>
                                    <p className="text-gray-500 dark:text-gray-500">No Payment Records match your search criteria.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <WarningDialog
                    open={archiveDialogOpen}
                    onClose={() => setArchiveDialogOpen(false)}
                    onConfirm={confirmArchive}
                    title="Archive Payment Record?"
                    message="Are you sure you want to archive this payment record? You can restore it later from the Archive settings."
                    confirmText="Archive Record"
                    isDestructive={false}
                />
            </div>
        </AppLayout>
    );
}
