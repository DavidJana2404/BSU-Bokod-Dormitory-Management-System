import AppLogoIcon from '@/components/app-logo-icon';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
            {/* Background decoration - matching welcome page */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-green-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-yellow-500/5 rounded-full blur-3xl"></div>
            </div>
            
            {/* Header Navigation */}
            <header className="border-b border-border bg-background/80 backdrop-blur-sm relative z-10">
                <div className="container mx-auto px-6 py-4">
                    <nav className="flex items-center justify-between">
                        <Link href={home()} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                                <AppLogoIcon className="size-6 fill-current" />
                            </div>
                            <div className="text-xl font-bold text-foreground">
                                DMS
                            </div>
                        </Link>
                        
                        <div className="flex items-center gap-4">
                            <AppearanceToggleDropdown />
                        </div>
                    </nav>
                </div>
            </header>
            
            {/* Main Content */}
            <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-card/95 backdrop-blur-sm shadow-xl rounded-xl p-8 border border-border">
                        {/* Title and Description */}
                        {title && (
                            <div className="text-center mb-8 space-y-2">
                                <h2 className="text-2xl font-bold text-foreground">
                                    {title}
                                </h2>
                                {description && (
                                    <p className="text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}

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
        </div>
    );
}
