
import AppLayout from '@/layouts/app-layout';
import { usePage, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Edit3, Archive, Bed, DollarSign, Clock, AlertCircle, User } from 'lucide-react';
import { Head } from '@inertiajs/react';
import WarningDialog from '@/components/warning-dialog';
import { useEffect } from 'react';

const emptyForm = { student_id: '', room_id: '', semester_count: 1 };

export default function Bookings() {
    const pageProps = usePage().props;
    const { 
        bookings = [], 
        students = [], 
        rooms = [], 
        errors, 
        hasAnyStudents = false 
    } = pageProps || {};
    
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [currentBooking, setCurrentBooking] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [pendingArchiveId, setPendingArchiveId] = useState<number | null>(null);
    const [alertMessage, setAlertMessage] = useState('');

    // Safe array initialization with fallbacks
    const studentList = Array.isArray(students) ? students : [];
    const roomList = Array.isArray(rooms) ? rooms : [];
    const bookingList = Array.isArray(bookings) ? bookings : [];
    
    // Check if there are available students for booking (only if there are students in the system)
    const hasAvailableStudents = Boolean(hasAnyStudents) && Array.isArray(studentList) && studentList.length > 0;
    
    // Can create booking only if there are available students
    const canCreateBooking = hasAvailableStudents;
    
    // Effect to handle state inconsistencies and prevent blank pages
    useEffect(() => {
        // If we have bookings but no associated data, force a refresh
        if (bookingList.length > 0) {
            const hasInvalidBooking = bookingList.some((booking: any) => 
                !booking || typeof booking !== 'object'
            );
            if (hasInvalidBooking) {
                window.location.reload();
            }
        }
    }, [bookingList]);

    // Filter rooms based on capacity
    const availableRooms = roomList.filter((r: any) => {
        // Skip rooms in maintenance
        if (r.status === 'maintenance') return false;
        
        // Room capacity check - room should have space for at least 1 more student
        const isAtCapacity = r.is_at_capacity || (r.current_occupancy >= (r.max_capacity || 6));
        
        // If editing, always allow the current booking's room and any non-full rooms
        if (isEdit) {
            // Allow current room even if at capacity
            if (form.room_id && String(r.room_id) === String(form.room_id)) {
                return true;
            }
            // Allow other rooms that aren't at capacity
            return !isAtCapacity;
        }
        
        // For new bookings, don't allow rooms at maximum capacity
        if (isAtCapacity) return false;
        
        return true;
    });

    const handleOpenAdd = () => {
        // Check if there are available students before opening the dialog
        if (!hasAnyStudents) {
            setAlertMessage('Cannot create bookings because there are no students in the system yet.\n\nPlease add students first before creating bookings.');
            setAlertDialogOpen(true);
            return;
        }
        
        if (!hasAvailableStudents) {
            setAlertMessage('Cannot create new bookings because all students already have active bookings.\n\nYou can edit existing bookings or archive them to make students available for new bookings.');
            setAlertDialogOpen(true);
            return;
        }
        
        setForm(emptyForm);
        setIsEdit(false);
        setEditId(null);
        setCurrentBooking(null);
        setOpen(true);
    };

    const handleOpenEdit = (booking: any) => {
        setForm({
            student_id: booking.student_id,
            room_id: booking.room_id,
            semester_count: booking.semester_count || 1,
        });
        setIsEdit(true);
        setEditId(booking.booking_id);
        setCurrentBooking(booking);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setForm(emptyForm);
        setIsEdit(false);
        setEditId(null);
        setCurrentBooking(null);
        setIsLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isLoading) return;
        
        // Validate room selection
        const selectedRoom = roomList.find((r: any) => String(r.room_id) === String(form.room_id));
        if (!selectedRoom) {
            setAlertMessage('Please select a room.');
            setAlertDialogOpen(true);
            return;
        }
        
        // For new bookings, check if room is at capacity
        if (!isEdit) {
            const isAtCapacity = selectedRoom.is_at_capacity || (selectedRoom.current_occupancy >= (selectedRoom.max_capacity || 6));
            if (isAtCapacity) {
                setAlertMessage(`Room ${selectedRoom.room_number} is at maximum capacity (${selectedRoom.current_occupancy}/${selectedRoom.max_capacity || 6} students).\n\nPlease select a different room.`);
                setAlertDialogOpen(true);
                return;
            }
        }
        
        // For editing, check if switching to a different room that's at capacity
        if (isEdit) {
            const currentRoomId = String(editId); // Assuming we have the current booking info
            const isChangingRoom = String(selectedRoom.room_id) !== String(form.room_id);
            const isAtCapacity = selectedRoom.is_at_capacity || (selectedRoom.current_occupancy >= (selectedRoom.max_capacity || 6));
            
            if (isChangingRoom && isAtCapacity) {
                setAlertMessage(`Room ${selectedRoom.room_number} is at maximum capacity (${selectedRoom.current_occupancy}/${selectedRoom.max_capacity || 6} students).\n\nPlease select a different room.`);
                setAlertDialogOpen(true);
                return;
            }
        }
        
        setIsLoading(true);
        
        if (isEdit && editId) {
            // For editing, only send the fields that can be updated (room and semester count)
            const updateData = {
                room_id: form.room_id,
                semester_count: form.semester_count,
            };
            
            router.put(`/bookings/${editId}`, updateData, {
                onSuccess: () => {
                    handleClose();
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                },
                onFinish: () => {
                    setIsLoading(false);
                }
            });
        } else {
            // For new bookings, send all required fields
            router.post('/bookings', form, {
                onSuccess: () => {
                    handleClose();
                    setIsLoading(false);
                },
                onError: (errors) => {
                    setIsLoading(false);
                    
                    // Show specific error messages
                    if (errors.error) {
                        setAlertMessage(errors.error);
                        setAlertDialogOpen(true);
                    } else if (errors.student_id) {
                        setAlertMessage(errors.student_id);
                        setAlertDialogOpen(true);
                    } else if (errors.room_id) {
                        setAlertMessage(errors.room_id);
                        setAlertDialogOpen(true);
                    } else if (errors.semester_count) {
                        setAlertMessage(errors.semester_count);
                        setAlertDialogOpen(true);
                    } else {
                        // Show all errors if available
                        const errorMessage = Object.values(errors).flat().join(', ') || 'Unable to create booking. Please check the form and try again.';
                        setAlertMessage(errorMessage);
                        setAlertDialogOpen(true);
                    }
                },
                onFinish: () => {
                    setIsLoading(false);
                }
            });
        }
    };

    const handleArchive = (id: any) => {
        setPendingArchiveId(id);
        setWarningDialogOpen(true);
    };
    
    const confirmArchive = () => {
        if (!pendingArchiveId) return;
        
        router.delete(`/bookings/${pendingArchiveId}`, {
            onSuccess: () => {
                // Close the warning dialog and reset state after successful archive
                setWarningDialogOpen(false);
                setPendingArchiveId(null);
            },
            onError: () => {
                // Close the warning dialog even on error to prevent it from staying open
                setWarningDialogOpen(false);
                setPendingArchiveId(null);
            }
        });
    };

    const calculateTotal = (booking: any) => {
        if (!booking.semester_count) return 0;
        return booking.semester_count * 2000; // ₱2000 per semester
    };

    // Add safety check to prevent blank pages during state transitions
    if (pageProps === undefined || pageProps === null) {
        return (
            <AppLayout breadcrumbs={[{ title: 'Bookings', href: '/bookings' }]}>
                <Head title="Bookings" />
                <div className="p-6">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading bookings...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Bookings', href: '/bookings' }]}>
            <Head title="Bookings" />
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <Calendar className="text-blue-600 dark:text-blue-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bookings Management</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage student reservations and room assignments</p>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={handleOpenAdd}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus size={18} /> Add New Booking
                    </Button>
                </div>

                {/* Bookings Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 text-white rounded-lg p-2">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{bookingList.length}</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Total Bookings</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-600 text-white rounded-lg p-2">
                                <Bed size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {new Set(bookingList.map((b: any) => b.room_id)).size}
                                </div>
                                <div className="text-sm text-orange-600 dark:text-orange-400">Rooms Booked</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-600 text-white rounded-lg p-2">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    ₱{bookingList.reduce((total: number, booking: any) => total + calculateTotal(booking), 0)}
                                </div>
                                <div className="text-sm text-purple-600 dark:text-purple-400">Total Revenue</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                {bookingList.length > 0 ? (
                    <div className="space-y-3">
                        {bookingList.map((booking: any) => {
                            // Use student and room data directly from booking relationships
                            const student = booking.student || null;
                            const room = booking.room || null;
                            const semesters = booking.semester_count || 1;
                            const total = calculateTotal(booking);
                            
                            return (
                                <Card key={booking.booking_id} className="border border-gray-200 dark:border-gray-700">
                                    <CardContent className="p-4">
                                        {/* Mobile Layout */}
                                        <div className="block lg:hidden space-y-4">
                                            {/* Booking Header */}
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex-shrink-0">
                                                    <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                                        {student ? `${student.first_name} ${student.last_name}` : `Student #${booking.student_id}`}
                                                    </h3>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        Booking #{booking.booking_id}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                                        ₱{total}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {semesters} semester{semesters !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Booking Details Grid */}
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                                    <Bed size={16} className="text-orange-500 flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Room</div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {room ? `Room ${room.room_number} (${room.type})` : `Room #${booking.room_id}`}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            ₱2,000/semester
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                                    <Clock size={16} className="text-green-500 flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {semesters} semester{semesters !== 1 ? 's' : ''}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            ₱2,000 per semester
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleOpenEdit(booking)}
                                                    className="flex-1 text-sm"
                                                >
                                                    <Edit3 size={14} className="mr-2" />
                                                    Edit Booking
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleArchive(booking.booking_id)}
                                                    className="flex-1 text-sm border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/20"
                                                >
                                                    <Archive size={14} className="mr-2" />
                                                    Archive
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                                            {/* Student Info - 3 columns */}
                                            <div className="col-span-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 flex-shrink-0">
                                                        <User className="text-blue-600 dark:text-blue-400" size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base truncate">
                                                            {student ? `${student.first_name} ${student.last_name}` : `Student #${booking.student_id}`}
                                                        </h3>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Booking #{booking.booking_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Room Info - 2 columns */}
                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                                    <Bed size={14} className="text-orange-500 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {room ? `Room ${room.room_number}` : `#${booking.room_id}`}
                                                        </div>
                                                        {room && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                                {room.type}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Duration - 2 columns */}
                                            <div className="col-span-2">
                                                <div className="text-xs">
                                                    <div className="text-gray-500 dark:text-gray-400">Duration</div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {semesters} semester{semesters !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rate - 2 columns */}
                                            <div className="col-span-2">
                                                <div className="text-xs">
                                                    <div className="text-gray-500 dark:text-gray-400">Rate</div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        ₱2,000/semester
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total - 1 column */}
                                            <div className="col-span-1">
                                                <div className="text-right">
                                                    <div className="font-bold text-purple-600 dark:text-purple-400">₱{total}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{semesters}sem</div>
                                                </div>
                                            </div>

                                            {/* Actions - 2 columns */}
                                            <div className="col-span-2">
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleOpenEdit(booking)}
                                                        className="text-xs"
                                                    >
                                                        <Edit3 size={12} className="mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleArchive(booking.booking_id)}
                                                        className="text-xs border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/20"
                                                    >
                                                        <Archive size={12} className="mr-1" />
                                                        Archive
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Calendar className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No bookings found</h3>
                        {!hasAnyStudents ? (
                            <>
                                <p className="text-gray-500 dark:text-gray-500 mb-4">You cannot create bookings yet because there are no students in the system.</p>
                                <p className="text-amber-600 dark:text-amber-400 text-sm mb-6 flex items-center justify-center gap-2">
                                    <AlertCircle size={16} />
                                    Please add students first before creating bookings.
                                </p>
                                <Button 
                                    onClick={() => window.location.href = '/students'}
                                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Plus size={16} /> Add Students First
                                </Button>
                            </>
                        ) : !hasAvailableStudents ? (
                            <>
                                <p className="text-gray-500 dark:text-gray-500 mb-4">All students already have active bookings.</p>
                                <p className="text-amber-600 dark:text-amber-400 text-sm mb-6 flex items-center justify-center gap-2">
                                    <AlertCircle size={16} />
                                    Edit or archive existing bookings to make students available for new bookings.
                                </p>
                                <Button 
                                    onClick={handleOpenAdd}
                                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Plus size={16} /> Create New Booking
                                </Button>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-500 dark:text-gray-500 mb-6">Start by creating your first booking to manage reservations.</p>
                                <Button 
                                    onClick={handleOpenAdd}
                                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Plus size={16} /> Create Your First Booking
                                </Button>
                            </>
                        )}
                    </Card>
                )}

                {/* Add/Edit Booking Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <DialogTitle className="text-xl">{isEdit ? 'Edit Booking' : 'Add New Booking'}</DialogTitle>
                        </div>
                        <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                            {isEdit ? 'Update the booking details below.' : 'Fill in the details to create a new booking.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                        {/* Student Section */}
                        {isEdit ? (
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <User size={14} className="text-blue-500" />
                                    Student Information
                                </label>
                                <div className="px-3 py-2.5 border rounded-md bg-gray-50 dark:bg-gray-800">
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                            {currentBooking?.student?.first_name} {currentBooking?.student?.last_name}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {currentBooking?.student?.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <User size={14} className="text-blue-500" />
                                    Student
                                </label>
                                <Select value={form.student_id} onValueChange={(v: string) => setForm({ ...form, student_id: v })} disabled={!hasAvailableStudents}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={!hasAnyStudents ? "No students in system" : hasAvailableStudents ? "Select a student" : "No available students"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {!hasAnyStudents ? (
                                            <SelectItem value="none" disabled>
                                                No students exist in the system
                                            </SelectItem>
                                        ) : studentList.length === 0 ? (
                                            <SelectItem value="none" disabled>
                                                All students already have bookings
                                            </SelectItem>
                                        ) : (
                                            studentList.map((s: any) => (
                                                <SelectItem key={s.student_id} value={String(s.student_id)}>
                                                    {s.first_name} {s.last_name} ({s.email})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {!hasAnyStudents ? (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Cannot create bookings because there are no students in the system. Please add students first.
                                    </div>
                                ) : !hasAvailableStudents && (
                                    <div className="text-xs text-amber-600 dark:text-amber-400">
                                        All students already have active bookings. Edit or archive existing bookings to make students available.
                                    </div>
                                )}
                                {errors?.student_id && (
                                    <div className="text-xs text-red-500 dark:text-red-400">{errors.student_id}</div>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Bed size={14} className="text-blue-500" />
                                Room
                            </label>
                            <Select value={form.room_id} onValueChange={(v: string) => setForm({ ...form, room_id: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a room" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRooms.length === 0 ? (
                                        <SelectItem value="none" disabled>
                                            No available rooms
                                        </SelectItem>
                                    ) : (
                                        availableRooms.map((r: any) => {
                                            const currentOccupancy = r.current_occupancy || 0;
                                            const maxCapacity = r.max_capacity || 6;
                                            
                                            return (
                                                <SelectItem key={r.room_id} value={String(r.room_id)}>
                                                    Room {r.room_number} - {r.type} - ₱2,000/semester ({currentOccupancy}/{maxCapacity})
                                                </SelectItem>
                                            );
                                        })
                                    )}
                                </SelectContent>
                            </Select>
                            {errors?.room_id && (
                                <div className="text-xs text-red-500 dark:text-red-400">{errors.room_id}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Clock size={14} className="text-blue-500" />
                                Number of Semesters
                            </label>
                            <Select value={String(form.semester_count)} onValueChange={(v: string) => setForm({ ...form, semester_count: parseInt(v) })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select number of semesters" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                                        <SelectItem key={count} value={String(count)}>
                                            {count} semester{count !== 1 ? 's' : ''} - ₱{(count * 2000).toLocaleString()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Select how many semesters the student will stay in this room
                            </div>
                            {errors?.semester_count && (
                                <div className="text-xs text-red-500 dark:text-red-400">{errors.semester_count}</div>
                            )}
                        </div>

                        {/* Booking Summary */}
                        {form.room_id && form.semester_count && (() => {
                            const semesters = form.semester_count;
                            const totalCost = semesters * 2000;
                            
                            return semesters > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <DollarSign className="text-blue-600 dark:text-blue-400" size={16} />
                                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Booking Summary</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                                            <span className="font-medium">{semesters} semester{semesters !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Rate:</span>
                                            <span className="font-medium">₱2,000/semester</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-blue-800 dark:text-blue-200 border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
                                            <span>Total:</span>
                                            <span>₱{totalCost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <DialogFooter className="flex gap-3 pt-6">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleClose}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {isEdit ? <Edit3 size={14} /> : <Plus size={14} />}
                                        {isEdit ? 'Update Booking' : 'Add Booking'}
                                    </div>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
                </Dialog>

                {/* Archive Warning Dialog */}
                <WarningDialog
                    open={warningDialogOpen}
                    onClose={() => {
                        setWarningDialogOpen(false);
                        setPendingArchiveId(null);
                    }}
                    onConfirm={confirmArchive}
                    title="Archive Booking?"
                    message={"Are you sure you want to archive this booking?\n\nYou can restore it later from the Archive settings."}
                    confirmText="Archive Booking"
                    isDestructive={true}
                />

                {/* Alert Dialog for Validation */}
                <WarningDialog
                    open={alertDialogOpen}
                    onClose={() => setAlertDialogOpen(false)}
                    onConfirm={() => setAlertDialogOpen(false)}
                    title="Notice"
                    message={alertMessage}
                    confirmText="OK"
                    isDestructive={false}
                />
            </div>
        </AppLayout>
    );
}  
 
