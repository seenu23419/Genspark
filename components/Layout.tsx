
import React, { useState } from 'react';
import {
    LayoutDashboard,
    GraduationCap,
    Code2,
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
        { id: 'PRACTICE', path: '/practice', icon: Code2, label: 'Practice' },
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
        <div className="flex h-screen bg-[#0a0b14] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Desktop Left Sidebar */}
            <nav className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/50 p-6 shrink-0 z-50">
                <div className="flex items-center gap-4 mb-10 px-2 cursor-pointer group" onClick={() => navigate('/')}>
                    <div className="relative">
                        <div className="absolute -inset-2 bg-indigo-500/20 blur-md rounded-full group-hover:bg-indigo-500/40 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                        <img src="/icons/logo.png" alt="GenSpark" className="h-14 w-auto relative z-10 drop-shadow-xl transition-transform duration-300 group-hover:scale-105" />
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
                                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shimmer" />}
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
                <header className="md:hidden flex items-center justify-between px-4 bg-gradient-to-r from-indigo-900/90 via-[#0a0b14]/95 to-[#0a0b14]/95 backdrop-blur-2xl border-b border-indigo-500/20 sticky top-0 z-40 h-[60px] min-h-[60px] shadow-lg shadow-indigo-500/10 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3" onClick={() => navigate('/')}>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-indigo-500/30 blur-md rounded-full group-hover:bg-indigo-500/50 transition-all duration-500"></div>
                                <img src="/icons/logo.png" alt="GenSpark" className="h-10 w-auto relative z-10 drop-shadow-lg" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white via-indigo-200 to-indigo-100 bg-clip-text text-transparent tracking-tight">GenSpark</span>
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
                <main className="flex-1 overflow-y-auto scroll-smooth relative no-scrollbar pb-20 animate-in fade-in duration-300 bg-[#0a0b14]">
                    <Outlet />
                </main>

                {/* Mobile Bottom Navigation - Material Design 56 dp, 4 tabs exact */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                    <nav className="flex items-center justify-around bg-[#0a0b14] backdrop-blur-xl border-t border-white/10 shadow-[0_-2px_12px_rgba(0,0,0,0.4)] h-[56px]">
                        {navItems.map((item) => {
                            const isActive = currentScreen === item.id || (item.id === 'PROFILE' && (currentScreen === 'SETTINGS' || currentScreen === 'ANALYTICS'));
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    className={`flex-1 h-[56px] flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 touch-manipulation ${isActive ? 'scale-105' : 'scale-100'}`}
                                    aria-label={item.label}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <item.icon
                                        size={24}
                                        className={`transition-all ${isActive ? 'text-indigo-400' : 'text-slate-500 dark:text-slate-500'}`}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    <span className={`text-[12px] font-medium transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 dark:text-slate-500'}`}>
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
