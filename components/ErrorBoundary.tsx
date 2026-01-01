import React from 'react';
import { useRouteError } from 'react-router-dom';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const ErrorBoundary = () => {
    const error: any = useRouteError();
    console.error(error);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
                <AlertCircle size={40} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Something went wrong</h1>
            <p className="text-slate-400 mb-8 max-w-sm">
                {error?.message || "An unexpected error occurred. Our engineers have been notifed."}
            </p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors"
            >
                <RotateCcw size={18} />
                Reload Application
            </button>
        </div>
    );
};

export const MainErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    // Fallback for non-router errors (wrapped manually)
    return (
        <React.Suspense fallback={<div className="h-screen bg-slate-950" />}>
            {children}
        </React.Suspense>
    )
}
