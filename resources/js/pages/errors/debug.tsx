import { Head } from '@inertiajs/react';
import { AlertCircle, Bug, Database, FileText, Clock, User, Globe, Code } from 'lucide-react';

interface ErrorDetails {
    error_type: string;
    error_message: string;
    error_file: string;
    error_line: number;
    url: string;
    method: string;
    timestamp: string;
    user_id: string;
    is_inertia_request: string;
    expects_json: string;
    stack_trace: string;
}

interface Props {
    error: ErrorDetails;
    suggestions: string[];
}

export default function Debug({ error, suggestions }: Props) {
    const getErrorIcon = (errorType: string) => {
        if (errorType.includes('Database')) return Database;
        if (errorType.includes('Http')) return Globe;
        return Bug;
    };

    const ErrorIcon = getErrorIcon(error.error_type);

    return (
        <>
            <Head title="Application Error - Debug Information" />
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-red-900/20 p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border-l-4 border-red-500">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-12 w-12 text-red-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Application Error Detected
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">
                                    Instead of showing a 502 Bad Gateway, here's what actually went wrong:
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <ErrorIcon className="h-6 w-6 text-red-500" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Error Details
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 sm:w-24 flex-shrink-0">
                                        Type:
                                    </span>
                                    <span className="text-red-600 dark:text-red-400 font-mono text-sm break-all">
                                        {error.error_type}
                                    </span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-start">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 sm:w-24 flex-shrink-0">
                                        Message:
                                    </span>
                                    <span className="text-gray-900 dark:text-gray-100 font-mono text-sm break-words">
                                        {error.error_message}
                                    </span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 sm:w-24 flex-shrink-0">
                                        File:
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400 font-mono text-sm break-all">
                                        {error.error_file}
                                    </span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 sm:w-24 flex-shrink-0">
                                        Line:
                                    </span>
                                    <span className="text-orange-600 dark:text-orange-400 font-mono font-bold">
                                        {error.error_line}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Request Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="h-6 w-6 text-blue-500" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Request Information
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-start">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 sm:w-32 flex-shrink-0">
                                        URL:
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400 font-mono text-sm break-all">
                                        {error.url}
                                    </span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 sm:w-32 flex-shrink-0">
                                        Method:
                                    </span>
                                    <span className="text-green-600 dark:text-green-400 font-mono font-bold">
                                        {error.method}
                                    </span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 sm:w-32 flex-shrink-0">
                                        User:
                                    </span>
                                    <span className="text-gray-900 dark:text-gray-100 font-mono">
                                        {error.user_id}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 sm:w-32 flex-shrink-0">
                                        Inertia Request:
                                    </span>
                                    <span className={`font-mono font-bold ${
                                        error.is_inertia_request === 'Yes' 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {error.is_inertia_request}
                                    </span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 sm:w-32 flex-shrink-0">
                                        Expects JSON:
                                    </span>
                                    <span className={`font-mono font-bold ${
                                        error.expects_json === 'Yes' 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {error.expects_json}
                                    </span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 sm:w-32 flex-shrink-0">
                                        Timestamp:
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                                        {error.timestamp}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stack Trace */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Code className="h-6 w-6 text-purple-500" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Stack Trace
                            </h2>
                        </div>
                        
                        <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
                                {error.stack_trace}
                            </pre>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                            <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">
                                💡 Suggested Actions
                            </h2>
                        </div>
                        
                        <ul className="space-y-2">
                            {suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    <span className="text-green-800 dark:text-green-200">
                                        {suggestion}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                🔧 Quick Actions
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <button 
                                    onClick={() => window.location.href = '/dashboard'}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Go to Dashboard
                                </button>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                                >
                                    Retry Request
                                </button>
                                <button 
                                    onClick={() => window.history.back()}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}