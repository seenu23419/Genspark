import React from 'react';
import { Loader2 } from 'lucide-react';

interface GlobalLoaderProps {
    isLoading: boolean;
    message?: string;
}

export const GlobalLoader: React.FC<GlobalLoaderProps> = ({ isLoading, message }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-slate-900 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 border border-slate-800">
                <Loader2 size={40} className="text-indigo-500 animate-spin" />
                <div>
                    <p className="text-white font-semibold text-center">Loading...</p>
                    {message && <p className="text-slate-400 text-sm text-center mt-2">{message}</p>}
                </div>
                <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};
