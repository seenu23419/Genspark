
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
  Zap
} from 'lucide-react';
import { User, Screen } from '../../types';

interface ProfileProps {
  user: User;
  setScreen: (screen: Screen) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, setScreen, onLogout }) => {
  const menuItems = [
    { label: 'Learning Progress', icon: BookOpen, action: () => setScreen('PROGRESS') },
    { label: 'Coding Analytics', icon: Trophy, action: () => setScreen('ANALYTICS') },
    { label: 'Settings', icon: Settings, action: () => setScreen('SETTINGS') },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col items-center text-center space-y-4 pb-10 border-b border-slate-800">
        <div className="relative group">
          <div className={`w-32 h-32 rounded-full border-4 ${user.isPro ? 'border-yellow-500' : 'border-slate-800'} overflow-hidden relative`}>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-indigo-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Edit2 className="text-white" size={24} />
            </div>
          </div>
          {user.isPro && (
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full border-4 border-slate-950 flex items-center justify-center shadow-lg">
              <Crown size={18} className="text-black" fill="currentColor" />
            </div>
          )}
          <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-950 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-bold text-white">{user.name}</h1>
            {user.isPro && (
               <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-yellow-500/20">PRO</span>
            )}
          </div>
          <p className="text-slate-500 flex items-center justify-center gap-2 mt-1">
            <Mail size={16} />
            {user.email}
          </p>
          <p className="text-[10px] text-slate-700 font-mono mt-2 uppercase">ID: {user._id}</p>
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-2 bg-slate-900 border border-slate-800 text-slate-200 rounded-full font-bold text-sm hover:bg-slate-800 transition-all">
            Edit Profile
          </button>
          {!user.isPro && (
            <button 
              onClick={() => setScreen('SUBSCRIPTION')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-500 transition-all flex items-center gap-2"
            >
              <Zap size={14} fill="currentColor" />
              Upgrade to Pro
            </button>
          )}
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl text-center">
          <div className="text-orange-500 mb-1 flex justify-center"><Flame size={20} fill="currentColor" /></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Streak</p>
          <h4 className="text-xl font-black text-white">{user.streak}d</h4>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl text-center">
          <div className="text-indigo-400 mb-1 flex justify-center"><Star size={20} fill="currentColor" /></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total XP</p>
          <h4 className="text-xl font-black text-white">{user.xp}</h4>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl text-center">
          <div className="text-emerald-400 mb-1 flex justify-center"><BookOpen size={20} /></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Lessons</p>
          <h4 className="text-xl font-black text-white">{user.lessonsCompleted}</h4>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl text-center">
          <div className="text-purple-400 mb-1 flex justify-center"><Trophy size={20} /></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Rank</p>
          <h4 className="text-xl font-black text-white">#{user.isPro ? '42' : '124'}</h4>
        </div>
      </div>

      <div className="space-y-4">
        {menuItems.map((item, i) => (
          <button 
            key={i}
            onClick={item.action}
            className="w-full p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between group hover:bg-slate-800 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                <item.icon size={20} />
              </div>
              <span className="font-bold text-slate-200">{item.label}</span>
            </div>
            <ChevronRight className="text-slate-600" size={20} />
          </button>
        ))}

        <button 
          onClick={onLogout}
          className="w-full p-5 bg-red-400/5 border border-red-400/10 rounded-2xl flex items-center justify-between group hover:bg-red-400/10 transition-all mt-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-400/10 rounded-xl flex items-center justify-center text-red-400">
              <LogOut size={20} />
            </div>
            <span className="font-bold text-red-400">Logout</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Profile;
