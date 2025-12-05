import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Calendar, AlertCircle, Clock, User } from 'lucide-react';

interface DormitorianStatusDialogProps {
    open: boolean;
    onClose: () => void;
    student: any;
}

const emptyStatusForm = {
    status: 'in',
    effective_date: new Date().toISOString().split('T')[0],
    end_date: '',
    reason: '',
};

export default function DormitorianStatusDialog({ open, onClose, student }: DormitorianStatusDialogProps) {
    const [form, setForm] = useState(emptyStatusForm);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.put(`/students/${student.student_id}/status`, form, {
            onSuccess: () => {
                setProcessing(false);
                setForm(emptyStatusForm);
                onClose();
                // Force a full page reload to refresh all student data
                router.visit(window.location.pathname, {
                    preserveState: false,
                    preserveScroll: true,
                });
            },
            onError: (errors) => {
                setProcessing(false);
                setErrors(errors);
            },
        });
    };

    const handleClose = () => {
        setForm(emptyStatusForm);
        setErrors({});
        onClose();
    };

    if (!student) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                    <DialogTitle>Update Dormitorian Status</DialogTitle>
                    <DialogDescription>
                        Update the status for {student.first_name} {student.last_name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Status Dropdown */}
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select 
                            value={form.status} 
                            onValueChange={(value) => setForm({ ...form, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="in">Present</SelectItem>
                                <SelectItem value="on_leave">On Leave</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.status}
                            </p>
                        )}
                    </div>

                    {/* Effective Date */}
                    <div>
                        <Label htmlFor="effective_date">Effective Date</Label>
                        <div className="relative">
                            <Input
                                id="effective_date"
                                type="date"
                                value={form.effective_date}
                                onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
                                required
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.effective_date && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.effective_date}
                            </p>
                        )}
                    </div>

                    {/* End Date (required for leave) */}
                    {form.status === 'on_leave' && (
                        <div>
                            <Label htmlFor="end_date">
                                Return Date <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={form.end_date}
                                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                    required={form.status === 'on_leave'}
                                    min={form.effective_date}
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Expected return date for the dormitorian
                            </p>
                            {errors.end_date && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.end_date}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Reason */}
                    <div>
                        <Label htmlFor="reason">
                            Reason {form.status === 'on_leave' && <span className="text-red-500">*</span>}
                        </Label>
                        <Textarea
                            id="reason"
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            placeholder={
                                form.status === 'on_leave'
                                    ? 'e.g., Semester break, Family emergency, Medical leave...'
                                    : 'Optional: Add a note about this status change'
                            }
                            rows={3}
                            required={form.status === 'on_leave'}
                        />
                        {errors.reason && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.reason}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {processing ? 'Updating...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </form>
                
                {/* Status History */}
                {student.status_history && student.status_history.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Status History
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {student.status_history.map((record: any) => (
                                <div key={record.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="font-medium capitalize">
                                            {record.status.replace('_', ' ')}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(record.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                        <div>Effective: {record.effective_date}</div>
                                        {record.end_date && <div>Until: {record.end_date}</div>}
                                        {record.reason && (
                                            <div className="mt-1 italic">Reason: {record.reason}</div>
                                        )}
                                        <div className="flex items-center gap-1 mt-1">
                                            <User className="h-3 w-3" />
                                            {record.changed_by ? record.changed_by.name : 'Self-updated by dormitorian'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
