import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WarningDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: 'default' | 'destructive';
    isDestructive?: boolean;
}

export default function WarningDialog({ 
    open, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Confirm",
    confirmVariant = "default",
    isDestructive = false
}: WarningDialogProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    
    useEffect(() => {
        if (open) {
            setTimeout(() => setIsAnimating(true), 50);
        } else {
            setIsAnimating(false);
        }
    }, [open]);
    
    const handleConfirm = () => {
        onConfirm();
        // Don't automatically close - let parent component handle the closing
    };
    
    const iconBgColor = isDestructive 
        ? 'bg-red-100 dark:bg-red-900/30' 
        : 'bg-yellow-100 dark:bg-yellow-900/30';
    
    const iconColor = isDestructive 
        ? 'text-red-600 dark:text-red-400' 
        : 'text-yellow-600 dark:text-yellow-400';
    
    if (!open) return null;
    
    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
            isAnimating ? 'opacity-100' : 'opacity-0'
        }`}>
            {/* Simple Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
                    isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={onClose}
            />
            
            {/* Warning Dialog */}
            <div className={`relative bg-background border border-border rounded-2xl shadow-xl max-w-md w-full mx-auto transform transition-all duration-300 ease-out ${
                isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
            }`}>
                {/* Warning Icon */}
                <div className="flex justify-center pt-8 pb-4">
                    <div className={`w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center transition-transform duration-300 ${
                        isAnimating ? 'scale-100' : 'scale-0'
                    }`}>
                        <AlertTriangle className={`h-8 w-8 ${iconColor}`} strokeWidth={2} />
                    </div>
                </div>
                
                {/* Content */}
                <div className="px-8 pb-8 text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                        {title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed whitespace-pre-line">
                        {message}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 font-medium rounded-lg transition-colors duration-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            variant={confirmVariant}
                            className={`flex-1 font-medium rounded-lg transition-colors duration-200 ${
                                isDestructive 
                                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
                
                {/* Simple Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-md hover:bg-muted/50"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
