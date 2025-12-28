
import React from 'react';
import { Loader2, AlertCircle, Inbox, Rocket } from 'lucide-react';

export const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <Rocket className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={24} />
    </div>
    <p className="text-slate-400 font-medium animate-pulse">Loading your experience...</p>
  </div>
);

export const ErrorState: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4">
    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
      <AlertCircle size={32} />
    </div>
    <h3 className="text-xl font-bold text-white">Oops!</h3>
    <p className="text-slate-400">{message || "Something went wrong. Please try again."}</p>
    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all">
      Retry
    </button>
  </div>
);

export const EmptyState: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4">
    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-600">
      <Inbox size={32} />
    </div>
    <p className="text-slate-400 font-medium">{message || "No data yet. Start learning today 🚀"}</p>
  </div>
);
