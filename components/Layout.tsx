
import React, { useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Code2,
  User,
  Sliders,
  LogOut,
  Loader2
} from 'lucide-react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Screen, User as UserType } from '../types';
import { authService } from '../services/authService';
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
    { id: 'SETTINGS', path: '/settings', icon: Sliders, label: 'Settings' },
  ];

  const authScreens: Screen[] = ['SPLASH', 'WELCOME', 'LOGIN', 'SIGNUP', 'OTP', 'FORGOT_PASSWORD', 'RESET_PASSWORD'];
  const isAuthScreen = authScreens.includes(currentScreen);

  if (isAuthScreen) return <Outlet />;

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    console.log("Layout: Triggering logout...");
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = '/welcome';
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Desktop Left Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 shrink-0 overflow-y-auto">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <img src="/logo.png" alt="GenSpark" className="h-7 w-auto" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">GenSpark</span>
        </div>

        <div className="flex-1 px-4 space-y-2 py-6">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id || (item.id === 'PROFILE' && (currentScreen === 'SETTINGS' || currentScreen === 'ANALYTICS'));
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all group ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
              >
                <item.icon size={20} className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* User Profile Mini (Desktop) */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 p-3 bg-slate-900 rounded-2xl border border-transparent hover:border-slate-700 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl border-2 border-slate-800 overflow-hidden shadow-lg group-hover:border-indigo-500 transition-colors">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'G'}`} alt="P" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-white truncate max-w-[100px]">{user?.name || 'Guest'}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.xp || 0} XP</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-4 px-4 py-3 mt-2 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
            {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="GenSpark" className="h-7 w-auto" />
            <span className="text-base font-black text-white">GenSpark</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-xl border-2 border-slate-800 overflow-hidden shadow-lg"
            >
              <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'G'}`} alt="P" />
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 active:scale-90 transition-all disabled:opacity-50"
              title="Sign Out"
            >
              {isLoggingOut ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth relative">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (Exactly 4 items) */}
        <nav className="md:hidden flex items-center justify-around px-1 py-2.5 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 sticky bottom-0 z-50">
          {navItems.slice(0, 4).map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                <item.icon size={19} className={isActive ? 'animate-bounce-short text-indigo-400' : ''} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
