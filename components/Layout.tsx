
import React, { useState } from 'react';
import {
    LayoutDashboard,
    GraduationCap,
    Puzzle,
    Settings,
    LogOut,
    Loader2,
    User,
    Terminal
} from 'lucide-react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Screen, User as UserType } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
    children?: React.ReactNode;
    currentScreen: Screen;
    setScreen: (screen: Screen) => void;
    user?: UserType | null;
}

const Layout: React.FC<LayoutProps> = ({ currentScreen, user: propUser }) => {
    const navigate = useNavigate();
    const { logout, user: authUser } = useAuth();
    const user = propUser || authUser;

    const navItems = [
        { id: 'HOME', path: '/', icon: LayoutDashboard, label: 'Home' },
        { id: 'LEARN', path: '/learn', icon: GraduationCap, label: 'Learn' },
        { id: 'PRACTICE', path: '/practice', icon: Puzzle, label: 'Practice' },
        { id: 'PROFILE', path: '/profile', icon: User, label: 'Profile' },
    ];

    const authScreens: Screen[] = ['SPLASH', 'WELCOME', 'LOGIN', 'SIGNUP', 'OTP', 'FORGOT_PASSWORD', 'RESET_PASSWORD'];
    const isAuthScreen = authScreens.includes(currentScreen);

    if (isAuthScreen) return <Outlet />;

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (err) {
            console.error("Logout error:", err);
            window.location.href = '/welcome';
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-300">
            {/* Desktop Left Sidebar */}
            <nav className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white/50 dark:bg-slate-950/70 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 p-6 shrink-0 z-50">
                <div className="flex items-center gap-4 mb-10 px-2 cursor-pointer group" onClick={() => navigate('/')}>
                    <div className="relative p-1.5 bg-slate-900 rounded-lg shadow-2xl shadow-slate-950 border border-slate-700 dark:border-indigo-500/30 transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-500/60">
                        <img
                            src="/icons/logo.png"
                            alt="GenSpark"
                            className="h-6 w-auto relative z-10 transition-all duration-300"
                            style={{ filter: 'saturate(1.4) contrast(1.1)' }}
                        />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-indigo-600 to-indigo-500 dark:from-white dark:via-indigo-200 dark:to-indigo-100 bg-clip-text text-transparent tracking-tight">GenSpark</span>
                </div>

                <div className="flex-1 space-y-2">
                    <p className="px-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-600 tracking-widest mb-4">Menu</p>
                    {navItems.map((item) => {
                        const isActive = currentScreen === item.id || (item.id === 'PROFILE' && (currentScreen === 'SETTINGS' || currentScreen === 'ANALYTICS'));
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all group relative overflow-hidden ${isActive
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                                    }`}
                            >
                                <item.icon size={20} className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} strokeWidth={isActive ? 2.5 : 2} />
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                {/* User Profile Mini (Desktop) */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800/50">
                    <div className="flex items-center gap-3 p-3 mb-2 opacity-50">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <User size={14} className="text-slate-500" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">Logged in as</p>
                            <p className="text-[10px] font-medium text-slate-600 truncate">{user?.name || 'User'}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoggingOut ? <Loader2 className="animate-spin" size={14} /> : <LogOut size={14} />}
                        {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                    </button>
                </div>
            </nav>

            {/* Main Container */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Mobile Header - Material Design 56 dp */}
                <header className="md:hidden flex items-center justify-between px-5 bg-slate-50/90 dark:bg-black/90 backdrop-blur-2xl border-b border-slate-300 dark:border-white/5 sticky top-0 z-40 h-[64px] min-h-[64px] transition-all duration-300 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center gap-3 active:scale-95 transition-all cursor-pointer group"
                            onClick={() => navigate('/')}
                        >
                            <div className="p-0.5 bg-slate-900 rounded-md shadow-md border border-slate-800">
                                <img
                                    src="/icons/logo.png"
                                    alt="GenSpark"
                                    className="h-4 w-4 relative z-10 object-contain"
                                    style={{ filter: 'saturate(1.4) contrast(1.1)' }}
                                />
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">GenSpark</span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/settings')}
                        className="w-[48px] h-[48px] flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
                        aria-label="Settings"
                    >
                        <Settings size={24} className="text-slate-700 dark:text-slate-300" strokeWidth={1.5} />
                    </button>
                </header>

                {/* Content Area with smooth fade transition - proper padding for mobile */}
                <main className="flex-1 overflow-y-auto scroll-smooth relative no-scrollbar pb-20 animate-in fade-in duration-300 bg-slate-100 dark:bg-black transition-colors duration-300">
                    <Outlet />
                </main>

                {/* Mobile Bottom Navigation - Improved visibility and safe-area support */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-slate-100 dark:bg-slate-900 border-t border-slate-300 dark:border-white/10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
                    <nav className="flex items-center justify-around h-[56px] px-2">
                        {navItems.map((item) => {
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
                                        size={24}
                                        className={`transition-all ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    <span className={`text-[11px] font-bold transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Layout;
