import AppLayout from '@/layouts/app-layout';
import { usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Calendar, Plus, Edit3, Trash2, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import { Head } from '@inertiajs/react';
import WarningDialog from '@/components/warning-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PageProps } from '@/types';

interface Student {
    student_id: number;
    first_name: string;
    last_name: string;
}

interface CleaningSchedulesPageProps extends PageProps {
    rooms: {
        room_id: number;
        room_number: string;
        cleaning_schedules: {
            id: number;
            day_of_week: number;
            day_name: string;
        }[];
    }[];
    weeklySchedule: {
        [key: number]: {
            id: number;
            room_id: number;
            room_number: string;
            day_of_week: number;
            day_name: string;
            students: Student[];
        }[];
    };
    success?: string;
    error?: string;
}

const DAYS = {
    1: 'Monday',
    2: 'Tuesday', 
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday'
};

const emptyForm = { room_id: '', day_of_week: '' };

export default function CleaningSchedules() {
    const { rooms = [], weeklySchedule = {}, success, error } = usePage<CleaningSchedulesPageProps>().props;
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const handleOpenAdd = () => {
        setForm(emptyForm);
        setIsEdit(false);
        setEditId(null);
        setOpen(true);
    };

    const handleOpenEdit = (schedule: { id: number; room_id: number; day_of_week: number; }) => {
        setForm({
            room_id: schedule.room_id.toString(),
            day_of_week: schedule.day_of_week.toString(),
        });
        setIsEdit(true);
        setEditId(schedule.id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setForm(emptyForm);
        setIsEdit(false);
        setEditId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const data = {
            room_id: parseInt(form.room_id),
            day_of_week: parseInt(form.day_of_week),
        };
        
        if (isEdit && editId) {
            router.put(`/cleaning-schedules/${editId}`, data, {
                onSuccess: () => {
                    handleClose();
                },
                onError: (errors) => {
                    console.error('Error updating schedule:', errors);
                }
            });
        } else {
            router.post('/cleaning-schedules', data, {
                onSuccess: () => {
                    handleClose();
                },
                onError: (errors) => {
                    console.error('Error creating schedule:', errors);
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        setPendingDeleteId(id);
        setWarningDialogOpen(true);
    };
    
    const confirmDelete = () => {
        if (!pendingDeleteId) return;
        
        router.delete(`/cleaning-schedules/${pendingDeleteId}`, {
            onSuccess: () => {
                setPendingDeleteId(null);
                setWarningDialogOpen(false);
            },
            onError: (errors) => {
                console.error('Error deleting schedule:', errors);
            },
            onFinish: () => {
                // Ensure the dialog is closed even if inertia navigation leaves it open
                setWarningDialogOpen(false);
            }
        });
    };


    const getDayColor = (day: number) => {
        const colors = {
            1: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20',
            2: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20',
            3: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20',
            4: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20',
            5: 'border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950/20',
            6: 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/20',
            7: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20',
        };
        return colors[day as keyof typeof colors] || colors[1];
    };

    const getTotalScheduledRooms = () => {
        return Object.values(weeklySchedule).reduce((total, daySchedules) => total + daySchedules.length, 0);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Cleaning Schedules', href: '/cleaning-schedules' }]}>
            <Head title="Cleaning Schedules" />
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <Calendar className="text-blue-600 dark:text-blue-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cleaning Schedules</h1>
                            <p className="text-gray-600 dark:text-gray-400">Assign room cleaning schedules for each day of the week</p>
                        </div>
                    </div>
                    
                    <Button onClick={handleOpenAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus size={18} /> Add Schedule
                    </Button>
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

                {/* Schedule Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 text-white rounded-lg p-2">
                                <CalendarDays size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{rooms.length}</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Total Rooms</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-green-600 text-white rounded-lg p-2">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{getTotalScheduledRooms()}</div>
                                <div className="text-sm text-green-600 dark:text-green-400">Scheduled</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-600 text-white rounded-lg p-2">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {rooms.length * 7 - getTotalScheduledRooms()}
                                </div>
                                <div className="text-sm text-orange-600 dark:text-orange-400">Unscheduled Slots</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly Schedule Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                    {Object.entries(DAYS).map(([dayNum, dayName]) => {
                        const day = parseInt(dayNum);
                        const daySchedules = weeklySchedule[day] || [];
                        
                        return (
                            <Card key={day} className={`border ${getDayColor(day)}`}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-semibold text-center">
                                        {dayName}
                                    </CardTitle>
                                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                        {daySchedules.length} room{daySchedules.length !== 1 ? 's' : ''}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {daySchedules.length > 0 ? (
                                        daySchedules.map((schedule) => (
                                            <div 
                                                key={schedule.id}
                                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2"
                                            >
                                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                                    Room {schedule.room_number}
                                                </div>
                                                {schedule.students && schedule.students.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {schedule.students.map((student) => (
                                                            <div 
                                                                key={student.student_id} 
                                                                className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1"
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                                {student.first_name} {student.last_name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                                                        No students assigned
                                                    </div>
                                                )}
                                                <div className="flex gap-1 pt-1">
                                                    <Button 
                                                        size="sm"
                                                        variant="outline" 
                                                        onClick={() => handleOpenEdit(schedule)}
                                                        className="flex-1 text-xs h-7"
                                                    >
                                                        <Edit3 size={12} />
                                                    </Button>
                                                    <Button 
                                                        size="sm"
                                                        variant="outline" 
                                                        onClick={() => handleDelete(schedule.id)}
                                                        className="flex-1 text-xs h-7 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
                                                    >
                                                        <Trash2 size={12} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <Calendar size={24} className="mx-auto mb-2 opacity-50" />
                                            <div className="text-sm">No cleaning scheduled</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Add/Edit Schedule Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="w-[95vw] max-w-xs sm:max-w-sm md:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                    <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                                </div>
                                <DialogTitle className="text-xl">
                                    {isEdit ? 'Edit Cleaning Schedule' : 'Add Cleaning Schedule'}
                                </DialogTitle>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Select Room
                                </label>
                                <Select 
                                    value={form.room_id} 
                                    onValueChange={(v: string) => setForm({ ...form, room_id: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a room..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map(room => (
                                            <SelectItem key={room.room_id} value={room.room_id.toString()}>
                                                Room {room.room_number}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Select Day
                                </label>
                                <Select 
                                    value={form.day_of_week} 
                                    onValueChange={(v: string) => setForm({ ...form, day_of_week: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a day..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(DAYS).map(([dayNum, dayName]) => (
                                            <SelectItem key={dayNum} value={dayNum}>
                                                {dayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter className="flex gap-3 pt-6">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleClose}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <div className="flex items-center gap-2">
                                        {isEdit ? <Edit3 size={14} /> : <Plus size={14} />}
                                        {isEdit ? 'Update Schedule' : 'Add Schedule'}
                                    </div>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                
                {/* Delete Warning Dialog */}
                <WarningDialog
                    open={warningDialogOpen}
                    onClose={() => {
                        setWarningDialogOpen(false);
                        setPendingDeleteId(null);
                    }}
                    onConfirm={confirmDelete}
                    title="Delete Cleaning Schedule?"
                    message="Are you sure you want to delete this cleaning schedule? This action cannot be undone."
                    confirmText="Delete Schedule"
                    isDestructive={true}
                />
            </div>
        </AppLayout>
    );
}