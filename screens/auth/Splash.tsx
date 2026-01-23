import React, { useState, useEffect } from 'react';

/**
 * Modern Developer-Platform Splash Screen
 * - Dark subtle gradient background
 * - Centered GenSpark logo (no container)
 * - Soft entrance animation
 * - Developer-focused design
 * - 3-second display with immediate skip if app loads
 */
const Splash: React.FC = () => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 z-[9999] touch-none select-none overflow-hidden transition-opacity duration-300 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
        >
            {/* Subtle background grid */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(148, 163, 184, .1) 25%, rgba(148, 163, 184, .1) 26%, transparent 27%, transparent 74%, rgba(148, 163, 184, .1) 75%, rgba(148, 163, 184, .1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(148, 163, 184, .1) 25%, rgba(148, 163, 184, .1) 26%, transparent 27%, transparent 74%, rgba(148, 163, 184, .1) 75%, rgba(148, 163, 184, .1) 76%, transparent 77%, transparent)',
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-6">
                {/* Logo with entrance animation */}
                <div className="animate-in fade-in zoom-in duration-700 ease-out">
                    <img
                        src="/icons/logo.png"
                        alt="GenSpark"
                        className="w-56 h-56 md:w-64 md:h-64 object-contain drop-shadow-lg"
                        draggable={false}
                    />
                </div>

                {/* Tagline */}
                <div className="mt-8 animate-in fade-in duration-1000 ease-out delay-300">
                    <p className="text-center text-sm md:text-base font-medium tracking-widest text-slate-400 opacity-70">
                        IGNITE YOUR CODING JOURNEY
                    </p>
                </div>
            </div>

            {/* Minimal Loading Indicator - Thin fade line */}
            <div className="absolute bottom-16 w-full flex justify-center relative z-10">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 animate-pulse" />
            </div>
        </div>
    );
};

export default Splash;
