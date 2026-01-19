import React from 'react';
import { Hexagon, Lock, Check, Star } from 'lucide-react';

interface SkillHexagonProps {
    skillId: string;
    name: string;
    level: number; // 0-100
    icon?: React.ReactNode;
    locked?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const SkillHexagon: React.FC<SkillHexagonProps> = ({
    skillId,
    name,
    level,
    icon,
    locked = false,
    size = 'md'
}) => {
    // Size mapping
    const sizeClasses = {
        sm: 'w-16 h-16 text-[10px]',
        md: 'w-24 h-24 text-xs',
        lg: 'w-32 h-32 text-sm'
    };

    const strokeDasharray = 100;
    const strokeDashoffset = strokeDasharray - (level / 100) * strokeDasharray;

    return (
        <div className={`relative flex flex-col items-center justify-center group ${sizeClasses[size]}`}>
            {/* Background Hexagon (Empty) */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-xl transform rotate-30">
                <polygon
                    points="50 1 95 25 95 75 50 99 5 75 5 25"
                    className={`${locked ? 'fill-slate-900 stroke-slate-800' : 'fill-slate-900/80 stroke-indigo-900/50'}`}
                    strokeWidth="4"
                />
            </svg>

            {/* Progress Hexagon (Fill) */}
            {!locked && (
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full rotate-[-90deg]">
                    <path
                        d="M50 5 L90 27 L90 73 L50 95 L10 73 L10 27 Z" // Approximated path for hexagon border
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="260" // Approx perimeter
                        strokeDashoffset={260 - (level / 100) * 260}
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>
                </svg>
            )}

            {/* Content */}
            <div className="z-10 flex flex-col items-center gap-1 text-center scale-90 sm:scale-100">
                {locked ? (
                    <Lock size={size === 'sm' ? 14 : 20} className="text-slate-600" />
                ) : (
                    <>
                        {icon || <Star size={size === 'sm' ? 14 : 20} className={level === 100 ? 'text-yellow-400 fill-yellow-400' : 'text-indigo-400'} />}
                        <span className="font-black text-white uppercase tracking-wider leading-none">{level}%</span>
                    </>
                )}
            </div>

            {/* Tooltip Label */}
            <div className="absolute -bottom-6 w- max-w-[120px] text-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                <div className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 shadow-xl whitespace-nowrap">
                    {name}
                </div>
            </div>
        </div>
    );
};

export default SkillHexagon;
