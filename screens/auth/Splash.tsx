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
    return (
        <div
            className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-white dark:bg-[#000000] z-[9999] touch-none select-none overflow-hidden animate-in fade-in duration-500 transition-colors duration-300"
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
                <div className="flex items-center justify-center w-full">
                    <img
                        src="/logo.png"
                        alt="GenSpark"
                        className="w-[65%] md:w-80 lg:w-96 h-auto object-contain drop-shadow-2xl"
                        draggable={false}
                    />
                </div>
            </div>

            {/* Tagline */}
            <div className="absolute bottom-20 w-full px-6 z-10">
                <p className="text-center text-[10px] md:text-sm font-bold tracking-[0.4em] text-slate-900/90 dark:text-white/90 uppercase">
                    IGNITE YOUR CODING JOURNEY
                </p>
            </div>
        </div>
    );
};

export default Splash;
