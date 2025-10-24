import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { 
    Archive as ArchiveIcon, 
    RotateCcw, 
    Trash2, 
    Users, 
    Bed, 
    CalendarCheck,
    Clock,
    AlertCircle,
    Building2 
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import archive from '@/routes/archive';
import WarningDialog from '@/components/warning-dialog';

interface ArchivedItem {
    id: number;
    type: 'room' | 'student' | 'booking' | 'dormitory' | 'user';
    title: string;
    subtitle: string;
    archived_at: string;
    data: any;
}

interface ArchiveStats {
    dormitories: number;
    users: number;
    rooms: number;
    students: number;
    bookings: number;
    total: number;
}

interface ArchiveProps {
    archivedItems: ArchivedItem[];
    stats: ArchiveStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Archive settings',
        href: archive.index().url,
    },
];

const typeConfig = {
    dormitory: {
        icon: Building2,
        color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
        label: 'Dormitory'
    },
    user: {
        icon: Users,
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
        label: 'Staff User'
    },
    room: {
        icon: Bed,
        color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        label: 'Room'
    },
    student: {
        icon: Users,
        color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        label: 'Student'
    },
    booking: {
        icon: CalendarCheck,
        color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
        label: 'Booking'
    }
};

export default function ArchivePage({ archivedItems, stats }: ArchiveProps) {
    const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const [warningAction, setWarningAction] = useState<'restore' | 'delete' | 'clearAll' | null>(null);
    const [pendingItem, setPendingItem] = useState<{ type: string; id: number; title: string } | null>(null);
    const { auth } = usePage().props as any;
    const isAdmin = auth?.user?.role === 'admin';

    const handleRestore = (type: string, id: number, title: string) => {
        setPendingItem({ type, id, title });
        setWarningAction('restore');
        setWarningDialogOpen(true);
    };

    const handleDelete = (type: string, id: number, title: string) => {
        setPendingItem({ type, id, title });
        setWarningAction('delete');
        setWarningDialogOpen(true);
    };

    const handleClearAll = () => {
        setPendingItem({ type: 'all', id: 0, title: 'all archived items' });
        setWarningAction('clearAll');
        setWarningDialogOpen(true);
    };

    const confirmAction = () => {
        if (!pendingItem || !warningAction) return;
        
        const { type, id } = pendingItem;
        const key = `${warningAction}-${type}-${id}`;
        
        setProcessing(prev => ({ ...prev, [key]: true }));
        
        if (warningAction === 'restore') {
            router.post(`/settings/archive/restore/${type}/${id}`, {}, {
                onSuccess: () => {
                    setWarningDialogOpen(false);
                    setPendingItem(null);
                    setWarningAction(null);
                },
                onError: () => {
                    setWarningDialogOpen(false);
                    setPendingItem(null);
                    setWarningAction(null);
                },
                onFinish: () => {
                    setProcessing(prev => ({ ...prev, [key]: false }));
                }
            });
        } else if (warningAction === 'delete') {
            router.delete(`/settings/archive/force-delete/${type}/${id}`, {
                onSuccess: () => {
                    setWarningDialogOpen(false);
                    setPendingItem(null);
                    setWarningAction(null);
                },
                onError: () => {
                    setWarningDialogOpen(false);
                    setPendingItem(null);
                    setWarningAction(null);
                },
                onFinish: () => {
                    setProcessing(prev => ({ ...prev, [key]: false }));
                }
            });
        } else if (warningAction === 'clearAll') {
            router.delete('/settings/archive/clear-all', {
                onSuccess: () => {
                    setWarningDialogOpen(false);
                    setPendingItem(null);
                    setWarningAction(null);
                },
                onError: () => {
                    setWarningDialogOpen(false);
                    setPendingItem(null);
                    setWarningAction(null);
                },
                onFinish: () => {
                    setProcessing(prev => ({ ...prev, [key]: false }));
                }
            });
        }
    };

    const getWarningMessage = () => {
        if (!pendingItem) return '';
        
        if (warningAction === 'restore') {
            return `Are you sure you want to restore "${pendingItem.title}"?\n\nThis will return the item to its original location and make it active again.`;
        } else if (warningAction === 'delete') {
            return `Are you sure you want to permanently delete "${pendingItem.title}"?\n\nThis action cannot be undone and the item will be completely removed from the database.`;
        } else if (warningAction === 'clearAll') {
            const totalItems = stats.total;
            const itemText = isAdmin ? 'dormitories, staff users, and students' : 'rooms, students, and bookings';
            return `Are you sure you want to permanently delete ALL ${totalItems} archived ${itemText}?\\n\\nThis action cannot be undone and all archived items will be completely removed from the database.`;
        }
        
        return '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archive settings" />
            
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall 
                        title="Archive" 
                        description={isAdmin ? "Manage archived dormitories, staff users, and students" : "Manage archived rooms, students, and bookings"} 
                    />

                    {/* Stats Cards */}
                    <div className={`grid grid-cols-2 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-4'} gap-3 sm:gap-4`}>
                    {isAdmin && (
                        <>
                        <Card className="text-center bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                            <CardContent className="p-4 sm:p-6">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Building2 className="text-orange-600 dark:text-orange-400" size={24} />
                                </div>
                                <div className="text-sm sm:text-lg font-semibold mb-2 text-orange-800 dark:text-orange-200">Archived Dormitories</div>
                                <div className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.dormitories}</div>
                            </CardContent>
                        </Card>
                        
                        <Card className="text-center bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                            <CardContent className="p-4 sm:p-6">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="text-indigo-600 dark:text-indigo-400" size={24} />
                                </div>
                                <div className="text-sm sm:text-lg font-semibold mb-2 text-indigo-800 dark:text-indigo-200">Archived Staff Users</div>
                                <div className="text-2xl sm:text-3xl font-bold text-indigo-900 dark:text-indigo-100">{stats.users}</div>
                            </CardContent>
                        </Card>
                        </>
                    )}
                    
                    {/* Students Card - Show for both admin and manager */}
                    <Card className="text-center bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <CardContent className="p-4 sm:p-6">
                            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Users className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                            <div className="text-sm sm:text-lg font-semibold mb-2 text-green-800 dark:text-green-200">Archived Students</div>
                            <div className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100">{stats.students}</div>
                        </CardContent>
                    </Card>
                    
                    {/* Bookings Card - Show for manager only (not admin) */}
                    {!isAdmin && (
                    <Card className="text-center bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <CardContent className="p-4 sm:p-6">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <CalendarCheck className="text-purple-600 dark:text-purple-400" size={24} />
                            </div>
                            <div className="text-sm sm:text-lg font-semibold mb-2 text-purple-800 dark:text-purple-200">Archived Bookings</div>
                            <div className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.bookings}</div>
                        </CardContent>
                    </Card>
                    )}

                    {/* Rooms Card - Show only for managers */}
                    {!isAdmin && (
                        <Card className="text-center bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                            <CardContent className="p-4 sm:p-6">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Bed className="text-blue-600 dark:text-blue-400" size={24} />
                                </div>
                                <div className="text-sm sm:text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Archived Rooms</div>
                                <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.rooms}</div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="text-center bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <CardContent className="p-4 sm:p-6">
                            <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <ArchiveIcon className="text-gray-600 dark:text-gray-400" size={24} />
                            </div>
                            <div className="text-sm sm:text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Total Archived</div>
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
                        </CardContent>
                    </Card>
                    </div>

                    {/* Archived Items */}
                    <Card className="flex-1">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ArchiveIcon className="h-5 w-5" />
                                    Archived Items ({archivedItems.length})
                                </CardTitle>
                                {archivedItems.length > 0 && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleClearAll}
                                        disabled={processing['clearAll']}
                                        className="h-8 px-3 text-xs"
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        {processing['clearAll'] ? 'Clearing...' : 'Clear All'}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                        {archivedItems.length === 0 ? (
                            <div className="text-center py-16 sm:py-20">
                                <ArchiveIcon className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                                    No archived items
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-base max-w-sm mx-auto">
                                    Items that you archive will appear here for easy restoration or permanent removal.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {archivedItems.map((item) => {
                                    const config = typeConfig[item.type];
                                    const IconComponent = config.icon;
                                    
                                    return (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 border rounded-lg border-gray-200 dark:border-gray-700 space-y-4 sm:space-y-0"
                                        >
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`p-2.5 rounded-lg ${config.color} flex-shrink-0`}>
                                                    <IconComponent className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base truncate">
                                                            {item.title}
                                                        </h4>
                                                        <Badge variant="outline" className={`${config.color} text-xs flex-shrink-0 w-fit`}>
                                                            {config.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                                        {item.subtitle}
                                                    </p>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Archived {format(new Date(item.archived_at), 'MMM d, yyyy')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRestore(item.type, item.id, item.title)}
                                                    disabled={processing[`restore-${item.type}-${item.id}`]}
                                                    className="h-8 px-3 text-xs border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20 flex-1 sm:flex-initial"
                                                >
                                                    <RotateCcw className="h-3 w-3 mr-1" />
                                                    {processing[`restore-${item.type}-${item.id}`] ? 'Restoring...' : 'Restore'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(item.type, item.id, item.title)}
                                                    disabled={processing[`delete-${item.type}-${item.id}`]}
                                                    className="h-8 px-3 text-xs border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/20 flex-1 sm:flex-initial"
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    {processing[`delete-${item.type}-${item.id}`] ? 'Deleting...' : 'Delete Forever'}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        </CardContent>
                    </Card>

                    {/* Warning Card */}
                    {archivedItems.length > 0 && (
                        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
                            <CardContent className="p-4 sm:p-6">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                                        Important Information
                                    </h4>
                                    <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                        <p><strong>Restore:</strong> Returns the item to its original location and makes it active again.</p>
                                        <p><strong>Delete Forever:</strong> Permanently removes the item from the database. This action cannot be undone.</p>
                                        <p>Archived items do not appear in regular listings and do not affect system functionality.</p>
                                    </div>
                                </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SettingsLayout>
            
            {/* Warning Dialog */}
            <WarningDialog
                open={warningDialogOpen}
                onClose={() => {
                    setWarningDialogOpen(false);
                    setPendingItem(null);
                    setWarningAction(null);
                }}
                onConfirm={confirmAction}
                title={
                    warningAction === 'restore' ? 'Restore Item?' : 
                    warningAction === 'clearAll' ? 'Clear All Archives?' : 
                    'Delete Forever?'
                }
                message={getWarningMessage()}
                confirmText={
                    warningAction === 'restore' ? 'Restore Item' : 
                    warningAction === 'clearAll' ? 'Clear All' : 
                    'Delete Forever'
                }
                isDestructive={warningAction === 'delete' || warningAction === 'clearAll'}
            />
        </AppLayout>
    );
}