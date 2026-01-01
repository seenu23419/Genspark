
import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, Lock, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LANGUAGES, CURRICULUM } from '../../constants';
import { Language, Lesson } from '../../types';

interface LessonsListProps {
  language?: Language;
  unlockedLessonIds?: string[];
  completedLessonIds?: string[];
  onBack?: () => void;
  onSelectLesson?: (lesson: Lesson) => void;
}

const LessonsList: React.FC<LessonsListProps> = ({
  language: propLanguage,
  unlockedLessonIds: propUnlockedIds,
  completedLessonIds: propCompletedIds,
  onBack: propOnBack,
  onSelectLesson: propOnSelect
}) => {
  const { langId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const language = propLanguage || LANGUAGES.find(l => l.id === langId);
  const unlockedLessonIds = propUnlockedIds || user?.unlockedLessonIds || [];
  const completedLessonIds = propCompletedIds || user?.completedLessonIds || [];

  const modules = language ? (CURRICULUM[language.id] || []) : [];

  const handleBack = () => {
    if (propOnBack) propOnBack();
    else navigate('/learn');
  };

  const handleSelectLesson = (lesson: Lesson) => {
    if (propOnSelect) propOnSelect(lesson);
    else navigate(`/lesson/${lesson.id}`);
  };

  const isLevelUnlocked = useCallback((mIdx: number) => {
    if (mIdx === 0) return true;
    const prevModule = modules[mIdx - 1];
    if (!prevModule) return false;
    return prevModule.lessons.every(l => completedLessonIds.includes(l.id));
  }, [modules, completedLessonIds]);

  const isUnlocked = useCallback((lessonId: string, mIdx: number, lIdx: number) => {
    if (!isLevelUnlocked(mIdx)) return false;
    if (lIdx === 0) return true;

    // Within an unlocked level, lessons can be unlocked sequentially or all at once.
    // The requirement says "Only the next level is unlocked", so inside a level, let's keep it simple.
    return true;
  }, [isLevelUnlocked]);

  const isCompleted = (lessonId: string) => completedLessonIds.includes(lessonId);

  if (!language) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Language Not Found</h2>
        <button onClick={handleBack} className="text-indigo-400 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 p-2 px-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden md:block text-xs font-bold uppercase tracking-widest">Explore</span>
          </button>

          <div className="h-8 w-px bg-slate-800 hidden md:block mx-2"></div>

          <div className="flex items-center gap-3">
            <img src={language.icon} alt={language.name} className="w-8 h-8 object-contain" />
            <div>
              <h2 className="font-bold text-white text-lg">{language.name}</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Mastery Path</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <BookOpen size={16} className="text-indigo-400" />
          <span className="text-xs font-bold text-indigo-400">
            {Math.round((completedLessonIds.filter(id => modules.some(m => m.lessons.some(l => l.id === id))).length / (modules.reduce((acc, m) => acc + m.lessons.length, 0) || 1)) * 100)}% DONE
          </span>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-12 pb-24">
        {modules.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Lock size={48} className="mx-auto text-slate-800" />
            <h3 className="text-xl font-bold text-white">Curriculum Pending</h3>
            <p className="text-slate-500">Our tutors are finalizing this track.</p>
          </div>
        ) : (
          modules.map((module, mIdx) => (
            <section key={module.id} className="space-y-6">
              <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
                <h3 className="text-2xl font-black text-white tracking-tight">{module.title}</h3>
              </div>

              {/* Updated Grid: 4 columns on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {module.lessons.map((lesson, lIdx) => {
                  const levelUnlocked = isLevelUnlocked(mIdx);
                  const unlocked = isUnlocked(lesson.id, mIdx, lIdx);
                  const completed = isCompleted(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => levelUnlocked && handleSelectLesson(lesson)}
                      className={`group relative p-6 border rounded-[2rem] flex flex-col justify-between transition-all duration-300 ${levelUnlocked
                        ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 cursor-pointer shadow-xl'
                        : 'bg-slate-900/20 border-slate-800/30 cursor-not-allowed opacity-50 grayscale'
                        } ${completed ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}
                    >
                      <div className="space-y-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                          unlocked ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 text-slate-600'
                          }`}>
                          {completed ? <CheckCircle size={24} /> : unlocked ? <Play size={24} fill="currentColor" /> : <Lock size={20} />}
                        </div>

                        <div>
                          <h4 className={`font-black text-lg leading-tight transition-colors ${unlocked ? 'text-white' : 'text-slate-600'}`}>
                            {lesson.title.split('. ')[1] || lesson.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] flex items-center gap-1 text-slate-500 font-bold uppercase">
                              <Clock size={12} />
                              {lesson.duration}
                            </span>
                          </div>
                        </div>
                      </div>

                      {unlocked && !completed && (
                        <div className="mt-6 flex items-center text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                          Start Now <ChevronRight size={14} />
                        </div>
                      )}

                      {completed && (
                        <div className="mt-6 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          Completed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
};

export default LessonsList;
