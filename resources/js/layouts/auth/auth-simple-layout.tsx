import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ 
    children, 
    title, 
    description 
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-card shadow-md rounded-lg p-8 border border-border">
                    {/* Logo and Header */}
                    <div className="text-center mb-6">
                        <Link 
                            href={home()} 
                            className="inline-flex flex-col items-center space-y-2 hover:opacity-80"
                        >
                            <div className="bg-muted p-3 rounded-full">
                                <AppLogoIcon className="w-8 h-8 fill-current text-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-xl font-bold text-foreground">
                                    Dormitory DMS
                                </h1>
                                <div className="text-xs text-muted-foreground font-medium">
                                    Management System
                                </div>
                            </div>
                        </Link>
                        
                        {title && (
                            <div className="mt-4 space-y-1">
                                <h2 className="text-lg font-semibold text-foreground">
                                    {title}
                                </h2>
                                {description && (
                                    <p className="text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Form Content */}
                    <div className="space-y-4">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-border">
                        <p className="text-center text-xs text-muted-foreground">
                            © 2025 Dormitory Management System
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
