import { Head } from '@inertiajs/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error500() {
    const handleRefresh = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    return (
        <>
            <Head title="Server Error" />
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center p-8 max-w-md mx-auto">
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="text-red-600 dark:text-red-400" size={40} />
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Server Error
                    </h1>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        We're experiencing technical difficulties. This might be temporary - please try again.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button 
                            onClick={handleRefresh}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <RefreshCw size={16} />
                            Refresh Page
                        </button>
                        
                        <button 
                            onClick={handleGoHome}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <Home size={16} />
                            Go to Dashboard
                        </button>
                    </div>
                    
                    <div className="mt-8 text-sm text-gray-500 dark:text-gray-500">
                        <p>If the problem persists, please contact support.</p>
                        <p className="mt-2">Error Code: 500</p>
                    </div>
                </div>
            </div>
        </>
    );
}