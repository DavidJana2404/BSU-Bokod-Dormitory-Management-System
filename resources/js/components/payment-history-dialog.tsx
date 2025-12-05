import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, XCircle, Clock, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentHistoryRecord {
    id: number;
    payment_status: 'paid' | 'partial' | 'unpaid';
    amount_paid: number | null;
    payment_notes: string | null;
    payment_date: string | null;
    school_year: string;
    processed_by: string;
    created_at: string;
    archived_at: string | null;
}

interface PaymentHistoryDialogProps {
    open: boolean;
    onClose: () => void;
    studentId: number | null;
    studentName: string | null;
}

export default function PaymentHistoryDialog({ open, onClose, studentId, studentName }: PaymentHistoryDialogProps) {
    const [history, setHistory] = useState<PaymentHistoryRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && studentId) {
            fetchPaymentHistory();
        }
    }, [open, studentId]);

    const fetchPaymentHistory = async () => {
        if (!studentId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/cashier/students/${studentId}/payment-history`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch payment history');
            }

            const data = await response.json();
            setHistory(data);
        } catch (err) {
            console.error('Error fetching payment history:', err);
            setError('Failed to load payment history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="text-green-600" size={16} />;
            case 'partial':
                return <AlertCircle className="text-yellow-600" size={16} />;
            case 'unpaid':
                return <XCircle className="text-red-600" size={16} />;
            default:
                return <Clock className="text-gray-600" size={16} />;
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800';
            case 'partial':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800';
            case 'unpaid':
                return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Payment History</DialogTitle>
                    <DialogDescription>
                        Payment records for {studentName}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading payment history...</p>
                    </div>
                ) : error ? (
                    <div className="py-8 text-center">
                        <XCircle className="text-red-600 mx-auto mb-4" size={48} />
                        <p className="text-red-600">{error}</p>
                        <Button variant="outline" onClick={fetchPaymentHistory} className="mt-4">
                            Try Again
                        </Button>
                    </div>
                ) : history.length === 0 ? (
                    <div className="py-8 text-center">
                        <Clock className="text-gray-400 mx-auto mb-4" size={48} />
                        <p className="text-gray-600 dark:text-gray-400">No payment history found for this dormitorian.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((record, index) => (
                            <div
                                key={record.id}
                                className={`p-4 rounded-lg border ${
                                    record.archived_at
                                        ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800'
                                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border ${getStatusBadgeClass(record.payment_status)}`}>
                                            {getStatusIcon(record.payment_status)}
                                            <span className="ml-1.5">
                                                {record.payment_status.charAt(0).toUpperCase() + record.payment_status.slice(1)}
                                            </span>
                                        </div>
                                        {record.archived_at && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                (Archived)
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                        {format(new Date(record.created_at), 'MMM dd, yyyy HH:mm')}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-3">
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount Paid</div>
                                        <div className={`text-sm font-semibold ${
                                            record.amount_paid
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {record.amount_paid ? `₱${parseFloat(record.amount_paid.toString()).toLocaleString()}` : 'No Payment'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Date</div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {record.payment_date
                                                ? format(new Date(record.payment_date), 'MMM dd, yyyy')
                                                : 'Not paid'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                            <Calendar size={12} />
                                            School Year
                                        </div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {record.school_year || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {record.payment_notes && (
                                    <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                                        <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Notes:</div>
                                        <div className="text-sm text-blue-800 dark:text-blue-300">
                                            {record.payment_notes}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    <User size={12} />
                                    <span>Processed by: {record.processed_by}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
