import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, CalendarDays, CheckCircle, AlertTriangle, Flag, X, CheckCircle2 } from 'lucide-react';
import { StudentCleaningSchedule } from '@/types';
import { useForm } from '@inertiajs/react';
import React, { useState } from 'react';

interface StudentCleaningScheduleProps {
    schedules: StudentCleaningSchedule[];
    roomNumber?: string;
    studentId?: number;
    dormitorians?: {
        student_id: number;
        first_name: string;
        last_name: string;
    }[];
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

const getDayTextColor = (day: number) => {
    const colors = {
        1: 'text-blue-700 dark:text-blue-400',
        2: 'text-green-700 dark:text-green-400',
        3: 'text-purple-700 dark:text-purple-400',
        4: 'text-yellow-700 dark:text-yellow-400',
        5: 'text-pink-700 dark:text-pink-400',
        6: 'text-indigo-700 dark:text-indigo-400',
        7: 'text-orange-700 dark:text-orange-400',
    };
    return colors[day as keyof typeof colors] || colors[1];
};

export default function StudentCleaningScheduleComponent({ schedules, roomNumber, studentId, dormitorians = [] }: StudentCleaningScheduleProps) {
    // Report dialog state
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<StudentCleaningSchedule | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    
    // Report form
    const { data, setData, post, processing, errors, reset } = useForm({
        cleaning_schedule_id: 0,
        student_id: 0,
        scheduled_date: '',
        reason: '',
    });
    
    // Create a map of schedules by day for easy lookup
    const scheduleMap = schedules.reduce((map, schedule) => {
        map[schedule.day_of_week] = schedule;
        return map;
    }, {} as Record<number, StudentCleaningSchedule>);
    
    /**
     * Open report dialog
     */
    const openReportDialog = (schedule: StudentCleaningSchedule) => {
        setSelectedSchedule(schedule);
        setData({
            cleaning_schedule_id: schedule.id,
            student_id: 0,
            scheduled_date: '',
            reason: '',
        });
        setIsReportDialogOpen(true);
    };
    
    /**
     * Handle report submission
     */
    const handleReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/student/cleaning-reports', {
            onSuccess: () => {
                setIsReportDialogOpen(false);
                reset();
                setShowSuccess(true);
                // Hide success message after 5 seconds
                setTimeout(() => setShowSuccess(false), 5000);
            }
        });
    };

    if (schedules.length === 0) {
        return (
            <Card className="bg-white dark:bg-gray-900 border dark:border-gray-700">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                            <Calendar className="text-gray-600 dark:text-gray-400" size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Cleaning Schedule
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {roomNumber ? `Room ${roomNumber} cleaning schedule` : 'No room assigned'}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="text-center mb-6">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Calendar className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            No cleaning schedule assigned
                        </h3>
                        <p className="text-gray-500 dark:text-gray-500">
                            {roomNumber 
                                ? "Your room doesn't have any cleaning days assigned yet." 
                                : "You need to be assigned to a room to see cleaning schedules."
                            }
                        </p>
                    </div>
                    
                    {/* Success Alert */}
                    {showSuccess && (
                        <div className="mt-6">
                            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <AlertDescription className="text-sm text-green-700 dark:text-green-300">
                                    Report submitted successfully! The manager will review it.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                    
                    {/* Report Missed Cleaning Section */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <AlertDescription className="text-sm text-gray-700 dark:text-gray-300">
                                <div className="flex items-center justify-between">
                                    <span>
                                        {dormitorians.length > 0 
                                            ? "Report a dormitorian who missed their cleaning day."
                                            : "Report a missed cleaning day to the manager."
                                        }
                                    </span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            // Create a dummy schedule to open dialog
                                            setData({
                                                cleaning_schedule_id: 0,
                                                student_id: 0,
                                                scheduled_date: '',
                                                reason: '',
                                            });
                                            setIsReportDialogOpen(true);
                                        }}
                                        className="ml-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700"
                                    >
                                        <Flag size={14} className="mr-1" />
                                        Report Missed Cleaning
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </div>
                </CardContent>
                
                {/* Report Dialog */}
                <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Flag className="text-yellow-600" size={20} />
                                Report Missed Cleaning
                            </DialogTitle>
                            <DialogDescription>
                                Report a dormitorian who did not complete their assigned cleaning day. This will be reviewed by the manager.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="student_id">Select Dormitorian</Label>
                                <Select
                                    value={data.student_id.toString()}
                                    onValueChange={(value) => setData('student_id', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a dormitorian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dormitorians.length > 0 ? (
                                            dormitorians.map((dormitorian) => (
                                                <SelectItem key={dormitorian.student_id} value={dormitorian.student_id.toString()}>
                                                    {dormitorian.first_name} {dormitorian.last_name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="0" disabled>
                                                No dormitorians found
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.student_id && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.student_id}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="scheduled_date">Cleaning Date</Label>
                                <input
                                    type="date"
                                    id="scheduled_date"
                                    value={data.scheduled_date}
                                    onChange={(e) => setData('scheduled_date', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {errors.scheduled_date && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.scheduled_date}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason (Optional)</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Provide additional details about why the cleaning was missed..."
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    rows={3}
                                />
                                {errors.reason && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.reason}</p>
                                )}
                            </div>
                            
                            <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    This report will be sent to the manager for review. Make sure all information is accurate.
                                </AlertDescription>
                            </Alert>
                        </form>
                        
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsReportDialogOpen(false);
                                    reset();
                                }}
                                disabled={processing}
                            >
                                <X size={16} className="mr-1" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={handleReportSubmit}
                                disabled={processing || !data.student_id || !data.scheduled_date}
                                className="bg-yellow-600 hover:bg-yellow-700"
                            >
                                {processing ? (
                                    <>
                                        <Calendar className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Flag className="mr-2 h-4 w-4" />
                                        Submit Report
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Card>
        );
    }

    return (
        <Card className="bg-white dark:bg-gray-900 border dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
                        <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Your Cleaning Schedule
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {roomNumber && `Room ${roomNumber} - `}
                            {schedules.length} cleaning day{schedules.length !== 1 ? 's' : ''} assigned
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarDays className="text-blue-600 dark:text-blue-400" size={18} />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Weekly Schedule
                        </span>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                    {Object.entries(DAYS).map(([dayNum, dayName]) => {
                        const day = parseInt(dayNum);
                        const schedule = scheduleMap[day];
                        const isScheduled = !!schedule;
                        
                        return (
                            <div 
                                key={day}
                                className={`border rounded-lg p-4 text-center transition-all duration-200 ${
                                    isScheduled 
                                        ? `${getDayColor(day)} border-2 shadow-sm hover:shadow-md` 
                                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                                }`}
                            >
                                <div className="mb-3">
                                    <h4 className={`font-semibold text-sm ${
                                        isScheduled 
                                            ? getDayTextColor(day)
                                            : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                        {dayName}
                                    </h4>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {dayName.substring(0, 3).toUpperCase()}
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center gap-2">
                                    {isScheduled ? (
                                        <>
                                            <div className={`p-2 rounded-full ${
                                                day === 1 ? 'bg-blue-100 dark:bg-blue-900/30' :
                                                day === 2 ? 'bg-green-100 dark:bg-green-900/30' :
                                                day === 3 ? 'bg-purple-100 dark:bg-purple-900/30' :
                                                day === 4 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                                day === 5 ? 'bg-pink-100 dark:bg-pink-900/30' :
                                                day === 6 ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                                                'bg-orange-100 dark:bg-orange-900/30'
                                            }`}>
                                                <CheckCircle className={getDayTextColor(day)} size={16} />
                                            </div>
                                            <Badge 
                                                variant="secondary" 
                                                className={`text-xs font-medium ${
                                                    day === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                    day === 2 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                    day === 3 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                    day === 4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                    day === 5 ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' :
                                                    day === 6 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' :
                                                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                                }`}
                                            >
                                                Clean Day
                                            </Badge>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                                                <Calendar className="text-gray-400" size={16} />
                                            </div>
                                            <Badge 
                                                variant="outline" 
                                                className="text-xs text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                                            >
                                                Free Day
                                            </Badge>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Summary Section */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">
                                You have <span className="font-semibold text-gray-900 dark:text-gray-100">{schedules.length}</span> cleaning day{schedules.length !== 1 ? 's' : ''} per week
                            </span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                            Schedule is managed by your dormitory manager
                        </div>
                    </div>
                </div>
                
                {/* Success Alert */}
                {showSuccess && (
                    <div className="mt-6">
                        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertDescription className="text-sm text-green-700 dark:text-green-300">
                                Report submitted successfully! The manager will review it.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                
                {/* Report Missed Cleaning Section */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <AlertDescription className="text-sm text-gray-700 dark:text-gray-300">
                                <div className="flex items-center justify-between">
                                    <span>
                                        {dormitorians.length > 0 
                                            ? "Report a dormitorian who missed their cleaning day."
                                            : "Report a missed cleaning day to the manager."
                                        }
                                    </span>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => schedules.length > 0 && openReportDialog(schedules[0])}
                                    className="ml-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700"
                                >
                                    <Flag size={14} className="mr-1" />
                                    Report Missed Cleaning
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            </CardContent>
            
            {/* Report Dialog */}
            <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Flag className="text-yellow-600" size={20} />
                            Report Missed Cleaning
                        </DialogTitle>
                        <DialogDescription>
                            Report a dormitorian who did not complete their assigned cleaning day. This will be reviewed by the manager.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleReportSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="student_id">Select Dormitorian</Label>
                            <Select
                                value={data.student_id.toString()}
                                onValueChange={(value) => setData('student_id', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a dormitorian" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dormitorians.length > 0 ? (
                                        dormitorians.map((dormitorian) => (
                                            <SelectItem key={dormitorian.student_id} value={dormitorian.student_id.toString()}>
                                                {dormitorian.first_name} {dormitorian.last_name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="0" disabled>
                                            No dormitorians found
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.student_id && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.student_id}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="scheduled_date">Cleaning Date</Label>
                            <input
                                type="date"
                                id="scheduled_date"
                                value={data.scheduled_date}
                                onChange={(e) => setData('scheduled_date', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                max={new Date().toISOString().split('T')[0]}
                            />
                            {errors.scheduled_date && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.scheduled_date}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason (Optional)</Label>
                            <Textarea
                                id="reason"
                                placeholder="Provide additional details about why the cleaning was missed..."
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                rows={3}
                            />
                            {errors.reason && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.reason}</p>
                            )}
                        </div>
                        
                        <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                                This report will be sent to the manager for review. Make sure all information is accurate.
                            </AlertDescription>
                        </Alert>
                    </form>
                    
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsReportDialogOpen(false);
                                reset();
                            }}
                            disabled={processing}
                        >
                            <X size={16} className="mr-1" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleReportSubmit}
                            disabled={processing || !data.student_id || !data.scheduled_date}
                            className="bg-yellow-600 hover:bg-yellow-700"
                        >
                            {processing ? (
                                <>
                                    <Calendar className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Flag className="mr-2 h-4 w-4" />
                                    Submit Report
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
