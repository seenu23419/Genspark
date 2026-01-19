import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { offlineService } from '../services/offlineService';

const OfflineBanner: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const unsubscribe = offlineService.onStatusChange(setIsOnline);
        return unsubscribe;
    }, []);

    if (isOnline) return null;

    return (
        <div className="bg-amber-500 text-slate-900 px-4 py-2 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest sticky top-0 z-50 shadow-xl">
            <WifiOff size={16} />
            <span>Offline Mode • Read-Only & Local Edits</span>
        </div>
    );
};

export default OfflineBanner;
