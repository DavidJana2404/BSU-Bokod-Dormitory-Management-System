import AppLayout from '@/layouts/app-layout';
import { usePage, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { 
    FileText, 
    Clock, 
    CheckCircle, 
    XCircle, 
    User, 
    Mail, 
    Phone, 
    Building2, 
    Calendar,
    Eye,
    ThumbsUp,
    ThumbsDown,
    Loader2,
    Search,
    RotateCcw,
    Archive
} from 'lucide-react';
import { Head } from '@inertiajs/react';
import WarningDialog from '@/components/warning-dialog';
import type { PageProps } from '@/types';

interface Application {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    additional_info?: string;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    created_at: string;
    processed_at?: string;
    tenant: {
        dormitory_name: string;
    };
    processed_by?: {
        name: string;
    };
}

interface ApplicationsPageProps extends PageProps {
    applications: Application[];
    error?: string;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Applications() {
    const { applications = [], error: serverError, flash } = usePage<ApplicationsPageProps>().props;
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const [pendingApproval, setPendingApproval] = useState<Application | null>(null);
    const [pendingRejection, setPendingRejection] = useState<Application | null>(null);
    const [pendingRestore, setPendingRestore] = useState<Application | null>(null);
    const [pendingArchive, setPendingArchive] = useState<Application | null>(null);
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);
    const [archiveAllModalOpen, setArchiveAllModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(serverError || flash?.error || null);
    const [success, setSuccess] = useState<string | null>(flash?.success || null);
    
    // Search and pagination states
    const [pendingSearchTerm, setPendingSearchTerm] = useState('');
    const [approvedSearchTerm, setApprovedSearchTerm] = useState('');
    const [rejectedSearchTerm, setRejectedSearchTerm] = useState('');
    const [pendingPage, setPendingPage] = useState(1);
    const [approvedPage, setApprovedPage] = useState(1);
    const [rejectedPage, setRejectedPage] = useState(1);
    const APPLICATIONS_PER_PAGE = 5;
    
    // Filter states
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    
    // Auto-dismiss success messages after 5 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);
    
    // Auto-dismiss error messages after 8 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 8000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleViewApplication = (application: Application) => {
        setSelectedApplication(application);
        setViewModalOpen(true);
    };

    const handleApprove = (application: Application) => {
        setPendingApproval(application);
        setWarningDialogOpen(true);
    };
    
    const confirmApproval = () => {
        if (!pendingApproval) return;
        
        console.log('=== APPROVAL STARTED ===');
        console.log('Application ID:', pendingApproval.id);
        console.log('Current status:', pendingApproval.status);
        console.log('Applications before approval:', applications.length);
        
        setProcessing(true);
        setError(null);
        setSuccess(null);
        
        router.visit(`/applications/${pendingApproval.id}/approve`, {
            method: 'put',
            preserveState: false,
            preserveScroll: false,
            replace: false,
            onBefore: () => {
                console.log('Request about to be sent...');
            },
            onStart: () => {
                console.log('Request started...');
            },
            onSuccess: (page) => {
                console.log('=== APPROVAL SUCCESS ===');
                console.log('Success response page:', page);
                console.log('Applications after approval:', page.props.applications?.length);
                console.log('Flash messages:', page.props.flash);
                setSuccess('Application approved successfully!');
                setWarningDialogOpen(false);
                setPendingApproval(null);
            },
            onError: (errors) => {
                console.error('=== APPROVAL ERROR ===');
                console.error('Error approving application:', errors);
                console.error('Full error object:', JSON.stringify(errors, null, 2));
                setError(errors?.message || Object.values(errors || {}).flat().join(', ') || 'Failed to approve application. Please try again.');
                setWarningDialogOpen(false);
                setPendingApproval(null);
            },
            onFinish: () => {
                console.log('=== APPROVAL FINISHED ===');
                console.log('Processing complete');
                setProcessing(false);
            },
        });
    };

    const handleReject = (application: Application) => {
        setSelectedApplication(application);
        setPendingRejection(application);
        setRejectionReason('');
        setRejectModalOpen(true);
    };

    const submitRejection = () => {
        if (!selectedApplication || !rejectionReason.trim()) return;
        
        setProcessing(true);
        setError(null);
        setSuccess(null);
        
        router.put(`/applications/${selectedApplication.id}/reject`, 
            { rejection_reason: rejectionReason },
            {
                onSuccess: (page) => {
                    console.log('Rejection success response:', page);
                    setSuccess('Application rejected successfully!');
                    setRejectModalOpen(false);
                    setSelectedApplication(null);
                    setPendingRejection(null);
                    setRejectionReason('');
                },
                onError: (errors) => {
                    console.error('Error rejecting application:', errors);
                    console.error('Full error object:', JSON.stringify(errors, null, 2));
                    setError(errors?.message || Object.values(errors || {}).flat().join(', ') || 'Failed to reject application. Please try again.');
                    setRejectModalOpen(false);
                    setPendingRejection(null);
                },
                onFinish: () => {
                    setProcessing(false);
                    console.log('Rejection request finished');
                },
            }
        );
    };

    const handleRevert = (application: Application) => {
        setPendingRestore(application);
        setRestoreModalOpen(true);
    };
    
    const confirmRevert = () => {
        if (!pendingRestore) return;
        
        setProcessing(true);
        setError(null);
        setSuccess(null);
        
        router.put(`/applications/${pendingRestore.id}/restore`, {}, {
            onSuccess: (page) => {
                console.log('Revert success response:', page);
                setSuccess('Application reverted to pending status successfully!');
                setRestoreModalOpen(false);
                setPendingRestore(null);
            },
            onError: (errors) => {
                console.error('Error reverting application:', errors);
                console.error('Full error object:', JSON.stringify(errors, null, 2));
                setError(errors?.message || Object.values(errors || {}).flat().join(', ') || 'Failed to revert application. Please try again.');
                setRestoreModalOpen(false);
                setPendingRestore(null);
            },
            onFinish: () => {
                setProcessing(false);
                console.log('Revert request finished');
            },
        });
    };
    
    const handleArchive = (application: Application) => {
        setPendingArchive(application);
        setArchiveModalOpen(true);
    };
    
    const confirmArchive = () => {
        if (!pendingArchive) return;
        
        setProcessing(true);
        setError(null);
        setSuccess(null);
        
        router.post(`/applications/${pendingArchive.id}/archive`, {}, {
            onSuccess: (page) => {
                console.log('Archive success response:', page);
                setSuccess('Application archived successfully!');
                setArchiveModalOpen(false);
                setPendingArchive(null);
            },
            onError: (errors) => {
                console.error('Error archiving application:', errors);
                console.error('Full error object:', JSON.stringify(errors, null, 2));
                setError(errors?.message || Object.values(errors || {}).flat().join(', ') || 'Failed to archive application. Please try again.');
                setArchiveModalOpen(false);
                setPendingArchive(null);
            },
            onFinish: () => {
                setProcessing(false);
                console.log('Archive request finished');
            },
        });
    };
    
    const handleArchiveAll = () => {
        setArchiveAllModalOpen(true);
    };
    
    const confirmArchiveAll = () => {
        setProcessing(true);
        setError(null);
        setSuccess(null);
        
        // Get all processed (approved and rejected) application IDs
        const processedApplicationIds = applications
            .filter(app => app.status === 'approved' || app.status === 'rejected')
            .map(app => app.id);
        
        if (processedApplicationIds.length === 0) {
            setError('No processed applications to archive.');
            setArchiveAllModalOpen(false);
            setProcessing(false);
            return;
        }
        
        // Archive applications one by one (you could also create a batch endpoint)
        let archived = 0;
        let failed = 0;
        
        const archiveNext = (index: number) => {
            if (index >= processedApplicationIds.length) {
                setProcessing(false);
                setArchiveAllModalOpen(false);
                if (failed === 0) {
                    setSuccess(`Successfully archived ${archived} application(s)!`);
                } else {
                    setError(`Archived ${archived} application(s), but ${failed} failed.`);
                }
                // Reload the page to refresh the list
                router.reload();
                return;
            }
            
            router.post(`/applications/${processedApplicationIds[index]}/archive`, {}, {
                onSuccess: () => {
                    archived++;
                    archiveNext(index + 1);
                },
                onError: () => {
                    failed++;
                    archiveNext(index + 1);
                },
                preserveState: true,
                preserveScroll: true,
            });
        };
        
        archiveNext(0);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800"><Clock size={12} className="mr-1" />Pending</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"><CheckCircle size={12} className="mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"><XCircle size={12} className="mr-1" />Rejected</Badge>;
            default:
                return null;
        }
    };

    // Filter pending applications based on search term
    const allPendingApplications = applications.filter(app => app.status === 'pending');
    const filteredPendingApplications = allPendingApplications.filter(app => {
        if (!pendingSearchTerm) return true;
        const searchLower = pendingSearchTerm.toLowerCase();
        return (
            app.first_name.toLowerCase().includes(searchLower) ||
            app.last_name.toLowerCase().includes(searchLower) ||
            app.email.toLowerCase().includes(searchLower) ||
            app.phone.toLowerCase().includes(searchLower) ||
            app.tenant.dormitory_name.toLowerCase().includes(searchLower)
        );
    });
    
    // Filter approved applications based on search term
    const allApprovedApplications = applications.filter(app => app.status === 'approved');
    const filteredApprovedApplications = allApprovedApplications.filter(app => {
        if (!approvedSearchTerm) return true;
        const searchLower = approvedSearchTerm.toLowerCase();
        return (
            app.first_name.toLowerCase().includes(searchLower) ||
            app.last_name.toLowerCase().includes(searchLower) ||
            app.email.toLowerCase().includes(searchLower) ||
            app.phone.toLowerCase().includes(searchLower) ||
            app.tenant.dormitory_name.toLowerCase().includes(searchLower)
        );
    });
    
    // Filter rejected applications based on search term
    const allRejectedApplications = applications.filter(app => app.status === 'rejected');
    const filteredRejectedApplications = allRejectedApplications.filter(app => {
        if (!rejectedSearchTerm) return true;
        const searchLower = rejectedSearchTerm.toLowerCase();
        return (
            app.first_name.toLowerCase().includes(searchLower) ||
            app.last_name.toLowerCase().includes(searchLower) ||
            app.email.toLowerCase().includes(searchLower) ||
            app.phone.toLowerCase().includes(searchLower) ||
            app.tenant.dormitory_name.toLowerCase().includes(searchLower)
        );
    });
    
    // Paginate applications for infinite scroll
    const displayedPendingApplications = filteredPendingApplications.slice(0, pendingPage * APPLICATIONS_PER_PAGE);
    const displayedApprovedApplications = filteredApprovedApplications.slice(0, approvedPage * APPLICATIONS_PER_PAGE);
    const displayedRejectedApplications = filteredRejectedApplications.slice(0, rejectedPage * APPLICATIONS_PER_PAGE);
    const hasMorePendingApplications = filteredPendingApplications.length > displayedPendingApplications.length;
    const hasMoreApprovedApplications = filteredApprovedApplications.length > displayedApprovedApplications.length;
    const hasMoreRejectedApplications = filteredRejectedApplications.length > displayedRejectedApplications.length;
    
    const loadMorePendingApplications = () => {
        if (hasMorePendingApplications) {
            setPendingPage(prev => prev + 1);
        }
    };
    
    const loadMoreApprovedApplications = () => {
        if (hasMoreApprovedApplications) {
            setApprovedPage(prev => prev + 1);
        }
    };
    
    const loadMoreRejectedApplications = () => {
        if (hasMoreRejectedApplications) {
            setRejectedPage(prev => prev + 1);
        }
    };
    
    // For compatibility, keep these names for stats
    const pendingApplications = allPendingApplications;
    const approvedApplications = allApprovedApplications;
    const rejectedApplications = allRejectedApplications;

    return (
        <AppLayout breadcrumbs={[{ title: 'Applications', href: '/applications' }]}>
            <Head title="Applications" />
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <FileText className="text-blue-600 dark:text-blue-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Applications</h1>
                            <p className="text-gray-600 dark:text-gray-400">Review and manage student dormitory applications</p>
                        </div>
                    </div>
                </div>

                {/* Error and Success Messages */}
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => setError(null)}
                        >
                            ×
                        </Button>
                    </Alert>
                )}
                
                {success && (
                    <Alert className="mb-4 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400">
                        <AlertDescription>{success}</AlertDescription>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => setSuccess(null)}
                        >
                            ×
                        </Button>
                    </Alert>
                )}

                {/* Applications Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Total Applications - Clickable */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'all' ? 'bg-blue-700' : 'bg-blue-600'} text-white`}
                                onClick={() => setActiveFilter('all')}
                                title="All Applications"
                            >
                                <FileText size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{applications.length}</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Total Applications</div>
                            </div>
                        </div>
                        
                        {/* Pending Applications - Clickable */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'pending' ? 'bg-yellow-700' : 'bg-yellow-600'} text-white`}
                                onClick={() => setActiveFilter('pending')}
                                title="Pending Applications Only"
                            >
                                <Clock size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingApplications.length}</div>
                                <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending Review</div>
                            </div>
                        </div>
                        
                        {/* Approved Applications - Clickable */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'approved' ? 'bg-green-700' : 'bg-green-600'} text-white`}
                                onClick={() => setActiveFilter('approved')}
                                title="Approved Applications Only"
                            >
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {applications.filter(app => app.status === 'approved').length}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">Approved</div>
                            </div>
                        </div>
                        
                        {/* Rejected Applications - Clickable */}
                        <div className="flex items-center gap-3">
                            <div 
                                className={`rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform ${activeFilter === 'rejected' ? 'bg-red-700' : 'bg-red-600'} text-white`}
                                onClick={() => setActiveFilter('rejected')}
                                title="Rejected Applications Only"
                            >
                                <XCircle size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {applications.filter(app => app.status === 'rejected').length}
                                </div>
                                <div className="text-sm text-red-600 dark:text-red-400">Rejected</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Applications Section */}
                {(activeFilter === 'all' || activeFilter === 'pending') && pendingApplications.length > 0 && (
                    <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                            {/* Search Bar */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <Clock className="text-yellow-500" size={20} />
                                    Pending Applications ({filteredPendingApplications.length})
                                </h2>
                            </div>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    placeholder="Search pending applications..."
                                    value={pendingSearchTerm}
                                    onChange={(e) => {
                                        setPendingSearchTerm(e.target.value);
                                        setPendingPage(1); // Reset pagination when searching
                                    }}
                                    className="pl-10"
                                />
                            </div>
                            {pendingSearchTerm && (
                                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                    Found {filteredPendingApplications.length} of {pendingApplications.length} pending applications
                                </div>
                            )}
                            
                            {/* Applications List - Scrollable */}
                            <div className="max-h-[600px] overflow-y-auto space-y-3 scrollbar-system">
                                {displayedPendingApplications.map((application) => (
                                <Card key={application.id} className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/10">
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                            {/* Applicant Info */}
                                            <div className="lg:col-span-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
                                                        <User className="text-blue-600 dark:text-blue-400" size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {application.first_name} {application.last_name}
                                                        </h3>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                            <Mail size={12} />
                                                            {application.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact & Dormitory */}
                                            <div className="lg:col-span-3 space-y-2">
                                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                    <Phone size={12} className="text-green-500" />
                                                    {application.phone}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                    <Building2 size={12} className="text-purple-500" />
                                                    {application.tenant.dormitory_name}
                                                </div>
                                            </div>

                                            {/* Application Date & Status */}
                                            <div className="lg:col-span-3 space-y-2">
                                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                    <Calendar size={12} className="text-orange-500" />
                                                    Applied: {new Date(application.created_at).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    {getStatusBadge(application.status)}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="lg:col-span-3 flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewApplication(application)}
                                                    className="h-8 px-3 text-xs"
                                                >
                                                    <Eye size={12} className="mr-1" />
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleApprove(application)}
                                                    disabled={processing}
                                                >
                                                    {processing && pendingApproval?.id === application.id ? (
                                                        <Loader2 size={12} className="mr-1 animate-spin" />
                                                    ) : (
                                                        <ThumbsUp size={12} className="mr-1" />
                                                    )}
                                                    {processing && pendingApproval?.id === application.id ? 'Approving...' : 'Approve'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleReject(application)}
                                                    className="h-8 px-3 text-xs"
                                                    disabled={processing}
                                                >
                                                    <ThumbsDown size={12} className="mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            
                            {/* Load More Button */}
                            {hasMorePendingApplications && (
                                <div className="pt-4 text-center">
                                    <Button
                                        variant="outline"
                                        onClick={loadMorePendingApplications}
                                        className="text-sm border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                                    >
                                        Load More Pending Applications
                                    </Button>
                                </div>
                            )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Processed Applications Section - Contains both Approved and Rejected */}
                {(activeFilter === 'all' || activeFilter === 'approved' || activeFilter === 'rejected') && (approvedApplications.length > 0 || rejectedApplications.length > 0) && (
                    <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <CheckCircle className="text-gray-500" size={20} />
                                    Processed Applications ({approvedApplications.length + rejectedApplications.length})
                                </h2>
                                {(approvedApplications.length > 0 || rejectedApplications.length > 0) && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleArchiveAll}
                                        disabled={processing}
                                        className="h-8 px-3 text-xs bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                                    >
                                        <Archive size={12} className="mr-1" />
                                        {processing ? 'Archiving...' : 'Archive All Processed'}
                                    </Button>
                                )}
                            </div>
                            
                            <div className="space-y-6">
                                {/* Approved Applications Section */}
                                {(activeFilter === 'all' || activeFilter === 'approved') && approvedApplications.length > 0 && (
                                    <Card className="border border-green-200 dark:border-green-800">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                    <CheckCircle className="text-green-500" size={18} />
                                                    Approved ({filteredApprovedApplications.length})
                                                </h3>
                                            </div>
                                            <div className="relative mb-4">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                                                <Input
                                                    placeholder="Search approved..."
                                                    value={approvedSearchTerm}
                                                    onChange={(e) => {
                                                        setApprovedSearchTerm(e.target.value);
                                                        setApprovedPage(1);
                                                    }}
                                                    className="pl-9 h-8 text-sm"
                                                />
                                            </div>
                                            {approvedSearchTerm && (
                                                <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                                                    Found {filteredApprovedApplications.length} of {approvedApplications.length}
                                                </div>
                                            )}
                                            
                                            <div className="max-h-[500px] overflow-y-auto space-y-3 scrollbar-system">
                                            {displayedApprovedApplications.map((application) => (
                                            <Card key={application.id} className="border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10">
                                                <CardContent className="p-3">
                                                    <div className="space-y-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2 flex-shrink-0">
                                                                <User className="text-green-600 dark:text-green-400" size={16} />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                                                    {application.first_name} {application.last_name}
                                                                </h4>
                                                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                                    <Mail size={10} />
                                                                    {application.email}
                                                                </div>
                                                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                                    <Building2 size={10} className="text-purple-500" />
                                                                    {application.tenant.dormitory_name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                                <Calendar size={10} className="text-orange-500" />
                                                                {application.processed_at ? 
                                                                    new Date(application.processed_at).toLocaleDateString() :
                                                                    new Date(application.created_at).toLocaleDateString()
                                                                }
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleViewApplication(application)}
                                                                    className="h-6 px-2 text-xs"
                                                                >
                                                                    <Eye size={10} className="mr-1" />
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleRevert(application)}
                                                                    className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                                                                    disabled={processing}
                                                                >
                                                                    {processing && pendingRestore?.id === application.id ? (
                                                                        <Loader2 size={10} className="mr-1 animate-spin" />
                                                                    ) : (
                                                                        <RotateCcw size={10} className="mr-1" />
                                                                    )}
                                                                    Revert
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleArchive(application)}
                                                                    className="h-6 px-2 text-xs bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                                                                    disabled={processing}
                                                                >
                                                                    {processing && pendingArchive?.id === application.id ? (
                                                                        <Loader2 size={10} className="mr-1 animate-spin" />
                                                                    ) : (
                                                                        <Archive size={10} className="mr-1" />
                                                                    )}
                                                                    Archive
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            ))}
                                            
                                            {hasMoreApprovedApplications && (
                                                <div className="pt-3 text-center">
                                                    <Button
                                                        variant="outline"
                                                        onClick={loadMoreApprovedApplications}
                                                        className="text-xs border-green-600 text-green-600 hover:bg-green-50 h-8"
                                                    >
                                                        Load More
                                                    </Button>
                                                </div>
                                            )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Rejected Applications Section */}
                                {(activeFilter === 'all' || activeFilter === 'rejected') && rejectedApplications.length > 0 && (
                                    <Card className="border border-red-200 dark:border-red-800">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                    <XCircle className="text-red-500" size={18} />
                                                    Rejected ({filteredRejectedApplications.length})
                                                </h3>
                                            </div>
                                            <div className="relative mb-4">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                                                <Input
                                                    placeholder="Search rejected..."
                                                    value={rejectedSearchTerm}
                                                    onChange={(e) => {
                                                        setRejectedSearchTerm(e.target.value);
                                                        setRejectedPage(1);
                                                    }}
                                                    className="pl-9 h-8 text-sm"
                                                />
                                            </div>
                                            {rejectedSearchTerm && (
                                                <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                                                    Found {filteredRejectedApplications.length} of {rejectedApplications.length}
                                                </div>
                                            )}
                                            
                                            <div className="max-h-[500px] overflow-y-auto space-y-3 scrollbar-system">
                                            {displayedRejectedApplications.map((application) => (
                                            <Card key={application.id} className="border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10">
                                                <CardContent className="p-3">
                                                    <div className="space-y-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-2 flex-shrink-0">
                                                                <User className="text-red-600 dark:text-red-400" size={16} />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                                                    {application.first_name} {application.last_name}
                                                                </h4>
                                                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                                    <Mail size={10} />
                                                                    {application.email}
                                                                </div>
                                                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                                    <Building2 size={10} className="text-purple-500" />
                                                                    {application.tenant.dormitory_name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                                <Calendar size={10} className="text-orange-500" />
                                                                {application.processed_at ? 
                                                                    new Date(application.processed_at).toLocaleDateString() :
                                                                    new Date(application.created_at).toLocaleDateString()
                                                                }
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleViewApplication(application)}
                                                                    className="h-6 px-2 text-xs"
                                                                >
                                                                    <Eye size={10} className="mr-1" />
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleRevert(application)}
                                                                    className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                                                                    disabled={processing}
                                                                >
                                                                    {processing && pendingRestore?.id === application.id ? (
                                                                        <Loader2 size={10} className="mr-1 animate-spin" />
                                                                    ) : (
                                                                        <RotateCcw size={10} className="mr-1" />
                                                                    )}
                                                                    Revert
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleArchive(application)}
                                                                    className="h-6 px-2 text-xs bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                                                                    disabled={processing}
                                                                >
                                                                    {processing && pendingArchive?.id === application.id ? (
                                                                        <Loader2 size={10} className="mr-1 animate-spin" />
                                                                    ) : (
                                                                        <Archive size={10} className="mr-1" />
                                                                    )}
                                                                    Archive
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            ))}
                                            
                                            {hasMoreRejectedApplications && (
                                                <div className="pt-3 text-center">
                                                    <Button
                                                        variant="outline"
                                                        onClick={loadMoreRejectedApplications}
                                                        className="text-xs border-red-600 text-red-600 hover:bg-red-50 h-8"
                                                    >
                                                        Load More
                                                    </Button>
                                                </div>
                                            )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {applications.length === 0 && (
                    <Card className="p-12 text-center">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <FileText className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No applications yet</h3>
                        <p className="text-gray-500 dark:text-gray-500">
                            Student applications will appear here when they are submitted through the public application form.
                        </p>
                    </Card>
                )}

                {/* View Application Modal */}
                <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                    <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl mx-auto max-h-[90vh] overflow-y-auto scrollbar-system">
                        <DialogHeader>
                            <DialogTitle>Application Details</DialogTitle>
                            <DialogDescription>
                                View detailed information about this student application.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedApplication && (
                            <div className="space-y-6">
                                {/* Applicant Information */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</Label>
                                        <p className="text-base font-semibold">{selectedApplication.first_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</Label>
                                        <p className="text-base font-semibold">{selectedApplication.last_name}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</Label>
                                        <p className="text-base">{selectedApplication.email}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</Label>
                                        <p className="text-base">{selectedApplication.phone}</p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Dormitory</Label>
                                    <p className="text-base font-semibold">{selectedApplication.tenant.dormitory_name}</p>
                                </div>

                                {selectedApplication.additional_info && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Additional Information</Label>
                                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                            <p className="text-sm whitespace-pre-wrap">{selectedApplication.additional_info}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Application Status */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</Label>
                                        <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                                    </div>
                                    <div className="text-right">
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Applied on
                                        </Label>
                                        <p className="text-sm">{new Date(selectedApplication.created_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                {selectedApplication.rejection_reason && (
                                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                                        <Label className="text-sm font-medium text-red-700 dark:text-red-400">Rejection Reason</Label>
                                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{selectedApplication.rejection_reason}</p>
                                    </div>
                                )}

                                {selectedApplication.processed_by && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Processed by {selectedApplication.processed_by.name} on {' '}
                                        {selectedApplication.processed_at && new Date(selectedApplication.processed_at).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Reject Application Modal */}
                <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
                    <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-lg mx-auto max-h-[90vh] overflow-y-auto scrollbar-system">
                        <DialogHeader>
                            <DialogTitle>Reject Application</DialogTitle>
                            <DialogDescription>
                                Provide a reason for rejecting this application.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedApplication && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    You are about to reject the application from <strong>{selectedApplication.first_name} {selectedApplication.last_name}</strong>. 
                                    Please provide a reason for the rejection.
                                </p>
                                
                                <div>
                                    <Label htmlFor="rejection_reason">Rejection Reason *</Label>
                                    <Textarea
                                        id="rejection_reason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Please explain why this application is being rejected..."
                                        rows={4}
                                        maxLength={1000}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{rejectionReason.length}/1000 characters</p>
                                </div>

                                <DialogFooter>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => {
                                            setRejectModalOpen(false);
                                            setPendingRejection(null);
                                            setRejectionReason('');
                                            setProcessing(false);
                                        }}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="destructive"
                                        onClick={submitRejection}
                                        disabled={processing || !rejectionReason.trim()}
                                    >
                                        {processing ? (
                                            <><Loader2 size={16} className="mr-2 animate-spin" />Rejecting...</>
                                        ) : (
                                            'Reject Application'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
                
                {/* Approval Warning Dialog */}
                <WarningDialog
                    open={warningDialogOpen}
                    onClose={() => {
                        setWarningDialogOpen(false);
                        setPendingApproval(null);
                        setProcessing(false);
                    }}
                    onConfirm={confirmApproval}
                    title="Approve Application?"
                    message={pendingApproval ? `Are you sure you want to approve the application from ${pendingApproval.first_name} ${pendingApproval.last_name}?\n\nThis will create a student account and add them to the system.` : ''}
                    confirmText={processing ? 'Approving...' : 'Approve Application'}
                    isDestructive={false}
                />
                
                {/* Revert Warning Dialog */}
                <WarningDialog
                    open={restoreModalOpen}
                    onClose={() => {
                        setRestoreModalOpen(false);
                        setPendingRestore(null);
                        setProcessing(false);
                    }}
                    onConfirm={confirmRevert}
                    title="Revert Application?"
                    message={pendingRestore ? `Are you sure you want to revert the application from ${pendingRestore.first_name} ${pendingRestore.last_name} back to pending status?\n\n${pendingRestore.status === 'approved' ? 'This will remove the student record that was created during approval.' : 'This will clear the rejection reason and allow you to process it again.'}` : ''}
                    confirmText={processing ? 'Reverting...' : 'Revert Application'}
                    isDestructive={false}
                />
                
                {/* Archive Warning Dialog */}
                <WarningDialog
                    open={archiveModalOpen}
                    onClose={() => {
                        setArchiveModalOpen(false);
                        setPendingArchive(null);
                        setProcessing(false);
                    }}
                    onConfirm={confirmArchive}
                    title="Archive Application?"
                    message={pendingArchive ? `Are you sure you want to archive the application from ${pendingArchive.first_name} ${pendingArchive.last_name}?\n\nArchived applications can be restored from the Archive in Settings.` : ''}
                    confirmText={processing ? 'Archiving...' : 'Archive Application'}
                    isDestructive={false}
                />
                
                {/* Archive All Warning Dialog */}
                <WarningDialog
                    open={archiveAllModalOpen}
                    onClose={() => {
                        setArchiveAllModalOpen(false);
                        setProcessing(false);
                    }}
                    onConfirm={confirmArchiveAll}
                    title="Archive All Processed Applications?"
                    message={`Are you sure you want to archive all ${approvedApplications.length + rejectedApplications.length} processed applications?\n\nThis will archive both approved and rejected applications. Archived applications can be restored from the Archive in Settings.`}
                    confirmText={processing ? 'Archiving...' : 'Archive All'}
                    isDestructive={false}
                />
            </div>
        </AppLayout>
    );
}
