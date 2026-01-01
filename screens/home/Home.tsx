
import React from 'react';
import {
  Flame,
  Star,
  ArrowRight,
  Target,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { CURRICULUM, LANGUAGES } from '../../constants';

const Home: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading || !user) return null;

  // Find Contextual Lesson Info
  const lastLessonId = user.lastLessonId || 'c1';
  const lastLanguageId = user.lastLanguageId || 'c';

  const currentLanguage = LANGUAGES.find(l => l.id === lastLanguageId) || LANGUAGES[0];

  let currentLesson: any = null;
  let totalLessonsInLang = 0;

  const modules = (CURRICULUM as any)[lastLanguageId] || [];
  modules.forEach((m: any) => {
    totalLessonsInLang += m.lessons.length;
    const found = m.lessons.find((l: any) => l.id === lastLessonId);
    if (found) currentLesson = found;
  });

  const completedCount = user.completedLessonIds?.filter(id => {
    return modules.some((m: any) => m.lessons.some((l: any) => l.id === id));
  }).length || 0;

  const progressPercent = Math.round((completedCount / (totalLessonsInLang || 1)) * 100);

  if (!user) return null;

  return (
    <div className="p-5 md:p-10 space-y-8 max-w-5xl mx-auto pb-24">
      {/* Top Section: Greeting & Pro */}
      <header className="flex items-center justify-between p-1 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
            Hi, <span className="text-indigo-500">{user.firstName || (user.name || 'User').split(' ')[0]} 👋</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs md:text-sm uppercase tracking-widest leading-relaxed">Let's build something great today</p>
        </div>

        <button
          onClick={() => navigate('/subscription')}
          className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group"
        >
          <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />
          Pro
        </button>
      </header>

      {/* Main Focus: Resume Learning */}
      <section
        onClick={() => navigate(`/lesson/${lastLessonId}`)}
        className="group relative bg-slate-900 border-2 border-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all shadow-2xl active:scale-[0.98]"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-5 md:gap-6 text-center md:text-left">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-2xl md:rounded-3xl flex items-center justify-center p-3 md:p-4 border border-slate-700 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/30 transition-all">
              <img src={currentLanguage.icon} alt={currentLanguage.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{currentLanguage.name}</span>
                <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">{progressPercent}% Complete</span>
              </div>
              <h2 className="text-xl md:text-3xl font-black text-white leading-tight">
                {currentLesson?.title?.split('. ')[1] || currentLesson?.title || 'Current Topic'}
              </h2>
              <div className="mt-3 md:mt-4 flex items-center justify-center md:justify-start gap-2 text-indigo-400 font-black text-xs md:text-sm group-hover:translate-x-2 transition-transform">
                Resume Topic <ArrowRight size={16} />
              </div>
            </div>
          </div>

          <div className="w-24 h-24 md:w-32 md:h-32 relative shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-slate-800" />
              <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke="currentColor" strokeWidth="10" strokeDasharray="264" strokeDashoffset={264 * (1 - progressPercent / 100)} className="text-indigo-500 shadow-indigo-500" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-white text-base md:text-xl">
              {progressPercent}%
            </div>
          </div>
        </div>
      </section>

      {/* Progress & Motivation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Daily XP Goal */}
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-xl group">
          <div>
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest">Daily XP Goal</p>
              <span className="text-emerald-400 font-black text-sm md:text-base group-hover:scale-110 transition-transform">{user.xp % 500} / 500</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 md:h-4 rounded-full overflow-hidden mb-4 shadow-inner">
              <div
                className="bg-emerald-500 h-full rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
                style={{ width: `${(user.xp % 500) / 5}%` }}
              ></div>
            </div>
          </div>
          <p className="text-[11px] md:text-sm text-slate-400 font-medium">Get <span className="text-white font-bold">{500 - (user.xp % 500)} XP</span> to hit your goal</p>
        </div>

        {/* Streak & Milestone */}
        <div className="bg-slate-900 border-2 border-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-between hover:border-orange-500/30 transition-all shadow-xl">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest">Current Streak</p>
              <div className="flex items-center gap-3">
                <Flame className="text-orange-500" size={24} fill="currentColor" />
                <h3 className="text-2xl md:text-4xl font-black text-white">{user.streak} Days</h3>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Next Milestone</p>
              <div className="flex items-center gap-2 text-white font-bold text-xs md:text-sm">
                <Target size={14} className="text-indigo-400" /> 7 Day Streak
              </div>
            </div>
          </div>
          <div className="w-20 h-20 md:w-24 md:h-24 bg-orange-500/5 rounded-full border-2 md:border-4 border-orange-500/10 flex items-center justify-center text-orange-500 animate-pulse">
            <Star className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
