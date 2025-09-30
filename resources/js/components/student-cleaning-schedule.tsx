import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarDays, CheckCircle } from 'lucide-react';
import { StudentCleaningSchedule } from '@/types';

interface StudentCleaningScheduleProps {
    schedules: StudentCleaningSchedule[];
    roomNumber?: string;
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

export default function StudentCleaningScheduleComponent({ schedules, roomNumber }: StudentCleaningScheduleProps) {
    // Create a map of schedules by day for easy lookup
    const scheduleMap = schedules.reduce((map, schedule) => {
        map[schedule.day_of_week] = schedule;
        return map;
    }, {} as Record<number, StudentCleaningSchedule>);

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
                <CardContent className="p-8 text-center">
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
                </CardContent>
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
            </CardContent>
        </Card>
    );
}