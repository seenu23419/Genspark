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
        <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-black z-[9999] touch-none select-none overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-6">
                <div className="flex items-center justify-center w-48 h-48 bg-black/20 rounded-full mb-8">
                    <img
                        src="/icons/logo.png"
                        alt="GenSpark"
                        className="w-36 h-36 object-contain"
                        draggable={false}
                    />
                </div>
            </div>

            {/* Tagline */}
            <div className="absolute bottom-20 w-full px-6 z-10">
                <p className="text-center text-[10px] md:text-sm font-bold tracking-[0.4em] text-white/90 uppercase">
                    IGNITE YOUR CODING JOURNEY
                </p>
            </div>
        </div>
    );
};

export default Splash;
