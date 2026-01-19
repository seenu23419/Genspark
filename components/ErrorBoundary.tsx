import React from 'react';
import { useRouteError } from 'react-router-dom';
import { AlertCircle, RotateCcw, Mail, Home } from 'lucide-react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export const ErrorBoundary = () => {
    const error: any = useRouteError();
    console.error(error);

    const reportError = () => {
        const errorData = {
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        console.log('Error Report:', errorData);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
                <AlertCircle size={40} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Oops! Something went wrong</h1>
            <p className="text-slate-400 mb-2 max-w-sm text-sm">
                {error?.message || "An unexpected error occurred. Our team has been notified."}
            </p>
            <p className="text-slate-500 mb-8 text-xs">Error ID: {Math.random().toString(36).substr(2, 9)}</p>
            
            <div className="flex gap-3 flex-wrap justify-center">
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg"
                >
                    <Home size={18} />
                    Go Home
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                    <RotateCcw size={18} />
                    Try Again
                </button>
                <button
                    onClick={reportError}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                    <Mail size={18} />
                    Report
                </button>
            </div>
        </div>
    );
};

export class MainErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
                        <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Application Error</h1>
                    <p className="text-slate-400 text-sm mb-6">{this.state.error?.message}</p>
                    <button
                        onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
                    >
                        Recover
                    </button>
                </div>
            );
        }

        return (
            <React.Suspense 
                fallback={
                    <div className="h-screen bg-slate-950 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                }
            >
                {this.props.children}
            </React.Suspense>
        );
    }
}
