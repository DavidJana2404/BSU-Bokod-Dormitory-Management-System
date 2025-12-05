import AppLayout from '@/layouts/app-layout';
import { usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { FileText, ArrowLeft, CheckCircle, XCircle, Clock, User, Calendar, AlertCircle, Home, Trash2 } from 'lucide-react';
import { Head } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface CleaningReport {
    id: number;
    student: {
        student_id: number;
        first_name: string;
        last_name: string;
    };
    reported_by: {
        student_id: number;
        first_name: string;
        last_name: string;
    };
    room_number: string;
    scheduled_date: string;
    reason: string | null;
    status: 'pending' | 'resolved' | 'dismissed';
    manager_notes: string | null;
    resolved_at: string | null;
    created_at: string;
}

interface CleaningReportsPageProps extends PageProps {
    reports: CleaningReport[];
    success?: string;
}

export default function CleaningReports() {
    const { reports = [], success } = usePage<CleaningReportsPageProps>().props;
    const [selectedReport, setSelectedReport] = useState<CleaningReport | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [managerNotes, setManagerNotes] = useState('');
    const [actionType, setActionType] = useState<'resolved' | 'dismissed'>('resolved');

    const handleOpenDialog = (report: CleaningReport, action: 'resolved' | 'dismissed') => {
        setSelectedReport(report);
        setActionType(action);
        setManagerNotes(report.manager_notes || '');
        setDialogOpen(true);
    };

    const handleSubmit = () => {
        if (!selectedReport) return;

        router.put(`/cleaning-schedules/reports/${selectedReport.id}`, {
            status: actionType,
            manager_notes: managerNotes,
        }, {
            onSuccess: () => {
                setDialogOpen(false);
                setSelectedReport(null);
                setManagerNotes('');
            }
        });
    };

    const handleDelete = (reportId: number) => {
        if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
            return;
        }
        
        router.delete(`/cleaning-schedules/reports/${reportId}`);
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800',
            resolved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800',
            dismissed: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800',
        };

        const icons = {
            pending: <Clock size={14} className="mr-1" />,
            resolved: <CheckCircle size={14} className="mr-1" />,
            dismissed: <XCircle size={14} className="mr-1" />,
        };

        return (
            <Badge variant="outline" className={styles[status as keyof typeof styles]}>
                {icons[status as keyof typeof icons]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const pendingReports = reports.filter(r => r.status === 'pending');
    const resolvedReports = reports.filter(r => r.status !== 'pending');

    return (
        <AppLayout breadcrumbs={[
            { title: 'Cleaning Schedules', href: '/cleaning-schedules' },
            { title: 'Reports', href: '/cleaning-schedules/reports' }
        ]}>
            <Head title="Cleaning Reports" />
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                            <FileText className="text-red-600 dark:text-red-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cleaning Reports</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage reports from dormitorians about missed cleanings</p>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={() => router.visit('/cleaning-schedules')} 
                        variant="outline" 
                        className="gap-2"
                    >
                        <ArrowLeft size={18} /> Back to Schedules
                    </Button>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                            <CheckCircle size={20} />
                            <span className="font-medium">{success}</span>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{reports.length}</p>
                                </div>
                                <FileText className="text-gray-400" size={40} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                    <p className="text-3xl font-bold text-yellow-600">{pendingReports.length}</p>
                                </div>
                                <Clock className="text-yellow-400" size={40} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                                    <p className="text-3xl font-bold text-green-600">{resolvedReports.length}</p>
                                </div>
                                <CheckCircle className="text-green-400" size={40} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Reports List */}
                {reports.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <FileText className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No Reports Yet</h3>
                            <p className="text-gray-500 dark:text-gray-500">Dormitorians can submit reports when cleaning schedules are not followed.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
                        {reports.map((report) => (
                            <Card key={report.id} className={`${report.status === 'pending' ? 'border-yellow-300 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-950/10' : ''}`}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                                            {report.student.first_name} {report.student.last_name}
                                                        </h3>
                                                        {getStatusBadge(report.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Reported by: {report.reported_by.first_name} {report.reported_by.last_name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Home size={16} className="text-blue-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">Room: <span className="font-medium text-gray-900 dark:text-gray-100">{report.room_number}</span></span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar size={16} className="text-purple-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">Scheduled: <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(report.scheduled_date).toLocaleDateString()}</span></span>
                                                </div>
                                            </div>

                                            {report.reason && (
                                                <div className="bg-gray-100 dark:bg-gray-800 rounded p-3">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason:</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{report.reason}</p>
                                                </div>
                                            )}

                                            {report.manager_notes && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Manager Notes:</p>
                                                    <p className="text-sm text-blue-600 dark:text-blue-400">{report.manager_notes}</p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                <span>Reported: {new Date(report.created_at).toLocaleString()}</span>
                                                {report.resolved_at && (
                                                    <span>• Resolved: {new Date(report.resolved_at).toLocaleString()}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 lg:w-48">
                                            {report.status === 'pending' && (
                                                <>
                                                    <Button 
                                                        onClick={() => handleOpenDialog(report, 'resolved')}
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                        size="sm"
                                                    >
                                                        <CheckCircle size={16} className="mr-2" />
                                                        Mark Resolved
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleOpenDialog(report, 'dismissed')}
                                                        variant="outline"
                                                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                                        size="sm"
                                                    >
                                                        <XCircle size={16} className="mr-2" />
                                                        Dismiss
                                                    </Button>
                                                </>
                                            )}
                                            <Button 
                                                onClick={() => handleDelete(report.id)}
                                                variant="outline"
                                                className="w-full border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                                                size="sm"
                                            >
                                                <Trash2 size={16} className="mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Action Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {actionType === 'resolved' ? 'Resolve Report' : 'Dismiss Report'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {selectedReport && (
                                <div className="bg-gray-100 dark:bg-gray-800 rounded p-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Report about: <span className="font-semibold text-gray-900 dark:text-gray-100">
                                            {selectedReport.student.first_name} {selectedReport.student.last_name}
                                        </span>
                                    </p>
                                </div>
                            )}
                            <div>
                                <Label htmlFor="manager_notes">Manager Notes (Optional)</Label>
                                <Textarea
                                    id="manager_notes"
                                    value={managerNotes}
                                    onChange={(e) => setManagerNotes(e.target.value)}
                                    placeholder="Add any notes about this decision..."
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSubmit}
                                className={actionType === 'resolved' ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                                {actionType === 'resolved' ? 'Mark as Resolved' : 'Dismiss Report'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
