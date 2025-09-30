

import AppLayout from '@/layouts/app-layout';
import { usePage, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Bed, Plus, Edit3, Archive, DollarSign, Users, AlertCircle } from 'lucide-react';
import { Head } from '@inertiajs/react';
import WarningDialog from '@/components/warning-dialog';

const emptyForm = { room_number: '', type: 'single', price_per_semester: '2000', status: 'available' };

export default function Rooms() {
    const { rooms = [] } = usePage().props;
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const [pendingArchiveId, setPendingArchiveId] = useState<number | null>(null);

    const handleOpenAdd = () => {
        setForm(emptyForm);
        setIsEdit(false);
        setEditId(null);
        setOpen(true);
    };

    const handleOpenEdit = (room: any) => {
        setForm({
            room_number: room.room_number,
            type: room.type,
            price_per_semester: room.price_per_semester || '2000',
            status: room.status,
        });
        setIsEdit(true);
        setEditId(room.room_id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setForm(emptyForm);
        setIsEdit(false);
        setEditId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && editId) {
            router.put(`/rooms/${editId}`, form, {
                onSuccess: handleClose,
            });
        } else {
            router.post('/rooms', form, {
                onSuccess: handleClose,
            });
        }
    };

    const handleArchive = (id: any) => {
        setPendingArchiveId(id);
        setWarningDialogOpen(true);
    };
    
    const confirmArchive = () => {
        if (!pendingArchiveId) return;
        
        router.delete(`/rooms/${pendingArchiveId}`, {
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

    const roomList = Array.isArray(rooms) ? rooms : [];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800';
            case 'occupied': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800';
            case 'maintenance': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800';
            default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Rooms', href: '/rooms' }]}>
            <Head title="Rooms" />
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <Bed className="text-blue-600 dark:text-blue-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rooms Management</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage room inventory, pricing, and availability</p>
                        </div>
                    </div>
                    
                    <Button onClick={handleOpenAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus size={18} /> Add New Room
                    </Button>
                </div>

                {/* Rooms Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 text-white rounded-lg p-2">
                                <Bed size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{roomList.length}</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Total Rooms</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-green-600 text-white rounded-lg p-2">
                                <Users size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {roomList.filter((r: any) => r.status === 'available').length}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">Available</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-red-600 text-white rounded-lg p-2">
                                <Users size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {roomList.filter((r: any) => r.status === 'occupied').length}
                                </div>
                                <div className="text-sm text-red-600 dark:text-red-400">Occupied</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-600 text-white rounded-lg p-2">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {roomList.filter((r: any) => r.status === 'maintenance').length}
                                </div>
                                <div className="text-sm text-orange-600 dark:text-orange-400">Maintenance</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rooms List */}
                {roomList.length > 0 ? (
                    <div className="space-y-3">
                        {roomList.map((room: any) => (
                            <Card key={room.room_id} className="border border-gray-200 dark:border-gray-700">
                                <CardContent className="p-4">
                                    {/* Mobile Layout */}
                                    <div className="block lg:hidden space-y-4">
                                        {/* Room Header */}
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex-shrink-0">
                                                <Bed className="text-blue-600 dark:text-blue-400" size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">Room {room.room_number}</h3>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{room.type} Room</div>
                                            </div>
                                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                getStatusColor(room.status)
                                            }`}>
                                                {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                                            </div>
                                        </div>

                                        {/* Room Details */}
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <DollarSign size={16} className="text-green-600 dark:text-green-400" />
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    ₱{room.price_per_semester || '2,000'} per semester
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => handleOpenEdit(room)}
                                                className="flex-1 text-sm"
                                            >
                                                <Edit3 size={14} className="mr-2" />
                                                Edit Room
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => handleArchive(room.room_id)}
                                                className="flex-1 text-sm border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/20"
                                            >
                                                <Archive size={14} className="mr-2" />
                                                Archive
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                                        {/* Room Info - 3 columns */}
                                        <div className="col-span-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 flex-shrink-0">
                                                    <Bed className="text-blue-600 dark:text-blue-400" size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">Room {room.room_number}</h3>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{room.type} Room</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Type - 2 columns */}
                                        <div className="col-span-2">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{room.type}</div>
                                        </div>

                                        {/* Price - 2 columns */}
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={14} className="text-green-600 dark:text-green-400" />
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">₱{room.price_per_semester || '2,000'}</div>
                                            </div>
                                        </div>

                                        {/* Status - 2 columns */}
                                        <div className="col-span-2">
                                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                getStatusColor(room.status)
                                            }`}>
                                                {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                                            </div>
                                        </div>

                                        {/* Actions - 3 columns */}
                                        <div className="col-span-3">
                                            <div className="flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleOpenEdit(room)}
                                                    className="text-xs"
                                                >
                                                    <Edit3 size={12} className="mr-1" />
                                                    Edit
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleArchive(room.room_id)}
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
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Bed className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No rooms found</h3>
                        <p className="text-gray-500 dark:text-gray-500 mb-6">Start by adding your first room to manage hotel inventory.</p>
                        <Button onClick={handleOpenAdd} className="gap-2">
                            <Plus size={16} /> Create Your First Room
                        </Button>
                    </Card>
                )}

                {/* Add/Edit Room Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                    <Bed className="text-blue-600 dark:text-blue-400" size={20} />
                                </div>
                                <DialogTitle className="text-xl">{isEdit ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                            <div className="space-y-2">
                                <label htmlFor="room_number" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Bed size={14} className="text-blue-500" />
                                    Room Number
                                </label>
                                <Input 
                                    id="room_number" 
                                    name="room_number" 
                                    value={form.room_number} 
                                    onChange={handleChange} 
                                    className="text-sm"
                                    placeholder="Enter room number..."
                                    required 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Users size={14} className="text-blue-500" />
                                    Room Type
                                </label>
                                <Select value={form.type} onValueChange={(v: string) => setForm({ ...form, type: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select room type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">Single Room</SelectItem>
                                        <SelectItem value="double">Double Room</SelectItem>
                                        <SelectItem value="suite">Suite</SelectItem>
                                        <SelectItem value="deluxe">Deluxe Room</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="price_per_semester" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <DollarSign size={14} className="text-blue-500" />
                                    Price per Semester (₱)
                                </label>
                                <Input 
                                    id="price_per_semester" 
                                    name="price_per_semester" 
                                    type="number" 
                                    value={form.price_per_semester} 
                                    onChange={handleChange} 
                                    className="text-sm"
                                    placeholder="2000"
                                    min="1000"
                                    max="10000"
                                    required 
                                />
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Standard rate is ₱2,000 per semester (approximately 5 months)
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <AlertCircle size={14} className="text-blue-500" />
                                    Room Status
                                </label>
                                <Select value={form.status} onValueChange={(v: string) => setForm({ ...form, status: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="occupied">Occupied</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
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
                                        {isEdit ? 'Update Room' : 'Add Room'}
                                    </div>
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
                    title="Archive Room?"
                    message="Are you sure you want to archive this room?\n\nYou can restore it later from the Archive settings."
                    confirmText="Archive Room"
                    isDestructive={true}
                />
            </div>
        </AppLayout>
    );
} 


 
