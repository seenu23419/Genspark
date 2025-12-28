
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Binary,
  Swords,
  User,
  Sliders,
  Activity,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Screen, User as UserType } from '../types';
import { authService } from '../services/authService';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
  user?: UserType | null;
}

const Layout: React.FC<LayoutProps> = ({ children, currentScreen, setScreen, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'HOME', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'EXPLORE', icon: Compass, label: 'Explore' },
    { id: 'CHAT', icon: Sparkles, label: 'GenSpark AI' },
    { id: 'COMPILER', icon: Binary, label: 'IDE' },
    { id: 'CHALLENGES', icon: Swords, label: 'Quests' },
    { id: 'PROFILE', icon: User, label: 'Profile' },
  ];

  const secondaryItems = [
    { id: 'ANALYTICS', icon: Activity, label: 'Analytics' },
    { id: 'SETTINGS', icon: Sliders, label: 'Settings' },
  ];

  const authScreens: Screen[] = ['SPLASH', 'WELCOME', 'LOGIN', 'SIGNUP', 'OTP', 'FORGOT_PASSWORD', 'RESET_PASSWORD'];
  const isAuthScreen = authScreens.includes(currentScreen);

  // Focus screens where bottom nav should be hidden to prevent input overlap
  // Added 'CHAT' here to fix the "down hiding buttons" issue
  const focusScreens: Screen[] = ['LESSON_VIEW', 'QUIZ', 'QUIZ_RESULT', 'SUBSCRIPTION', 'CHAT', 'COMPILER'];
  const isFocusScreen = focusScreens.includes(currentScreen);

  // Screens that handle their own scrolling (like Chat or IDE) should not have global scroll
  const isSelfScrolling = ['CHAT', 'COMPILER'].includes(currentScreen);

  // Logic to hide the desktop sidebar on Chat to avoid double-sidebar issue
  const shouldShowDesktopSidebar = !isAuthScreen && currentScreen !== 'CHAT';

  if (isAuthScreen) return <>{children}</>;

  const handleNavClick = (id: Screen) => {
    setScreen(id);
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    await authService.signOut();
    setScreen('WELCOME');
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
      {/* Mobile Top Bar */}
      {!isFocusScreen && (
        <header className="md:hidden flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-black/20 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/10 shadow-lg p-1">
              <img
                src="/C:/Users/DELL/.gemini/antigravity/brain/2ae91892-9cb9-48cb-8528-3a0d18afebcd/genspark_logo_1766814566695.png"
                alt="Logo"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <span className="text-lg font-black tracking-tight text-white">GenSpark</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 rounded-xl border-2 border-slate-800 overflow-hidden shadow-lg shadow-indigo-500/10 active:scale-90 transition-all focus:outline-none"
            >
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Genspark'}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <aside className={`
          md:hidden fixed top-0 right-0 h-full w-[280px] bg-slate-900 z-[70] shadow-2xl transition-transform duration-300 ease-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border-2 border-slate-800 overflow-hidden">
                  <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Genspark'}`} alt="Avatar" />
                </div>
                <div>
                  <span className="text-sm font-black text-white block truncate w-32">{user?.name || 'User'}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.xp || 0} XP</span>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-4 mb-2">Navigation</p>

              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as Screen)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${currentScreen === item.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <item.icon size={20} />
                  <span className="font-bold text-sm">{item.label}</span>
                  {currentScreen === item.id && <ChevronRight size={14} className="ml-auto opacity-60" />}
                </button>
              ))}

              <div className="pt-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-4 mb-2">Account</p>
                {secondaryItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id as Screen)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${currentScreen === item.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                  >
                    <item.icon size={20} />
                    <span className="font-bold text-sm">{item.label}</span>
                    {currentScreen === item.id && <ChevronRight size={14} className="ml-auto opacity-60" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Desktop Sidebar */}
        {shouldShowDesktopSidebar && (
          <nav className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4">
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 shadow-lg p-1 group hover:scale-110 transition-transform">
                <img
                  src="/C:/Users/DELL/.gemini/antigravity/brain/2ae91892-9cb9-48cb-8528-3a0d18afebcd/genspark_logo_1766814566695.png"
                  alt="Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <span className="text-xl font-black tracking-tight text-white">GenSpark</span>
            </div>

            <div className="space-y-1.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setScreen(item.id as Screen)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentScreen === item.id
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-transparent'
                    }`}
                >
                  <item.icon size={20} strokeWidth={currentScreen === item.id ? 2.5 : 2} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto space-y-1.5 pt-4 border-t border-slate-800">
              {secondaryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setScreen(item.id as Screen)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentScreen === item.id ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                >
                  <item.icon size={20} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        )}

        {/* Main Content Area */}
        {/* We disable global scroll for SelfScrolling screens like Chat so they can manage their own flexible height */}
        <main className={`flex-1 ${isSelfScrolling ? 'overflow-hidden flex flex-col' : 'overflow-y-auto scroll-smooth'}`}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Hidden on focus screens AND Chat) */}
      {!isFocusScreen && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 pb-safe z-40">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id as Screen)}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all ${currentScreen === item.id ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-500'
                }`}
            >
              <item.icon size={20} strokeWidth={currentScreen === item.id ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default Layout;
