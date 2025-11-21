import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren, useEffect, useState } from 'react';

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
    const [isDark, setIsDark] = useState(false);
    
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Background decoration - matching welcome page */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-green-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-yellow-500/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className="w-full max-w-md mx-auto relative z-10">
                <div className="bg-card shadow-md rounded-lg p-8 border border-border">
                    {/* Logo and Header */}
                    <div className="text-center mb-6">
                        <Link 
                            href={home()} 
                            className="inline-flex flex-col items-center space-y-2 hover:opacity-80"
                        >
                            <div className="w-10 h-10 flex items-center justify-center">
                                <img src={isDark ? "/dormwhite.png?v=2" : "/dorm.png?v=2"} alt="DMS Logo" className="w-full h-full object-contain" />
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
