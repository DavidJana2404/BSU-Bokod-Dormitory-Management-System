import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { Building2, Plus, Calendar, Phone, MapPin, Edit3, Archive } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import WarningDialog from '@/components/warning-dialog';
import { route } from 'ziggy-js';


interface Dormitory {
    tenant_id: number;
    dormitory_name: string;
    address: string;
    contact_number: string;
    created_at: string;
}

const emptyForm = { dormitory_name: '' };

type FormState = {
    dormitory_name: string;
    address?: string;
    contact_number?: string;
};

export default function ManageDormitories() {
    const { dormitories } = usePage().props as unknown as { dormitories: Dormitory[] };
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const [pendingArchiveId, setPendingArchiveId] = useState<number | null>(null);

    const handleOpen = () => {
        setForm(emptyForm);
        setErrors({});
        setIsEdit(false);
        setEditId(null);
        setOpen(true);
    };

    const handleOpenEdit = (dormitory: Dormitory) => {
        setForm({
            dormitory_name: dormitory.dormitory_name,
            address: dormitory.address,
            contact_number: dormitory.contact_number,
        });
        setErrors({});
        setIsEdit(true);
        setEditId(dormitory.tenant_id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setForm(emptyForm);
        setErrors({});
        setIsEdit(false);
        setEditId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (isEdit && editId) {
            router.put(route('dormitories.update', editId), form, {
                onSuccess: () => { setLoading(false); handleClose(); },
                onError: (errors) => { 
                    setLoading(false); 
                    setErrors(errors as Record<string, string> || {});
                },
            });
        } else {
            router.post(route('dormitories.store'), form, {
                onSuccess: () => { setLoading(false); handleClose(); },
                onError: (errors) => { 
                    setLoading(false); 
                    setErrors(errors as Record<string, string> || {});
                },
            });
        }
    };
    
    const handleArchive = (id: number) => {
        setPendingArchiveId(id);
        setWarningDialogOpen(true);
    };
    
    const confirmArchive = () => {
        if (!pendingArchiveId) return;
        
        router.post(route('dormitories.archive', pendingArchiveId));
        setPendingArchiveId(null);
        setWarningDialogOpen(false);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Manage Dormitories', href: '/dormitories' }]}>
            <Head title="Manage Dormitories" />
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <Building2 className="text-blue-600 dark:text-blue-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Dormitories</h1>
                            <p className="text-gray-600 dark:text-gray-400">Create, edit, and manage your dormitory properties</p>
                        </div>
                    </div>
                    
                    {/* Add Dormitory Button */}
                    <Button onClick={handleOpen} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus size={18} /> Add New Dormitory
                    </Button>
                </div>

                {/* Dormitories Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 text-white rounded-full p-2">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {dormitories.length}
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">
                                    Total Dormitories
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 text-right">
                            Manage all your dormitory properties from this central location
                        </div>
                    </div>
                </div>

                {/* Dormitories List */}
                {dormitories.length > 0 ? (
                    <div className="space-y-3">
                        {dormitories.map(dormitory => (
                            <Card key={dormitory.tenant_id} className="border border-gray-200 dark:border-gray-700">
                                <CardContent className="p-4">
                                    {/* Mobile Layout */}
                                    <div className="block lg:hidden space-y-4">
                                        {/* Dormitory Header */}
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex-shrink-0">
                                                <Building2 className="text-blue-600 dark:text-blue-400" size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">{dormitory.dormitory_name}</h3>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Dormitory ID: {dormitory.tenant_id}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="text-sm flex-1" 
                                                    title="Edit Dormitory"
                                                    onClick={() => handleOpenEdit(dormitory)}
                                                >
                                                    <Edit3 size={14} className="mr-1" />
                                                    Edit
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="text-sm flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/20" 
                                                    title="Archive Dormitory"
                                                    onClick={() => handleArchive(dormitory.tenant_id)}
                                                >
                                                    <Archive size={14} className="mr-1" />
                                                    Archive
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Dormitory Details Grid */}
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                                <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Address</div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{dormitory.address}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                                <Phone size={16} className="text-green-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Contact</div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{dormitory.contact_number}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                                <Calendar size={16} className="text-purple-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Created Date</div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {new Date(dormitory.created_at).toLocaleDateString('en-US', { 
                                                            year: 'numeric',
                                                            month: 'long', 
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                                        {/* Dormitory Info - 4 columns */}
                                        <div className="col-span-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 flex-shrink-0">
                                                    <Building2 className="text-blue-600 dark:text-blue-400" size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base truncate">{dormitory.dormitory_name}</h3>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Dormitory ID: {dormitory.tenant_id}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address - 3 columns */}
                                        <div className="col-span-3">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                                <MapPin size={14} className="text-blue-500 flex-shrink-0" />
                                                <span className="truncate">{dormitory.address}</span>
                                            </div>
                                        </div>

                                        {/* Contact - 2 columns */}
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                                <Phone size={14} className="text-green-500 flex-shrink-0" />
                                                <span className="truncate">{dormitory.contact_number}</span>
                                            </div>
                                        </div>

                                        {/* Created Date - 2 columns */}
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                                <Calendar size={14} className="text-purple-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
                                                    <div className="text-sm font-medium truncate">
                                                        {new Date(dormitory.created_at).toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric',
                                                            year: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions - 1 column */}
                                        <div className="col-span-1">
                                            <div className="flex gap-1">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="flex-1 text-xs" 
                                                    title="Edit Dormitory"
                                                    onClick={() => handleOpenEdit(dormitory)}
                                                >
                                                    <Edit3 size={12} />
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="flex-1 text-xs border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/20" 
                                                    title="Archive Dormitory"
                                                    onClick={() => handleArchive(dormitory.tenant_id)}
                                                >
                                                    <Archive size={12} />
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
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Building2 className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No dormitories found</h3>
                        <p className="text-gray-500 dark:text-gray-500 mb-6">Start by creating your first dormitory property to manage rooms and bookings.</p>
                        <Button onClick={handleOpen} className="gap-2">
                            <Plus size={16} /> Create Your First Dormitory
                        </Button>
                    </Card>
                )}


                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                    <Building2 className="text-blue-600 dark:text-blue-400" size={20} />
                                </div>
                                <DialogTitle className="text-xl">{isEdit ? 'Edit Dormitory' : 'Add New Dormitory'}</DialogTitle>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                            <div className="space-y-2">
                                <label htmlFor="dormitory_name" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Building2 size={14} className="text-blue-500" />
                                    Dormitory Name
                                </label>
                                <input 
                                    id="dormitory_name" 
                                    name="dormitory_name" 
                                    type="text" 
                                    value={form.dormitory_name} 
                                    onChange={handleChange} 
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400" 
                                    placeholder="Enter dormitory name..."
                                    required 
                                />
                                {errors.dormitory_name && <div className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠️ {errors.dormitory_name[0]}</div>}
                            </div>

                            {isEdit && (
                                <>
                                    <div className="space-y-2">
                                        <label htmlFor="address" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <MapPin size={14} className="text-blue-500" />
                                            Address
                                        </label>
                                        <input 
                                            id="address" 
                                            name="address" 
                                            type="text" 
                                            value={form.address || ''} 
                                            onChange={handleChange} 
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400" 
                                            placeholder="Enter full address..."
                                            required 
                                        />
                                        {errors.address && <div className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠️ {errors.address[0]}</div>}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="contact_number" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <Phone size={14} className="text-blue-500" />
                                            Contact Number
                                        </label>
                                        <input 
                                            id="contact_number" 
                                            name="contact_number" 
                                            type="tel" 
                                            value={form.contact_number || ''} 
                                            onChange={handleChange} 
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400" 
                                            placeholder="Enter phone number..."
                                            required 
                                        />
                                        {errors.contact_number && <div className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠️ {errors.contact_number[0]}</div>}
                                    </div>
                                </>
                            )}

                            {!isEdit && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        <strong>Note:</strong> Address will be set to the default Boys dormitory address, and contact will automatically use the manager's email.
                                    </p>
                                </div>
                            )}

                            <DialogFooter className="flex gap-3 pt-6">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleClose} 
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            {isEdit ? 'Saving...' : 'Adding...'}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {isEdit ? <Edit3 size={14} /> : <Plus size={14} />}
                                            {isEdit ? 'Save Changes' : 'Add Dormitory'}
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
                    title="Archive Dormitory?"
                    message="Are you sure you want to archive this dormitory?\n\nThis will hide the dormitory from the main list, but you can restore it later from the Archive settings."
                    confirmText="Archive Dormitory"
                    isDestructive={true}
                />
            </div>
        </AppLayout>
    );
}
