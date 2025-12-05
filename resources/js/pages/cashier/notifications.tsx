import AppLayout from '@/layouts/app-layout';
import { usePage, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, CheckCircle, Archive, User, History, Calendar, Clock, DollarSign, Home } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { format } from 'date-fns';
import PaymentHistoryDialog from '@/components/payment-history-dialog';

interface Notification {
    id: number;
    type: string;
    student_id: number;
    student_name: string;
    message: string;
    is_read: boolean;
    created_at: string;
    booked_at: string | null;
    archived_at: string | null;
    days_stayed: number | null;
    months_stayed: number | null;
    calculated_cost: number | null;
    total_semesters: number | null;
    room_number: string | null;
    student: {
        student_id: number;
        first_name: string;
        last_name: string;
        email: string;
        is_archived: boolean;
    } | null;
}

interface PageProps {
    notifications: Notification[];
    unreadCount: number;
}

export default function CashierNotifications() {
    const { notifications, unreadCount } = usePage<PageProps>().props;
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [selectedStudentName, setSelectedStudentName] = useState<string>('');

    const handleMarkAsRead = (notificationId: number) => {
        router.post(`/cashier/notifications/${notificationId}/read`, {}, {
            preserveScroll: true,
        });
    };

    const handleMarkAllAsRead = () => {
        router.post('/cashier/notifications/read-all', {}, {
            preserveScroll: true,
        });
    };

    const handleViewHistory = (notification: Notification) => {
        if (notification.student_id) {
            setSelectedStudentId(notification.student_id);
            setSelectedStudentName(notification.student_name);
            setHistoryDialogOpen(true);
        }
    };

    const getNotificationIcon = (type: string, isRead: boolean) => {
        if (type === 'student_archived' || type === 'booking_archived') {
            return <Archive size={20} className={isRead ? 'text-gray-400' : 'text-orange-500'} />;
        }
        return <Bell size={20} className={isRead ? 'text-gray-400' : 'text-blue-500'} />;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Notifications', href: '/cashier/notifications' }]}>
            <Head title="Notifications" />
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <Bell className="text-blue-600 dark:text-blue-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Stay informed about archived dormitorians and bookings
                            </p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            onClick={handleMarkAllAsRead}
                            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <CheckCircle size={18} />
                            Mark All as Read
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 text-white rounded-lg p-2">
                                <Bell size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {notifications.length}
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Total Notifications</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-600 text-white rounded-lg p-2">
                                <BellOff size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {unreadCount}
                                </div>
                                <div className="text-sm text-orange-600 dark:text-orange-400">Unread</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                {notifications.length > 0 ? (
                    <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Bell className="text-blue-600 dark:text-blue-400" size={20} />
                                All Notifications
                            </h2>

                            <div className="max-h-[600px] overflow-y-auto space-y-3">
                                {notifications.map((notification) => (
                                    <Card
                                        key={notification.id}
                                        className={`border ${
                                            notification.is_read
                                                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                                                : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20'
                                        }`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type, notification.is_read)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                                {notification.student_name}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                {notification.message}
                                                            </p>
                                                        </div>
                                                        {!notification.is_read && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                                        )}
                                                    </div>

                                                    {notification.student && (
                                                        <div className="space-y-2 mt-3">
                                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                                <div className="flex items-center gap-1">
                                                                    <User size={14} />
                                                                    {notification.student.email}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar size={14} />
                                                                    {format(new Date(notification.created_at), 'MMM dd, yyyy h:mm a')}
                                                                </div>
                                                                {notification.student.is_archived && (
                                                                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                                                        <Archive size={14} />
                                                                        Archived
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Booking Details */}
                                                            {notification.type === 'booking_archived' && notification.days_stayed !== null && (
                                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
                                                                    <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                                                        Booking Duration & Cost
                                                                    </div>
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                                                        {notification.room_number && (
                                                                            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                                                                <Home size={14} className="text-blue-600 dark:text-blue-400" />
                                                                                <div>
                                                                                    <div className="text-gray-500 dark:text-gray-400">Room</div>
                                                                                    <div className="font-semibold">{notification.room_number}</div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                                                            <Clock size={14} className="text-green-600 dark:text-green-400" />
                                                                            <div>
                                                                                <div className="text-gray-500 dark:text-gray-400">Duration</div>
                                                                                <div className="font-semibold">
                                                                                    {notification.months_stayed} month{notification.months_stayed !== 1 ? 's' : ''}
                                                                                    <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">({Math.round(notification.days_stayed || 0)} days)</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                                                            <DollarSign size={14} className="text-purple-600 dark:text-purple-400" />
                                                                            <div>
                                                                                <div className="text-gray-500 dark:text-gray-400">Calculated Cost</div>
                                                                                <div className="font-semibold">₱{Math.round(notification.calculated_cost || 0).toLocaleString()}</div>
                                                                            </div>
                                                                        </div>
                                                                        {notification.total_semesters && (
                                                                            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                                                                <Calendar size={14} className="text-orange-600 dark:text-orange-400" />
                                                                                <div>
                                                                                    <div className="text-gray-500 dark:text-gray-400">Total Semesters</div>
                                                                                    <div className="font-semibold">{notification.total_semesters}</div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-blue-200 dark:border-blue-800">
                                                                        <span className="font-semibold">Note:</span> Cost calculated at ₱400/month. Any partial month counts as a full month.
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2 mt-4">
                                                        {notification.student_id && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleViewHistory(notification)}
                                                                className="text-xs"
                                                            >
                                                                <History size={14} className="mr-1" />
                                                                View Payment History
                                                            </Button>
                                                        )}
                                                        {!notification.is_read && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="text-xs"
                                                            >
                                                                <CheckCircle size={14} className="mr-1" />
                                                                Mark as Read
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
                                    <BellOff size={48} className="text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        No Notifications
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        You don't have any notifications at the moment.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Payment History Dialog */}
            {selectedStudentId && (
                <PaymentHistoryDialog
                    open={historyDialogOpen}
                    onClose={() => {
                        setHistoryDialogOpen(false);
                        setSelectedStudentId(null);
                        setSelectedStudentName('');
                    }}
                    studentId={selectedStudentId}
                    studentName={selectedStudentName}
                />
            )}
        </AppLayout>
    );
}
