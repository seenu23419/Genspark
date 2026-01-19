import React, { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: Toast = { id, message, type, duration };
        
        setToasts(prev => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

const ToastContainer: React.FC<{
    toasts: Toast[];
    onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed bottom-4 right-4 space-y-2 z-[9998]">
            {toasts.map(toast => (
                <ToastItem 
                    key={toast.id} 
                    toast={toast} 
                    onRemove={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};

const ToastItem: React.FC<{
    toast: Toast;
    onRemove: () => void;
}> = ({ toast, onRemove }) => {
    const bgClass = {
        success: 'bg-emerald-900/90 border-emerald-700 text-emerald-100',
        error: 'bg-red-900/90 border-red-700 text-red-100',
        info: 'bg-indigo-900/90 border-indigo-700 text-indigo-100',
        warning: 'bg-amber-900/90 border-amber-700 text-amber-100',
    }[toast.type];

    const IconComponent = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertTriangle,
    }[toast.type];

    return (
        <div className={`${bgClass} border rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-96 animate-in slide-in-from-right`}>
            <IconComponent size={20} />
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
                onClick={onRemove}
                className="text-current hover:opacity-70 transition-opacity"
            >
                <X size={18} />
            </button>
        </div>
    );
};
