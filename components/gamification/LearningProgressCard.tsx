import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CURRICULUM, LANGUAGES } from '../../constants';
import { ChevronRight, Sparkles } from 'lucide-react';

const LearningProgressCard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const lastLessonId = user.lastLanguageId === 'dsa' ? 'dsa1' : (user.lastLessonId || 'c1');
  const lastLanguageId = user.lastLanguageId || 'c';

  const EXCLUDED_LANGUAGE_IDS = ['dsa', 'fullstack', 'htmlcss'];
  const selectedLanguageId = EXCLUDED_LANGUAGE_IDS.includes(lastLanguageId) || !(CURRICULUM as any)[lastLanguageId]
    ? Object.keys(CURRICULUM)[0]
    : lastLanguageId;

  const currentLanguage = (LANGUAGES as any).find((l: any) => l.id === selectedLanguageId) || (LANGUAGES as any)[0];

  const modules = (CURRICULUM as any)[selectedLanguageId] || [];
  let currentLesson: any = null;
  let totalLessonsInLang = 0;

  modules.forEach((m: any) => {
    totalLessonsInLang += m.lessons.length;
    const found = m.lessons.find((l: any) => l.id === lastLessonId);
    if (found) {
      currentLesson = found;
    }
  });

  const completedCount = user.completedLessonIds?.filter((id: string) => {
    return modules.some((m: any) => m.lessons.some((l: any) => l.id === id));
  }).length || 0;

  const remainingCount = totalLessonsInLang - completedCount;
  const estimationText = remainingCount > 0 ? `Finish in ~${Math.ceil(remainingCount / 1.5)} days` : "You're all caught up!";

  const handleContinue = () => navigate(`/lesson/${lastLessonId}`);

  // Use the custom hero image for C track, otherwise a high-end gradient
  const heroImage = selectedLanguageId === 'c' ? '/c_hero.png' : null;

  return (
    <div
      onClick={handleContinue}
      className="group relative bg-[#0f111a] border border-slate-800/50 p-8 md:p-14 rounded-[3rem] overflow-hidden transition-all duration-700 cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-indigo-500/50 hover:shadow-indigo-500/10 active:scale-[0.98]"
    >
      {/* Immersive Background Image/Art */}
      {heroImage ? (
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-110 transition-all duration-[2000ms] ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/80 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900/10 via-slate-900 to-[#0f111a] opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
      )}

      {/* Floating Particles/Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none z-0">
        <div className="absolute top-10 right-10 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-1000" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-purple-500/5 blur-[100px] rounded-full group-hover:bg-purple-500/10 transition-all duration-1000" />
      </div>

      <div className="relative z-10 space-y-12">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/10 group-hover:border-indigo-500/30 transition-all duration-500">
              <img src={currentLanguage.icon} alt={currentLanguage.name} className="w-8 h-8 object-contain" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80">Active Track</h2>
              <p className="text-sm font-bold text-white tracking-widest uppercase">{currentLanguage.name}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] group-hover:tracking-tight transition-all duration-700">
              {currentLesson?.title || 'Basic Syntax'}
            </h3>
            <div className="flex items-center gap-3 text-slate-400 font-medium">
              <Sparkles size={16} className="text-yellow-400 animate-pulse" />
              <span className="text-lg">Module {currentLesson?.moduleId || 'Intro'}: Foundations</span>
            </div>
          </div>
        </div>

        {/* Progress System */}
        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Progress to Mastery</p>
              <p className="text-2xl font-black text-white leading-none">
                {completedCount} <span className="text-slate-600 text-lg">/ {totalLessonsInLang} Lessons</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-indigo-400 text-sm font-black italic">{estimationText}</p>
            </div>
          </div>

          <div className="relative w-full h-4 bg-white/5 rounded-full overflow-hidden backdrop-blur-md border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-emerald-400 transition-all duration-[2000ms] cubic-bezier(0.19, 1, 0.22, 1)"
              style={{ width: `${Math.max(4, (completedCount / totalLessonsInLang) * 100)}%` }}
            >
              {/* Progress Sparkle */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/20 blur-md animate-pulse" />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <button
            className="group/btn relative px-12 py-6 bg-white text-slate-950 rounded-[1.5rem] font-black text-xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover/btn:opacity-10 transition-opacity" />
            <div className="relative flex items-center gap-3">
              Continue Learning
              <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
            </div>
          </button>
          <p className="text-slate-500 text-sm font-medium italic opacity-60 group-hover:opacity-100 transition-opacity duration-700 max-w-xs leading-relaxed">
            "Small daily wins lead to massive professional success. Let's get this module done."
          </p>
        </div>
      </div>
    </div>
  );
};

export default LearningProgressCard;
