import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Moon, Bell, Globe, ShieldCheck,
  ChevronRight, ArrowLeft, Info, Lock, User as UserIcon,
  Save, Loader2, Camera, Send, Star, CheckCircle2,
  HelpCircle, LogOut, Settings as SettingsIcon,
  Shield, FileText, Smartphone, Layout, Eye, Fingerprint, Palette, Zap
} from 'lucide-react';

type SubSection = 'PROFILE' | 'ACCOUNT' | 'APPEARANCE' | 'NOTIFICATIONS' | 'SECURITY';

const Settings: React.FC<{ onBack?: () => void }> = ({ onBack: propOnBack }) => {
  const { user, logout, loading, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSub, setActiveSub] = useState<SubSection>('PROFILE');

  // Profile States
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [locationStr, setLocationStr] = useState('');

  // Appearance States
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [fontSize, setFontSize] = useState('Medium');

  // Persistence/Feedback States
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    if (user) {
      setName(user.name || '');
      setBio((user as any).bio || '');
      setLocationStr((user as any).location || '');
    }
  }, [user]);

  if (loading || !user) return null;

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

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      if (updateUser) {
        await updateUser({
          name,
          bio,
          location: locationStr
        } as any);
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Profile update failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (propOnBack) propOnBack();
    else navigate(-1);
  };

  const SidebarItem = ({ id, icon: Icon, label, desc }: any) => {
    const isActive = activeSub === id;
    return (
      <button
        onClick={() => setActiveSub(id)}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
          }`}
      >
        <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5 group-hover:bg-blue-500/10'}`}>
          <Icon size={18} className={isActive ? 'text-white' : 'group-hover:text-blue-500'} />
        </div>
        <div className="text-left hidden md:block">
          <p className="text-sm font-bold tracking-tight">{label}</p>
          <p className={`text-[10px] uppercase tracking-widest font-black opacity-60 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
            {desc}
          </p>
        </div>
      </button>
    );
  };

  const renderProfile = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="relative group cursor-pointer">
          <div className="w-28 h-28 rounded-3xl bg-slate-100 dark:bg-white/5 p-1 transition-transform duration-500 premium-border">
            <div className="w-full h-full rounded-[20px] bg-white dark:bg-[#1e293b] flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/[0.08]">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {user.name?.[0].toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-blue-600 w-10 h-10 rounded-2xl border-4 border-white dark:border-[#0f172a] flex items-center justify-center text-white">
            <Camera size={16} />
          </div>
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Profile Settings</h2>
          <p className="text-sm text-slate-500 font-medium">Publicly visible identity and professional bio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Location</label>
          <input
            type="text"
            value={locationStr}
            onChange={(e) => setLocationStr(e.target.value)}
            className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            placeholder="San Francisco, CA"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Professional Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none"
            placeholder="Tell your story to the community..."
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Update Profile
        </button>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="space-y-6">
        <div>
          <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-1 flex items-center gap-2">
            <Fingerprint size={14} className="text-blue-500" /> Account Security
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">Manage your authentication and security settings.</p>
        </div>

        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Email Address</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.email}</p>
            </div>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20">Verified</span>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/[0.08]">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Account Password</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">••••••••••••••••</p>
            </div>
            <button className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:underline">Change</button>
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-10 border-t border-slate-200 dark:border-white/[0.08]">
        <div>
          <h3 className="text-xs font-black uppercase text-rose-500 tracking-widest mb-1">Danger Zone</h3>
          <p className="text-[11px] text-slate-500 font-medium">Irreversible actions that will delete your account data.</p>
        </div>

        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to delete your account? This action is permanent.")) {
              logout();
              navigate('/login');
            }
          }}
          className="w-full flex items-center justify-between p-6 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 rounded-3xl transition-all group"
        >
          <div className="text-left">
            <p className="text-sm font-bold text-rose-500 tracking-tight">Delete Account</p>
            <p className="text-[10px] text-rose-500/60 font-medium uppercase tracking-widest">Wipe streaks, history, and profile data</p>
          </div>
          <LogOut size={18} className="text-rose-500 group-hover:translate-x-1 transition-transform" />
        </button>
      </section>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="space-y-6">
        <div className="flex items-center justify-between bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-[32px] p-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
              {isDarkMode ? <Moon size={24} /> : <Globe size={24} />}
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-widest">Dark Mode</h3>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-widest">Adjust the platform color theme</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className={`w-16 h-8 rounded-full transition-all relative ${isDarkMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-800'}`}
          >
            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${isDarkMode ? 'translate-x-8' : 'translate-x-0'}`} />
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2 mb-4">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-1">Visual Density</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {['Compact', 'Medium', 'Relaxed'].map(size => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${fontSize === size
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white dark:bg-[#1e293b] border-slate-200 dark:border-white/[0.08] text-slate-400 hover:border-blue-500/40'
                }`}
            >
              <Layout size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">{size}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-[32px] flex items-center gap-6">
        <Info size={24} className="text-blue-500 shrink-0" />
        <p className="text-xs text-blue-500/80 font-medium">
          Appearance changes are local to your device and may reset if you clear your browser data.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] transition-colors duration-300">
      {/* Dynamic Success Toast */}
      {showSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-top-8 duration-500 font-bold uppercase text-xs tracking-widest border border-emerald-400/30">
          <CheckCircle2 size={16} /> Profile Updated Successfully
        </div>
      )}

      {/* Header */}
      <nav className="bg-white dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={handleBack}
              className="p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/[0.08] rounded-2xl text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-all active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Settings</h1>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Configure your professional profile</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 space-y-3">
            <SidebarItem id="PROFILE" icon={UserIcon} label="Profile" desc="Identity Details" />
            <SidebarItem id="ACCOUNT" icon={ShieldCheck} label="Account" desc="Security" />
            <SidebarItem id="APPEARANCE" icon={Layout} label="Appearance" desc="Interface" />
            <SidebarItem id="NOTIFICATIONS" icon={Bell} label="Notifications" desc="Alerts" />
            <SidebarItem id="SECURITY" icon={Lock} label="Privacy" desc="Safety" />

            <div className="pt-8 px-4">
              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/[0.08] relative overflow-hidden group">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Version</p>
                <p className="text-[11px] font-bold text-slate-900 dark:text-white mb-4">Glinto SaaS v1.2.0</p>
                <button className="text-blue-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                  Release Notes <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <section className="lg:col-span-9">
            <div className="bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-white/[0.08] rounded-[40px] p-8 md:p-12 relative min-h-[600px]">
              {activeSub === 'PROFILE' && renderProfile()}
              {activeSub === 'ACCOUNT' && renderAccount()}
              {activeSub === 'APPEARANCE' && renderAppearance()}

              {/* Fallback for under construction tabs */}
              {['NOTIFICATIONS', 'SECURITY'].includes(activeSub) && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 border border-blue-500/10">
                    <Zap size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Coming Soon</h2>
                  <p className="text-slate-500 text-sm font-medium max-w-sm">
                    This section is currently being developed. Stay tuned for future updates.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;