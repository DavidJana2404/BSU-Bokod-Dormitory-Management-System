import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { type HTMLAttributes } from 'react';

interface InputErrorProps extends HTMLAttributes<HTMLDivElement> {
    message?: string;
    showIcon?: boolean;
}

export default function InputError({ 
    message, 
    className = '', 
    showIcon = true, 
    ...props 
}: InputErrorProps) {
    if (!message) return null;

    return (
        <div 
            {...props} 
            className={cn(
                'flex items-center space-x-1 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-left-1 duration-200', 
                className
            )}
            role="alert"
            aria-live="polite"
        >
            {showIcon && (
                <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            )}
            <span>{message}</span>
        </div>
    );
}
