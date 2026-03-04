
import React from 'react';
import {
    LayoutDashboard,
    GraduationCap,
    Code2,
    Trophy,
    Target,
    Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Screen, User as UserType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import GlobalHeader from './layout/GlobalHeader';

interface LayoutProps {
    children?: React.ReactNode;
    currentScreen: Screen;
    setScreen: (screen: Screen) => void;
    user?: UserType | null;
    hideSidebar?: boolean;
    hideBottomNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ currentScreen, user: propUser, children, hideSidebar, hideBottomNav }) => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const user = propUser || authUser;

    const navItems = [
        { id: 'HOME', path: '/', icon: LayoutDashboard, label: 'Home' },
        { id: 'LEARN', path: '/learn', icon: GraduationCap, label: 'Learn' },
        { id: 'PRACTICE', path: '/practice', icon: Code2, label: 'Practice' },
        { id: 'CHALLENGES', path: '/challenges', icon: Target, label: 'Challenges' },
        { id: 'LEADERBOARD', path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { id: 'CONTACT', path: '/contact', icon: Mail, label: 'Contact' },
    ];

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30 transition-colors duration-300">
            {/* Unified Global Header (Top) */}
            {!hideSidebar && <GlobalHeader />}

            {/* Main Container */}
            <div className="flex-1 flex flex-col min-w-0 relative h-[calc(100vh-80px)]">
                {/* Content Area with smooth fade transition */}
                <main className="flex-1 overflow-y-auto scroll-smooth relative no-scrollbar animate-in fade-in duration-300 bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
                    {children}
                </main>

                {/* Mobile Bottom Navigation - Improved visibility and safe-area support */}
                {!hideBottomNav && (
                    <div className="md:hidden sticky bottom-0 left-0 right-0 z-[100] bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-2xl border-t border-slate-200 dark:border-white/[0.08] pb-[env(safe-area-inset-bottom)] shadow-sm">
                        <nav className="flex items-center justify-around h-[56px] px-2">
                            {navItems.filter(item => item.id !== 'LEADERBOARD').map((item) => {
                                const isActive = currentScreen === item.id || (item.id === 'PROFILE' && (currentScreen === 'SETTINGS' || currentScreen === 'ANALYTICS' || window.location.pathname.startsWith('/profile')));
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => navigate(item.path)}
                                        className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 touch-manipulation ${isActive ? 'scale-105' : 'scale-100'}`}
                                        aria-label={item.label}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        <item.icon
                                            size={22}
                                            className={`transition-all ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />
                                        <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Layout;
