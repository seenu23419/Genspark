
import React from 'react';
import {
  Settings,
  ChevronRight,
  Flame,
  Star,
  BookOpen,
  Trophy,
  LogOut,
  Mail,
  Edit2,
  Crown,
  Zap,
  TrendingUp,
  Target,
  Loader2
} from 'lucide-react';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';

const data = [
  { name: 'M', xp: 120, time: 45 },
  { name: 'T', xp: 90, time: 30 },
  { name: 'W', xp: 200, time: 60 },
  { name: 'T', xp: 150, time: 40 },
  { name: 'F', xp: 180, time: 55 },
  { name: 'S', xp: 400, time: 90 },
  { name: 'S', xp: 320, time: 70 },
];

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    console.log("Profile: Triggering logout...");
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = '/login';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-12 pb-32">
      {/* Profile Header */}
      <header className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem]">
        <div className="relative group">
          <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 ${user.isPro ? 'border-yellow-500 shadow-2xl shadow-yellow-500/20' : 'border-slate-800'} overflow-hidden relative`}>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-indigo-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Edit2 className="text-white" size={24} />
            </div>
          </div>
          {user.isPro && (
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl border-4 border-slate-950 flex items-center justify-center shadow-xl">
              <Crown size={22} className="text-white" fill="currentColor" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl md:text-4xl font-black text-white">{user.name}</h1>
              {user.isPro && (
                <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-yellow-500/20 tracking-widest">Pro Member</span>
              )}
            </div>
            <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2 mt-2 font-medium">
              <Mail size={16} />
              {user.email}
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
            <button className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700">
              Settings
            </button>
            {!user.isPro && (
              <button
                onClick={() => navigate('/subscription')}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Zap size={14} fill="currentColor" />
                Unlock Pro
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/5', label: 'Streak', value: `${user.streak}d` },
          { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/5', label: 'Total XP', value: user.xp },
          { icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-400/5', label: 'Lessons', value: user.lessonsCompleted },
          { icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-400/5', label: 'Global Rank', value: `#${user.isPro ? '42' : '124'}` },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] text-center space-y-2 hover:border-slate-700 transition-all">
            <div className={`${stat.color} ${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mx-auto`}>
              <stat.icon size={20} fill={i < 2 ? 'currentColor' : 'none'} />
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
            <h4 className="text-xl font-black text-white">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Embedded Analytics Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-black text-lg uppercase tracking-tight flex items-center gap-3">
            <TrendingUp className="text-indigo-400" />
            Weekly Progress
          </h3>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 p-2 rounded-lg border border-slate-800">Last 7 Days</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">XP Distribution</p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '10px' }}
                    cursor={{ fill: '#1e293b' }}
                  />
                  <Bar dataKey="xp" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Coding Time (Mins)</p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="time" stroke="#10b981" fillOpacity={1} fill="url(#colorTime)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Menu / Actions */}
      <div className="space-y-3 pt-6">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full p-6 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] flex items-center justify-between group hover:bg-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
              {isLoggingOut ? <Loader2 className="animate-spin" size={24} /> : <LogOut size={24} />}
            </div>
            <div className="text-left">
              <span className="block font-black text-red-500 uppercase tracking-widest text-sm">
                {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
              </span>
              <span className="text-[10px] text-red-500/60 font-bold uppercase">See you soon, {user.name.split(' ')[0]}!</span>
            </div>
          </div>
          <ChevronRight className="text-red-500/40 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Profile;
