import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { router } from '@inertiajs/react';
import { initializeTheme } from './hooks/use-appearance';
import axios from 'axios';

// Make axios available globally for other scripts
window.axios = axios;

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => {
        // Add error handling for dynamic imports
        return resolvePageComponent(
            `./pages/${name}.tsx`, 
            import.meta.glob('./pages/**/*.tsx')
        ).catch((error) => {
            console.error('Failed to load page component:', name, error);
            // Fallback to a basic error page or retry
            return import('./pages/errors/500.tsx').catch(() => {
                // Ultimate fallback
                return { default: () => {
                    return (
                        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                            <div className="text-center p-8">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    Loading Error
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    There was an error loading this page. Please refresh and try again.
                                </p>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Refresh Page
                                </button>
                            </div>
                        </div>
                    );
                }};
            });
        });
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
        showSpinner: true,
    },
});

// This will set light / dark mode on load...
initializeTheme();
