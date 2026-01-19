import React from 'react';
import { ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CURRICULUM, LANGUAGES } from '../../constants';

const LearningProgressCard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const lastLessonId = user.lastLessonId || 'c1';
  const lastLanguageId = user.lastLanguageId || 'c';
  const currentLanguage = (LANGUAGES as any).find((l: any) => l.id === lastLanguageId) || (LANGUAGES as any)[0];

  const modules = (CURRICULUM as any)[lastLanguageId] || [];
  let currentLesson: any = null;
  let lessonIndex = -1;
  let totalLessonsInLang = 0;

  modules.forEach((m: any) => {
    totalLessonsInLang += m.lessons.length;
    const foundIndex = m.lessons.findIndex((l: any) => l.id === lastLessonId);
    if (foundIndex >= 0) {
      currentLesson = m.lessons[foundIndex];
      lessonIndex = foundIndex;
    }
  });

  const completedCount = user.completedLessonIds?.filter((id: string) => {
    return modules.some((m: any) => m.lessons.some((l: any) => l.id === id));
  }).length || 0;

  const progressPercent = Math.round((completedCount / (totalLessonsInLang || 1)) * 100);

  // next 2 lessons (best-effort)
  const nextLessons: string[] = [];
  for (const m of modules) {
    const idx = m.lessons.findIndex((l: any) => l.id === lastLessonId);
    if (idx >= 0) {
      if (m.lessons[idx + 1]) nextLessons.push(m.lessons[idx + 1].title || m.lessons[idx + 1].id);
      if (m.lessons[idx + 2]) nextLessons.push(m.lessons[idx + 2].title || m.lessons[idx + 2].id);
      break;
    }
  }

  const handleContinue = () => navigate(`/lesson/${lastLessonId}`);

  return (
    <section className="group relative bg-slate-900 border-2 border-slate-800 p-2 sm:p-4 md:p-6 md:p-8 rounded-lg md:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-24 sm:w-32 md:w-48 h-24 sm:h-32 md:h-48 bg-indigo-600/5 rounded-full -mr-12 sm:-mr-16 md:-mr-24 -mt-12 sm:-mt-16 md:-mt-24 blur-3xl"></div>

      <div className="relative z-10 flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-2 sm:gap-3 md:gap-6">
        {/* Left side: Info and Button */}
        <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-4 flex-1 w-full">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
            <div className="w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 bg-slate-800 rounded-lg md:rounded-2xl flex items-center justify-center p-1.5 sm:p-2 md:p-3 border border-slate-700 flex-shrink-0">
              <img src={currentLanguage.icon} alt={currentLanguage.name} className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[10px] sm:text-xs md:text-sm font-black text-white leading-tight">Continue Learning</h3>
              <p className="text-[8px] sm:text-[10px] md:text-xs text-slate-400 mt-0.5 truncate">{currentLesson?.title || 'Current Topic'}</p>
              <div className="mt-0.5 sm:mt-1 text-[7px] sm:text-[9px] md:text-xs text-indigo-400 font-black flex items-center gap-0.5 sm:gap-1">
                <Clock size={8} className="sm:w-2 sm:h-2" /> <span className="truncate">Est. 15-30 mins</span>
              </div>
            </div>
          </div>

          <button onClick={handleContinue} type="button" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-white text-[9px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-0.5 sm:gap-1 md:gap-2 whitespace-nowrap">
            Continue <ArrowRight size={10} className="sm:w-3 sm:h-3 md:w-4 md:h-4" />
          </button>
        </div>

        {/* Right side: Circle Progress */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 md:w-24 md:h-24 relative flex-shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-slate-800" />
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray="264"
              strokeDashoffset={264 * (1 - progressPercent / 100)}
              className="text-indigo-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-black text-white text-[8px] sm:text-xs md:text-base md:text-lg">
            {progressPercent}%
          </div>
        </div>
      </div>

      {nextLessons.length > 0 && (
        <div className="mt-2 sm:mt-3 md:mt-4 text-xs text-slate-400 hidden md:block">
          <div className="font-bold text-slate-300 text-[11px] mb-2">Up Next</div>
          <ul className="list-disc list-inside space-y-1">
            {nextLessons.map((t, i) => (
              <li key={i} className="truncate text-[10px]">{t}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default LearningProgressCard;
