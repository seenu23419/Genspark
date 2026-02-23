
import React, { useState } from 'react';
import {
    LayoutGrid,
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
    hideSidebar?: boolean;
    hideBottomNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ currentScreen, user: propUser, children, hideSidebar, hideBottomNav }) => {
    const navigate = useNavigate();
    const { logout, user: authUser } = useAuth();
    const user = propUser || authUser;

    const navItems = [
        { id: 'HOME', path: '/', icon: LayoutGrid, label: 'Home' },
        { id: 'LEARN', path: '/learn', icon: GraduationCap, label: 'Learn' },
        { id: 'PRACTICE', path: '/practice', icon: Code2, label: 'Practice' },
        { id: 'PROFILE', path: '/settings', icon: User, label: 'Profile' },
    ];

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    // Keyboard detection for mobile - Use VisualViewport for better accuracy
    React.useEffect(() => {
        if (window.visualViewport) {
            const handleResize = () => {
                const isKeyboard = window.visualViewport!.height < window.innerHeight * 0.75;
                setIsKeyboardVisible(isKeyboard);
            };
            window.visualViewport.addEventListener('resize', handleResize);
            return () => window.visualViewport?.removeEventListener('resize', handleResize);
        } else {
            const handleFocus = (e: FocusEvent) => {
                const tagName = (e.target as HTMLElement).tagName;
                if (tagName === 'INPUT' || tagName === 'TEXTAREA') setIsKeyboardVisible(true);
            };
            const handleBlur = () => setIsKeyboardVisible(false);
            window.addEventListener('focusin', handleFocus);
            window.addEventListener('focusout', handleBlur);
            return () => {
                window.removeEventListener('focusin', handleFocus);
                window.removeEventListener('focusout', handleBlur);
            };
        }
    }, []);

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
            {!hideSidebar && (
                <nav className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white/50 dark:bg-black/95 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 p-6 shrink-0 z-50">
                    <div className="flex items-center gap-4 mb-10 px-2 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="relative w-8 h-8 flex items-center justify-center bg-slate-900 rounded-lg border border-slate-700 dark:border-indigo-500/20 transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-500/50">
                            <img
                                src="/icons/logo.png"
                                alt="GenSpark"
                                className="h-4.5 w-auto relative z-10 transition-all duration-300 object-contain"
                                style={{ filter: 'saturate(1.4) contrast(1.1)' }}
                            />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-indigo-700 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-100 bg-clip-text text-transparent tracking-tight">GenSpark</span>
                    </div>

                    <div className="flex-1 space-y-2">
                        <p className="px-4 text-[10px] font-black uppercase text-slate-800 dark:text-slate-500 tracking-widest mb-4">Menu</p>
                        {navItems.map((item) => {
                            const isActive = currentScreen === item.id || (item.id === 'PROFILE' && (currentScreen === 'SETTINGS' || currentScreen === 'ANALYTICS'));
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all group relative overflow-hidden ${isActive
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                        : 'text-slate-900 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
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
                        <div className="flex items-center gap-3 p-3 mb-2 opacity-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <User size={14} className="text-slate-900 dark:text-slate-500" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-400 truncate">Logged in as</p>
                                <p className="text-[10px] font-medium text-slate-900 dark:text-slate-300 truncate">{user?.name || 'User'}</p>
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
            )}

            {/* Main Container */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Mobile Header - Material Design 56 dp */}
                {!hideSidebar && (
                    <header className="md:hidden flex items-center justify-between px-5 bg-black sticky top-0 z-40 h-[64px] min-h-[64px] border-b border-white/5 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div
                                className="flex items-center gap-3 active:scale-95 transition-all cursor-pointer group"
                                onClick={() => navigate('/')}
                            >
                                <div className="p-1 bg-slate-900 rounded-lg shadow-md border border-white/10 ring-1 ring-white/5">
                                    <img
                                        src="/icons/logo.png"
                                        alt="GenSpark"
                                        className="h-7 w-7 relative z-10 object-contain"
                                        style={{ filter: 'saturate(1.5) contrast(1.2)' }}
                                    />
                                </div>
                                <span className="text-2xl font-black text-white tracking-widest uppercase italic leading-none">GenSpark</span>
                            </div>
                        </div>
                    </header>
                )}

                {/* Content Area with smooth fade transition - proper padding for mobile */}
                <main className={`flex-1 overflow-y-auto scroll-smooth relative no-scrollbar animate-in fade-in duration-300 bg-black transition-colors duration-300 ${!hideBottomNav ? 'pb-[80px] md:pb-0' : ''}`}>
                    {children}
                </main>

                {/* Mobile Bottom Navigation - Modern Native App Style */}
                {!hideBottomNav && !isKeyboardVisible && (
                    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-black/95 backdrop-blur-2xl border-t border-white/10 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
                        <nav className="flex items-center justify-between h-[72px] px-4">
                            {navItems.map((item) => {
                                const isActive = currentScreen === item.id || (item.id === 'PROFILE' && (currentScreen === 'SETTINGS' || currentScreen === 'ANALYTICS' || window.location.pathname.startsWith('/profile')));
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => navigate(item.path)}
                                        className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 active:scale-90 touch-manipulation relative`}
                                        aria-label={item.label}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        <div className={`transition-all duration-300 flex items-center justify-center ${isActive ? 'scale-110 -translate-y-0.5' : 'scale-100'}`}>
                                            <item.icon
                                                size={24}
                                                className={`transition-all duration-300 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`}
                                                strokeWidth={isActive ? 2.5 : 2}
                                            />
                                        </div>
                                        <span className={`text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${isActive ? 'text-indigo-400 font-black' : 'text-slate-400'}`}>
                                            {item.label}
                                        </span>
                                        {isActive && (
                                            <div className="absolute -bottom-2 w-8 h-1 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-in fade-in zoom-in duration-300" />
                                        )}
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
