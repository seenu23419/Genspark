import React, { useState } from 'react';
import {
    LayoutDashboard,
    GraduationCap,
    Code2,
    Trophy,
    Target,
    Flame,
    User as UserIcon,
    ChevronDown,
    LogOut,
    Settings,
    Sun,
    Moon,
    Mail
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const GlobalHeader: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const navItems = [
        { id: 'HOME', path: '/', icon: LayoutDashboard, label: 'Home' },
        { id: 'LEARN', path: '/learn', icon: GraduationCap, label: 'Learn' },
        { id: 'PRACTICE', path: '/practice', icon: Code2, label: 'Practice' },
        { id: 'CHALLENGES', path: '/challenges', icon: Target, label: 'Challenges' },
        { id: 'LEADERBOARD', path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { id: 'CONTACT', path: '/contact', icon: Mail, label: 'Contact' },
    ];

    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] transition-all duration-300">
            <div className="w-full flex h-20 items-center justify-between px-6 md:px-12">

                {/* Left: Brand Logo & Navigation */}
                <div className="flex items-center gap-12">
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate('/')}
                    >
                        <div className="relative">
                            <img
                                src="/icons/logo_premium.png"
                                alt="Glinto"
                                className="w-auto h-auto object-contain transition-all duration-300"
                                style={{ height: '80px' }}
                            />
                        </div>
                    </div>

                    {/* Desktop Navigation Tabs */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    className={`px-5 py-2.5 rounded-xl text-base font-bold transition-all flex items-center gap-2 ${active
                                        ? 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 transition-all active:scale-95"
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Stats Group */}
                    <div className="flex items-center gap-2">
                        {/* Streak */}
                        <div
                            onClick={() => navigate('/profile/streaks')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/[0.08] rounded-full transition-all cursor-pointer group"
                        >
                            <Flame size={14} className="text-blue-500 group-hover:text-blue-400 transition-colors" />
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-300">{user?.streak || 0}</span>
                        </div>

                        {/* XP */}
                        <div
                            onClick={() => navigate('/leaderboard')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/[0.08] rounded-full transition-all cursor-pointer group"
                        >
                            <div className="text-[8px] font-black text-white bg-blue-600 px-1.5 py-0.5 rounded-md uppercase tracking-tight">XP</div>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-300">{user?.xp?.toLocaleString() || 0}</span>
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2.5 p-1 rounded-full border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                        >
                            <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-white/[0.08] overflow-hidden flex items-center justify-center">
                                {user?.avatar ? (
                                    <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase">{user?.name?.[0] || 'U'}</span>
                                )}
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                    <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Authenticated</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                                        >
                                            <UserIcon size={18} />
                                            View Profile
                                        </button>
                                        <button
                                            onClick={() => { navigate('/practice/history'); setIsProfileOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                                        >
                                            <Code2 size={18} />
                                            Submissions
                                        </button>
                                        <button
                                            onClick={() => { navigate('/settings'); setIsProfileOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                                        >
                                            <Settings size={18} />
                                            Settings
                                        </button>
                                        <div className="h-px bg-slate-200 dark:bg-white/[0.08] my-1 mx-2" />
                                        <button
                                            onClick={() => { toggleTheme(); }}
                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                                                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                                            </div>
                                            <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200 ${isDarkMode ? 'left-4.5' : 'left-0.5'}`} />
                                            </div>
                                        </button>
                                        <div className="h-px bg-slate-200 dark:bg-white/[0.08] my-1 mx-2" />
                                        <button
                                            onClick={() => logout()}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all"
                                        >
                                            <LogOut size={18} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default GlobalHeader;
