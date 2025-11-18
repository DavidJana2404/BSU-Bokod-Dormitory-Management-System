import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { validateField, formatPhilippinePhone } from '@/utils/validation';

interface Dormitory {
    tenant_id: number;
    dormitory_name: string;
}

interface ApplicationModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const emptyForm = {
    tenant_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    parent_name: '',
    parent_phone: '',
    parent_relationship: '',
    additional_info: ''
};

export default function ApplicationModal({ open, onClose, onSuccess }: ApplicationModalProps) {
    const [form, setForm] = useState(emptyForm);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [clientErrors, setClientErrors] = useState<any>({}); // Client-side validation errors
    const [dormitories, setDormitories] = useState<Dormitory[]>([]);
    const [loadingDormitories, setLoadingDormitories] = useState(false);

    // Load dormitories when modal opens
    useEffect(() => {
        if (open) {
            setLoadingDormitories(true);
            fetch('/api/dormitories')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (Array.isArray(data)) {
                        setDormitories(data);
                    } else {
                        setDormitories([]);
                    }
                })
                .catch(error => {
                    console.error('Error loading dormitories:', error);
                    setDormitories([]);
                })
                .finally(() => {
                    setLoadingDormitories(false);
                });
        }
    }, [open]);

    const handleClose = () => {
        setForm(emptyForm);
        setErrors({});
        setClientErrors({});
        onClose();
    };

    const handleChange = (field: string, value: string) => {
        // Format phone number as user types
        if (field === 'phone') {
            // Allow user to type, but show formatted version if valid
            const cleanedNumber = value.replace(/[^0-9]/g, '');
            if (cleanedNumber.length <= 13) { // Max length for +63 format
                setForm(prev => ({ ...prev, [field]: value }));
            }
        } else if (field === 'email') {
            // Convert email to lowercase as user types
            setForm(prev => ({ ...prev, [field]: value.toLowerCase() }));
        } else {
            setForm(prev => ({ ...prev, [field]: value }));
        }
        
        // Clear server errors when user starts typing
        if (errors[field]) {
            setErrors((prev: any) => ({ ...prev, [field]: null }));
        }
        
        // Perform client-side validation
        const clientError = validateField(field, value);
        setClientErrors((prev: any) => ({ ...prev, [field]: clientError }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Perform client-side validation before submission
        const validationErrors: any = {};
        
        // Validate all required fields
        if (!form.tenant_id) validationErrors.tenant_id = 'Please select a dormitory';
        
        const firstNameError = validateField('first_name', form.first_name);
        if (firstNameError) validationErrors.first_name = firstNameError;
        
        const lastNameError = validateField('last_name', form.last_name);
        if (lastNameError) validationErrors.last_name = lastNameError;
        
        const emailError = validateField('email', form.email);
        if (emailError) validationErrors.email = emailError;
        
        const phoneError = validateField('phone', form.phone);
        if (phoneError) validationErrors.phone = phoneError;
        
        // Check if there are any validation errors
        if (Object.keys(validationErrors).length > 0) {
            setClientErrors(validationErrors);
            return;
        }
        
        setProcessing(true);
        setErrors({});
        setClientErrors({});

        router.post('/applications', form, {
            onSuccess: () => {
                handleClose();
                setProcessing(false);
                onSuccess?.();
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <DialogTitle className="text-2xl font-bold">Apply for Dormitory</DialogTitle>
                    <p className="text-muted-foreground mt-2">
                        Fill out this form to apply for student accommodation. We'll review your application and get back to you soon.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    {/* Dormitory Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="dormitory">Select Dormitory *</Label>
                        <Select value={form.tenant_id} onValueChange={(value) => handleChange('tenant_id', value)} disabled={loadingDormitories}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingDormitories ? 'Loading dormitories...' : dormitories.length === 0 ? 'No dormitories available' : 'Choose a dormitory'} />
                            </SelectTrigger>
                            <SelectContent>
                                {dormitories.length === 0 && !loadingDormitories ? (
                                    <SelectItem value="" disabled>
                                        No dormitories found
                                    </SelectItem>
                                ) : (
                                    dormitories.map((dormitory) => (
                                        <SelectItem key={dormitory.tenant_id} value={dormitory.tenant_id.toString()}>
                                            {dormitory.dormitory_name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {(errors?.tenant_id || clientErrors?.tenant_id) && (
                            <p className="text-red-500 text-sm flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.tenant_id || clientErrors.tenant_id}
                            </p>
                        )}
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name *</Label>
                            <Input
                                id="first_name"
                                value={form.first_name}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                placeholder="Enter your first name"
                                required
                            />
                            {(errors?.first_name || clientErrors?.first_name) && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.first_name || clientErrors.first_name}
                                </p>
                            )}
                            {!errors?.first_name && !clientErrors?.first_name && form.first_name && (
                                <p className="text-green-500 text-sm flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Valid first name
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name *</Label>
                            <Input
                                id="last_name"
                                value={form.last_name}
                                onChange={(e) => handleChange('last_name', e.target.value)}
                                placeholder="Enter your last name"
                                required
                            />
                            {(errors?.last_name || clientErrors?.last_name) && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.last_name || clientErrors.last_name}
                                </p>
                            )}
                            {!errors?.last_name && !clientErrors?.last_name && form.last_name && (
                                <p className="text-green-500 text-sm flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Valid last name
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="juan.delacruz@gmail.com"
                                required
                            />
                            {(errors?.email || clientErrors?.email) && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.email || clientErrors.email}
                                </p>
                            )}
                            {!errors?.email && !clientErrors?.email && form.email && (
                                <p className="text-green-500 text-sm flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Valid email address
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={form.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="09XX XXX XXXX or +639XX XXX XXXX"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter a valid Philippine phone number (mobile or landline)
                            </p>
                            {(errors?.phone || clientErrors?.phone) && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.phone || clientErrors.phone}
                                </p>
                            )}
                            {!errors?.phone && !clientErrors?.phone && form.phone && (
                                <p className="text-green-500 text-sm flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Valid Philippine phone number
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Parent/Guardian Contact Information */}
                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold mb-4">Parent/Guardian Emergency Contact</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Please provide emergency contact details of a parent or guardian. This information is required for safety purposes.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <Label htmlFor="parent_name">Parent/Guardian Name *</Label>
                                <Input
                                    id="parent_name"
                                    value={form.parent_name}
                                    onChange={(e) => handleChange('parent_name', e.target.value)}
                                    placeholder="Enter parent/guardian name"
                                    required
                                />
                                {(errors?.parent_name || clientErrors?.parent_name) && (
                                    <p className="text-red-500 text-sm flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors.parent_name || clientErrors.parent_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parent_relationship">Relationship *</Label>
                                <Input
                                    id="parent_relationship"
                                    value={form.parent_relationship}
                                    onChange={(e) => handleChange('parent_relationship', e.target.value)}
                                    placeholder="e.g., Mother, Father, Guardian"
                                    required
                                />
                                {(errors?.parent_relationship || clientErrors?.parent_relationship) && (
                                    <p className="text-red-500 text-sm flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors.parent_relationship || clientErrors.parent_relationship}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="parent_phone">Parent/Guardian Phone Number *</Label>
                            <Input
                                id="parent_phone"
                                type="tel"
                                value={form.parent_phone}
                                onChange={(e) => handleChange('parent_phone', e.target.value)}
                                placeholder="09XX XXX XXXX or +639XX XXX XXXX"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter a valid Philippine phone number (mobile or landline)
                            </p>
                            {(errors?.parent_phone || clientErrors?.parent_phone) && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.parent_phone || clientErrors.parent_phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-2">
                        <Label htmlFor="additional_info">Additional Information (Optional)</Label>
                        <Textarea
                            id="additional_info"
                            value={form.additional_info}
                            onChange={(e) => handleChange('additional_info', e.target.value)}
                            placeholder="Tell us anything else you'd like us to know about your application..."
                            rows={4}
                            maxLength={1000}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {form.additional_info.length}/1000 characters
                        </p>
                        {(errors?.additional_info || clientErrors?.additional_info) && (
                            <p className="text-red-500 text-sm flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.additional_info || clientErrors.additional_info}
                            </p>
                        )}
                    </div>

                    {/* Form Footer */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            <strong>What happens next?</strong><br />
                            After submitting your application, our dormitory management team will review it and contact you within 2-3 business days with further instructions.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
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
                            {processing ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}