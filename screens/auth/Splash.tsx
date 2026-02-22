import React, { useState, useEffect } from 'react';

/**
 * Modern Developer-Platform Splash Screen
 * - Dark subtle gradient background
 * - Centered GenSpark logo (no container)
 * - Soft entrance animation
 * - Developer-focused design
 * - 3-second display with immediate skip if app loads
 */
interface SplashProps {
    closing?: boolean;
}

const Splash: React.FC<SplashProps> = ({ closing }) => {
    return (
        <div className={`fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-black z-[9999] touch-none select-none overflow-hidden transition-all duration-700 ease-in-out ${closing ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'}`}>
            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-6">
                <img
                    src="/icons/logo.png"
                    alt="GenSpark"
                    className="w-[90vw] h-[90vw] md:w-[800px] md:h-[800px] object-contain"
                    draggable={false}
                />
            </div>

            {/* Tagline / Footer */}
            <div className="absolute bottom-16 w-full px-6 z-10 overflow-hidden">
                <p className="text-center text-[10px] md:text-base font-black tracking-[0.4em] text-white uppercase whitespace-nowrap">
                    Ignite Your Coding Journey
                </p>
            </div>
        </div>
    );
};

export default Splash;
