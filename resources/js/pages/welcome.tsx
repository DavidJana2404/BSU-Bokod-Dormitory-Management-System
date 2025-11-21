import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, CalendarCheck, ArrowRight, CheckCircle, X } from 'lucide-react';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import ApplicationModal from '@/components/application-modal';
import { useState, useEffect } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [applicationModalOpen, setApplicationModalOpen] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isDark, setIsDark] = useState(false);
    
    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        
        checkDarkMode();
        
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        return () => observer.disconnect();
    }, []);
    
    // Listen for application modal trigger
    useEffect(() => {
        const handleOpenApplicationModal = () => {
            setApplicationModalOpen(true);
        };
        
        window.addEventListener('openApplicationModal', handleOpenApplicationModal);
        
        return () => {
            window.removeEventListener('openApplicationModal', handleOpenApplicationModal);
        };
    }, []);
    
    const handleApplicationSuccess = () => {
        setShowSuccessMessage(true);
        // Quick animation start
        setTimeout(() => setIsAnimating(true), 50);
        // Auto-hide after 5 seconds for cleaner UX
        setTimeout(() => {
            setIsAnimating(false);
            setTimeout(() => setShowSuccessMessage(false), 300); // Quick exit
        }, 5000);
    };
    
    const handleCloseSuccessMessage = () => {
        setIsAnimating(false);
        setTimeout(() => setShowSuccessMessage(false), 300);
    };

    return (
        <>
            <Head title="Welcome - Dormitory Management System" />
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                {/* Header */}
                <header className="border-b border-border bg-background/80 backdrop-blur-sm">
                    <div className="container mx-auto px-6 py-4">
                        <nav className="flex items-center justify-between">
                            {/* Logo */}
                            <div className="flex items-center gap-3">
                                <div className="flex aspect-square size-10 items-center justify-center">
                                    <img src={isDark ? "/dormwhite.png" : "/dorm.png"} alt="DMS Logo" className="w-full h-full object-contain" />
                                </div>
                                <div className="text-xl font-bold text-foreground">
                                    DMS
                                </div>
                            </div>
                            
                            {/* Navigation */}
                            <div className="flex items-center gap-4">
                                <AppearanceToggleDropdown />
                                
                                {auth.user ? (
                                    <Button asChild>
                                        <Link href={dashboard()}>
                                            Go to Dashboard
                                            <ArrowRight size={16} />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="ghost" asChild>
                                            <Link href={login()}>Log in</Link>
                                        </Button>
                                        <Button asChild>
                                            <Link href={register()}>Get Started</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </header>


                {/* Hero Section */}
                <section className="py-24 relative">
                    {/* Background decoration */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-green-500/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-yellow-500/5 rounded-full blur-3xl"></div>
                    </div>
                    
                    <div className="container mx-auto px-6 relative">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center gap-2 bg-muted/80 backdrop-blur-sm text-muted-foreground px-4 py-2 rounded-full text-sm font-medium mb-8">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Modern Dormitory Solutions
                            </div>
                            
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                                Smart Dormitory
                                <span className="text-transparent bg-gradient-to-r from-blue-600 via-green-600 to-yellow-600 bg-clip-text block">
                                    Management
                                </span>
                            </h1>
                            
                            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed">
                                Transform your dormitory operations with our comprehensive platform. Manage dormitorians, rooms, and bookings with ease and efficiency.
                            </p>
                            
                            {/* CTA Buttons */}
                            {!auth.user && (
                                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                    <Button 
                                        size="lg" 
                                        className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                                        onClick={() => {
                                            // This will be handled by the modal trigger
                                            const event = new CustomEvent('openApplicationModal');
                                            window.dispatchEvent(event);
                                        }}
                                    >
                                        Apply Now
                                        <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                    <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold" asChild>
                                        <Link href={login()}>Sign In</Link>
                                    </Button>
                                </div>
                            )}
                            
                            {auth.user && (
                                <Button size="lg" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                                    <Link href={dashboard()}>
                                        Go to Dashboard
                                        <ArrowRight size={20} className="ml-2" />
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {/* Feature Cards */}
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Dormitory Management */}
                            <Card className="p-8 text-center bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="mb-6 p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                                    <Building2 className="text-blue-600 dark:text-blue-400" size={32} />
                                </div>
                                <CardTitle className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Dormitory Management</CardTitle>
                                <p className="text-muted-foreground leading-relaxed">
                                    Manage multiple dormitories, track room availability, and monitor facility status in real-time with comprehensive oversight tools.
                                </p>
                            </Card>

                            {/* Student Management */}
                            <Card className="p-8 text-center bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/50 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                                    <Users className="text-yellow-600 dark:text-yellow-400" size={32} />
                                </div>
                                <CardTitle className="text-xl font-semibold mb-4 text-yellow-800 dark:text-yellow-200">Dormitorian Management</CardTitle>
                                <p className="text-muted-foreground leading-relaxed">
                                    Complete dormitorian profiles, room assignments, access control, and comprehensive records with streamlined workflows.
                                </p>
                            </Card>

                            {/* Booking System */}
                            <Card className="p-8 text-center bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/50 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                                    <CalendarCheck className="text-green-600 dark:text-green-400" size={32} />
                                </div>
                                <CardTitle className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">Booking System</CardTitle>
                                <p className="text-muted-foreground leading-relaxed">
                                    Streamlined reservation system with automated confirmation, conflict detection, and real-time availability updates.
                                </p>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Key Features Section */}
                <section className="bg-muted/30 py-20 border-y border-border/50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Why Choose Our System?</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Trusted by dormitory administrators for efficient management and seamless operations
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Multi-Dormitory Support */}
                            <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">Multi</div>
                                <div className="text-sm text-muted-foreground">Dormitory Support</div>
                            </Card>
                            {/* Room Tracking */}
                            <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">Real-time</div>
                                <div className="text-sm text-muted-foreground">Room Tracking</div>
                            </Card>
                            {/* Automated Booking */}
                            <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">Smart</div>
                                <div className="text-sm text-muted-foreground">Booking System</div>
                            </Card>
                            {/* Easy Management */}
                            <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">Easy</div>
                                <div className="text-sm text-muted-foreground">User Management</div>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border py-8">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex aspect-square size-8 items-center justify-center">
                                    <img src={isDark ? "/dormwhite.png" : "/dorm.png"} alt="DMS Logo" className="w-full h-full object-contain" />
                                </div>
                                <div className="font-semibold text-foreground">
                                    Dormitory Management System
                                </div>
                            </div>
                            
                            <div className="text-sm text-muted-foreground">
                                Built with Laravel, React & TypeScript
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            
            {/* Simplified Success Modal - Clean & Lightweight */}
            {showSuccessMessage && (
                <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
                    isAnimating ? 'opacity-100' : 'opacity-0'
                }`}>
                    {/* Simple Backdrop */}
                    <div 
                        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
                            isAnimating ? 'opacity-100' : 'opacity-0'
                        }`}
                        onClick={handleCloseSuccessMessage}
                    />
                    
                    {/* Clean Success Modal */}
                    <div className={`relative bg-background border border-border rounded-2xl shadow-xl max-w-md w-full mx-auto transform transition-all duration-300 ease-out ${
                        isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
                    }`}>
                        {/* Success Icon */}
                        <div className="flex justify-center pt-8 pb-4">
                            <div className={`w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center transition-transform duration-300 ${
                                isAnimating ? 'scale-100' : 'scale-0'
                            }`}>
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" strokeWidth={2} />
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="px-8 pb-8 text-center">
                            <h3 className="text-2xl font-bold text-foreground mb-3">
                                Application Submitted!
                            </h3>
                            
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                Thank you for your application! We'll review it and get back to you within <span className="font-semibold text-green-600 dark:text-green-400">2-3 business days</span>.
                            </p>
                            
                            {/* Single Action Button */}
                            <Button
                                onClick={handleCloseSuccessMessage}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                            >
                                Got it, thanks!
                            </Button>
                        </div>
                        
                        {/* Simple Close Button */}
                        <button
                            onClick={handleCloseSuccessMessage}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-md hover:bg-muted/50"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Application Modal */}
            <ApplicationModal 
                open={applicationModalOpen} 
                onClose={() => setApplicationModalOpen(false)}
                onSuccess={handleApplicationSuccess}
            />
        </>
    );
}
