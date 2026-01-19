import React, { useState, useEffect } from 'react';
import { Users, Globe, Zap } from 'lucide-react';

interface MicroStatProps {
    variant?: 'active' | 'global' | 'streak';
}

const MicroStat: React.FC<MicroStatProps> = ({ variant = 'active' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Initial random seed
        let base = 0;
        if (variant === 'active') base = 120 + Math.floor(Math.random() * 50);
        if (variant === 'global') base = 15400 + Math.floor(Math.random() * 100);
        if (variant === 'streak') base = 85;

        setCount(base);

        // Subtle live updates
        const interval = setInterval(() => {
            setCount(prev => {
                const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                return prev + change;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [variant]);

    const info = {
        active: { icon: <Users size={12} />, label: '', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        global: { icon: <Globe size={12} />, label: 'learners worldwide', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
        streak: { icon: <Zap size={12} />, label: 'streak savers today', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    }[variant];

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${info.bg} backdrop-blur-sm animate-in fade-in duration-700`}>
            <span className={`${info.color} animate-pulse`}>{info.icon}</span>
            <span className={`text-[10px] font-bold ${info.color} uppercase tracking-wider`}>
                {count.toLocaleString()} {info.label}
            </span>
        </div>
    );
};

export default MicroStat;
