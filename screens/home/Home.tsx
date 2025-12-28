
import React, { useEffect, useState } from 'react';
import { 
  Flame, 
  Star, 
  LayoutDashboard, 
  Compass, 
  Sparkles, 
  Binary, 
  ChevronRight, 
  Zap,
  Target,
  Crown
} from 'lucide-react';
import { User, Screen } from '../../types';
import { supabaseDB } from '../../services/supabaseService';

interface HomeProps {
  user: User;
  setScreen: (screen: Screen) => void;
}

const Home: React.FC<HomeProps> = ({ user, setScreen }) => {
  const [globalRank, setGlobalRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchRank = async () => {
      const rank = await supabaseDB.getUserRank(user.xp);
      setGlobalRank(rank);
    };
    fetchRank();
  }, [user.xp]);

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">Hi, 👋 {user.name.split(' ')[0]}</h1>
            {user.isPro && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-yellow-500/20">
                <Crown size={12} fill="currentColor" />
                PRO
              </span>
            )}
          </div>
          <p className="text-slate-400 mt-1 font-medium">Ready to reach Level {Math.floor(user.xp / 1000) + 2}?</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 flex items-center gap-2 group cursor-pointer hover:border-orange-500/50 transition-all">
            <Flame className="text-orange-500 group-hover:scale-110 transition-transform" size={18} fill="currentColor" />
            <span className="font-bold text-white">{user.streak} day streak</span>
          </div>
          <div className="w-10 h-10 rounded-xl border-2 border-slate-800 overflow-hidden cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => setScreen('PROFILE')}>
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" />
          </div>
        </div>
      </header>

      {/* Subscription Promo Banner */}
      {!user.isPro && (
        <section 
          onClick={() => setScreen('SUBSCRIPTION')}
          className="relative overflow-hidden bg-slate-900 border border-indigo-500/30 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer group hover:bg-slate-800/80 transition-all shadow-2xl shadow-indigo-600/10"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex items-center gap-6 z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-500">
              <Crown size={32} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Unlock GenSpark Pro</h3>
              <p className="text-slate-400 text-sm">Deep reasoning, visual analysis & 2.5x XP Boost.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 z-10">
            <span className="text-lg font-black text-indigo-400">₹49<span className="text-xs font-medium text-slate-500">/mo</span></span>
            <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-sm group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
              Upgrade
            </button>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group bg-slate-900 border border-slate-800 p-6 rounded-[2rem] overflow-hidden transition-all hover:border-indigo-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Star size={80} fill="currentColor" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">XP Earned</p>
          <h3 className="text-4xl font-black text-white">{user.xp.toLocaleString()} <span className="text-indigo-500 text-lg">XP</span></h3>
          <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-50 h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000"
              style={{ width: `${(user.xp % 1000) / 10}%`, backgroundColor: '#6366f1' }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col justify-between hover:border-emerald-500/30 transition-all">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Lessons Completed</p>
          <h3 className="text-4xl font-black text-white">{user.lessonsCompleted}</h3>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mt-4">
            <Target size={14} />
            Focus Score: 98%
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col justify-between hover:border-orange-500/30 transition-all">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Global Rank</p>
          <h3 className="text-4xl font-black text-white">#{globalRank !== null ? globalRank : '-'}</h3>
          <div className="flex items-center gap-2 text-orange-400 text-sm font-bold mt-4">
            <Zap size={14} fill="currentColor" />
            {globalRank === 1 ? 'Top of the world!' : 'Keep climbing!'}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="text-yellow-400" size={20} fill="currentColor" />
            Power Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setScreen('EXPLORE')}
            className="group p-6 bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-3xl hover:bg-slate-800 transition-all text-left flex items-center justify-between border-l-4 border-l-indigo-500 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Compass size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Pathfinder</h4>
                <p className="text-xs text-slate-500">Resume your learning map</p>
              </div>
            </div>
            <ChevronRight className="text-slate-600 group-hover:translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={() => setScreen('CHAT')}
            className="group p-6 bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-3xl hover:bg-slate-800 transition-all text-left flex items-center justify-between border-l-4 border-l-purple-500 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">GenSpark AI</h4>
                <p className="text-xs text-slate-500">{user.isPro ? 'GenSpark Pro Active' : 'Real-time assistant'}</p>
              </div>
            </div>
            <ChevronRight className="text-slate-600 group-hover:translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={() => setScreen('COMPILER')}
            className="group p-6 bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-3xl hover:bg-slate-800 transition-all text-left flex items-center justify-between border-l-4 border-l-emerald-500 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Binary size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Sandbox</h4>
                <p className="text-xs text-slate-500">Test logic in the IDE</p>
              </div>
            </div>
            <ChevronRight className="text-slate-600 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Hero Challenge */}
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-indigo-600/30">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest text-white">
              <Zap size={14} fill="currentColor" />
              Special Quest
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Cracking Binary Trees</h2>
            <p className="text-indigo-50 text-lg opacity-90 max-w-lg">Complete the recursive traversal challenge and earn the <span className="font-bold underline">"Bit Master"</span> badge.</p>
            <button 
              onClick={() => setScreen('CHALLENGES')}
              className="px-10 py-4 bg-white text-indigo-700 rounded-2xl font-black text-lg hover:shadow-2xl transition-all active:scale-95"
            >
              Start Mission
            </button>
          </div>
          <div className="hidden lg:block w-48 h-48 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center -rotate-6 hover:rotate-0 transition-transform duration-700 shadow-2xl">
             <Binary size={80} className="text-white" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
