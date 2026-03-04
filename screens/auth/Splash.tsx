import React, { useState, useEffect } from 'react';

/**
 * Modern Developer-Platform Splash Screen
 * - Dark subtle gradient background
 * - Centered Glinto logo (no container)
 * - Soft entrance animation
 * - Developer-focused design
 * - 3-second display with immediate skip if app loads
 */
interface SplashProps {
    closing?: boolean;
}

const Splash: React.FC<SplashProps> = ({ closing }) => {
    return (
        <div className={`fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#070b14] z-[9999] touch-none select-none overflow-hidden transition-all duration-1000 ease-in-out ${closing ? 'opacity-0 scale-110 blur-xl pointer-events-none' : 'opacity-100'}`}>

            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[120px] animate-[bgPulse_8s_infinite_ease-in-out]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[100px] animate-[bgPulse_10s_infinite_ease-in-out_reverse]" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-12">
                <div className="relative group">
                    {/* Subtle Glow Behind Logo */}
                    <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <img
                        src="/icons/logo_premium.png"
                        alt="Glinto"
                        className="w-[75vw] md:w-[500px] object-contain animate-[logoReveal_1.5s_cubic-bezier(0.2,0,0.2,1)_forwards]"
                        draggable={false}
                    />
                </div>
            </div>

            {/* Tagline / Footer */}
            <div className="absolute bottom-16 w-full px-6 z-10 overflow-hidden">
                <p className="text-center text-[10px] md:text-sm font-black tracking-[0.6em] text-white/40 uppercase whitespace-nowrap animate-logo-reveal">
                    Ignite Your Coding Journey
                </p>
            </div>
        </div>
    );
};

export default Splash;

