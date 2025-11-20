import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { 
    Database, 
    Download, 
    Upload, 
    Trash2,
    AlertTriangle,
    Clock,
    HardDrive,
    CheckCircle2,
    Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import WarningDialog from '@/components/warning-dialog';

interface Backup {
    filename: string;
    size: number;
    size_formatted: string;
    created_at: string;
    created_at_formatted: string;
}

interface BackupProps {
    backups: Backup[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Backup & Restore',
        href: '/settings/backup',
    },
];

export default function BackupPage({ backups }: BackupProps) {
    const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const [warningAction, setWarningAction] = useState<'restore' | 'delete' | null>(null);
    const [pendingFilename, setPendingFilename] = useState<string | null>(null);

    const handleCreateBackup = () => {
        setProcessing(prev => ({ ...prev, create: true }));
        router.post('/settings/backup/create', {}, {
            onFinish: () => {
                setProcessing(prev => ({ ...prev, create: false }));
            }
        });
    };

    const handleDownload = (filename: string) => {
        window.location.href = `/settings/backup/download/${filename}`;
    };

    const handleRestore = (filename: string) => {
        setPendingFilename(filename);
        setWarningAction('restore');
        setWarningDialogOpen(true);
    };

    const handleDelete = (filename: string) => {
        setPendingFilename(filename);
        setWarningAction('delete');
        setWarningDialogOpen(true);
    };

    const confirmAction = () => {
        if (!pendingFilename || !warningAction) return;
        
        const key = `${warningAction}-${pendingFilename}`;
        setProcessing(prev => ({ ...prev, [key]: true }));
        
        if (warningAction === 'restore') {
            router.post(`/settings/backup/restore/${pendingFilename}`, {}, {
                onSuccess: () => {
                    setWarningDialogOpen(false);
                    setPendingFilename(null);
                    setWarningAction(null);
                },
                onError: () => {
                    setWarningDialogOpen(false);
                    setPendingFilename(null);
                    setWarningAction(null);
                },
                onFinish: () => {
                    setProcessing(prev => ({ ...prev, [key]: false }));
                }
            });
        } else if (warningAction === 'delete') {
            router.delete(`/settings/backup/delete/${pendingFilename}`, {
                onSuccess: () => {
                    setWarningDialogOpen(false);
                    setPendingFilename(null);
                    setWarningAction(null);
                },
                onError: () => {
                    setWarningDialogOpen(false);
                    setPendingFilename(null);
                    setWarningAction(null);
                },
                onFinish: () => {
                    setProcessing(prev => ({ ...prev, [key]: false }));
                }
            });
        }
    };

    const getWarningMessage = () => {
        if (!pendingFilename) return '';
        
        if (warningAction === 'restore') {
            return `Are you sure you want to restore the database from "${pendingFilename}"?\n\nWARNING: This will replace ALL current data in the system with the data from this backup. Any changes made after this backup was created will be LOST.\n\nA backup of the current database will be created automatically before restoring.`;
        } else if (warningAction === 'delete') {
            return `Are you sure you want to permanently delete the backup "${pendingFilename}"?\n\nThis action cannot be undone.`;
        }
        
        return '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Backup & Restore" />
            
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall 
                        title="Backup & Restore" 
                        description="Create, download, and restore database backups"
                    />

                    {/* Info Card */}
                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex gap-3">
                                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                                        About Database Backups
                                    </h4>
                                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                        <p><strong>Create Backup:</strong> Creates a complete backup of all system data including dormitories, students, bookings, applications, and users.</p>
                                        <p><strong>Download:</strong> Save backup files to your computer for safe keeping.</p>
                                        <p><strong>Restore:</strong> Replace current database with data from a backup file.</p>
                                        <p className="text-yellow-700 dark:text-yellow-300 mt-2"><strong>⚠️ Important:</strong> Always create a backup before making major changes to the system.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Create Backup Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Plus className="h-5 w-5" />
                                Create New Backup
                            </CardTitle>
                            <CardDescription>
                                Create a complete backup of the current database
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={handleCreateBackup}
                                disabled={processing.create}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Database className="h-4 w-4 mr-2" />
                                {processing.create ? 'Creating Backup...' : 'Create Backup Now'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Existing Backups */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <HardDrive className="h-5 w-5" />
                                    Available Backups ({backups.length})
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {backups.length === 0 ? (
                                <div className="text-center py-16 sm:py-20">
                                    <Database className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                                    <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                                        No backups yet
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-base max-w-sm mx-auto">
                                        Create your first backup to protect your data. Regular backups are recommended.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {backups.map((backup) => (
                                        <div
                                            key={backup.filename}
                                            className="flex flex-col p-4 sm:p-5 border rounded-lg border-gray-200 dark:border-gray-700 gap-4"
                                        >
                                            {/* File Info Section */}
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 flex-shrink-0">
                                                    <Database className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col gap-2 mb-2">
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base break-all">
                                                            {backup.filename}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800 text-xs flex-shrink-0 w-fit">
                                                                {backup.size_formatted}
                                                            </Badge>
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {backup.created_at_formatted}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Action Buttons Section */}
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(backup.filename)}
                                                    className="h-9 px-3 text-xs sm:text-sm border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20 flex-1 sm:flex-initial whitespace-nowrap"
                                                >
                                                    <Download className="h-3.5 w-3.5 mr-1.5" />
                                                    Download
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRestore(backup.filename)}
                                                    disabled={processing[`restore-${backup.filename}`]}
                                                    className="h-9 px-3 text-xs sm:text-sm border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20 flex-1 sm:flex-initial whitespace-nowrap"
                                                >
                                                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                                                    {processing[`restore-${backup.filename}`] ? 'Restoring...' : 'Restore'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(backup.filename)}
                                                    disabled={processing[`delete-${backup.filename}`]}
                                                    className="h-9 px-3 text-xs sm:text-sm border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/20 flex-1 sm:flex-initial whitespace-nowrap"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                                    {processing[`delete-${backup.filename}`] ? 'Deleting...' : 'Delete'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Warning Card */}
                    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                                        Important Safety Information
                                    </h4>
                                    <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                        <p>• Always <strong>download backups</strong> to your computer for extra safety</p>
                                        <p>• <strong>Test restored backups</strong> in a development environment first if possible</p>
                                        <p>• <strong>Restoring a backup</strong> will replace ALL current data with the backup data</p>
                                        <p>• A safety backup of the current database is created automatically before restoring</p>
                                        <p>• Keep multiple backup versions for different points in time</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
            
            {/* Warning Dialog */}
            <WarningDialog
                open={warningDialogOpen}
                onClose={() => {
                    setWarningDialogOpen(false);
                    setPendingFilename(null);
                    setWarningAction(null);
                }}
                onConfirm={confirmAction}
                title={
                    warningAction === 'restore' ? 'Restore Database?' : 'Delete Backup?'
                }
                message={getWarningMessage()}
                confirmText={
                    warningAction === 'restore' ? 'Restore Database' : 'Delete Backup'
                }
                isDestructive={true}
            />
        </AppLayout>
    );
}
