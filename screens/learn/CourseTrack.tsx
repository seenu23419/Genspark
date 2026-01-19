import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Play, CheckCircle, Clock, Loader2, AlertCircle, Sparkles, ChevronDown, Trophy, Medal, Target, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurriculum } from '../../contexts/useCurriculum';
import { LANGUAGES } from '../../constants';
import { Language, Lesson, Certificate } from '../../types';
import { certificateService } from '../../services/certificateService';
import { CertificateModal } from '../../components/CertificateModal';

// Level descriptions - provide emotional context and guide
const LEVEL_DESCRIPTIONS: { [key: string]: string } = {
  'Introduction': 'Master the fundamentals at your own pace',
  'Basics': 'Build confidence with core concepts',
  'Flow Control': 'Learn how to make decisions in code',
  'Control Flow': 'Learn how to make decisions in code',
  'Functions': 'Write reusable, modular code',
  'Data Structures': 'Organize data effectively',
  'Advanced Topics': 'Take your skills to the next level',
  'Intermediate': 'Deepen your understanding',
  'Advanced': 'Explore complex patterns',
  'Advanced Concepts': 'Master professional-grade techniques and best practices',
  'OOP': 'Think in objects and classes',
  'Real-world Projects': 'Apply what you\'ve learned',
  'Final Certification': 'The final milestone. Verify your mastery and claim your reward.',
};

const CourseTrack: React.FC = () => {
  const { langId } = useParams<{ langId: string }>();
  const { user } = useAuth();
  const { data: curriculumData, loading, error, fetchLanguageCurriculum } = useCurriculum();
  const navigate = useNavigate();

  // 1. State declarations
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({});
  const [showCertModal, setShowCertModal] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // 2. Computed values
  const language = useMemo(() => LANGUAGES.find(l => l.id === langId), [langId]);
  const completedLessonIds = useMemo(() => user?.completedLessonIds || [], [user]);

  const modules = useMemo(() => {
    if (!language) return [];
    return (curriculumData[language.id] || []) as any[];
  }, [language, curriculumData]);

  // All levels are now unlocked for all languages
  const isLevelUnlocked = (levelIndex: number): boolean => true;

  const currentLevelIndex = useMemo(() => {
    for (let mIdx = 0; mIdx < modules.length; mIdx++) {
      const module = modules[mIdx];
      const hasIncomplete = module.lessons.some((l: Lesson) => !completedLessonIds.includes(l.id));
      if (hasIncomplete) return mIdx;
    }
    return 0;
  }, [modules, completedLessonIds]);

  // 3. Effects
  useEffect(() => {
    if (langId) fetchLanguageCurriculum(langId);
  }, [langId, fetchLanguageCurriculum]);

  // Initialize expansion
  useEffect(() => {
    if (modules.length > 0 && Object.keys(expandedLevels).length === 0) {
      setExpandedLevels({ [currentLevelIndex]: true });
    }
  }, [modules.length, currentLevelIndex]);

  // 4. Action handlers
  const toggleLevel = (index: number) => {
    setExpandedLevels(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleClaimCertificate = async () => {
    if (!user || !language) return;
    setIsClaiming(true);
    try {
      const courseId = language.id;
      const courseName = language.name + ' Programming';
      const cert = await certificateService.generateCertificateForCourse(user._id, courseId, courseName, 'c41');
      if (cert) setShowCertModal(true);
      else alert("Requirement not met.");
    } catch (e) {
      alert('Failed to generate.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    navigate(`/lesson/${lesson.id}`);
  };

  // 5. Render States
  if (loading[langId || ''] && modules.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex flex-col items-center justify-center p-6">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10" />
          <Loader2 className="animate-spin text-indigo-500/60" size={40} />
        </div>
      </div>
    );
  }

  if (!language || (error[langId || ''] && modules.length === 0)) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-red-500/50 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2 font-black uppercase tracking-widest text-[10px]">Track Not Found</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg mt-4 font-bold text-sm">Go Back</button>
      </div>
    );
  }

  const totalLessons = modules.reduce((sum: number, m: any) => sum + m.lessons.length, 0);
  const completedCount = completedLessonIds.filter((id: string) =>
    modules.some((m: any) => m.lessons.some((l: any) => l.id === id))
  ).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-[#0a0b14] overflow-x-hidden">
      <div className="absolute top-0 left-1/2 w-[1200px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <header className="sticky top-0 z-40 bg-[#0a0b14]/95 backdrop-blur-sm border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-white/5 p-1 flex items-center justify-center">
              <img src={language.icon} alt={language.name} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-lg md:text-xl font-black text-white truncate">{language.name} Track</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-indigo-400">{progressPercent}%</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-tighter">Done</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 py-12 md:py-16 max-w-4xl mx-auto pb-32 font-sans">
        {/* Stages */}
        <div className="space-y-4">
          {modules.map((module, levelIndex) => {
            const lessons = module.lessons || [];
            const isExpanded = !!expandedLevels[levelIndex];
            const isCertLevel = module.title.includes('Final Certification');
            const isCurrentLevel = levelIndex === currentLevelIndex;
            const isCompletedLevel = lessons.every((l: Lesson) => completedLessonIds.includes(l.id));
            const completedInLevel = lessons.filter((l: Lesson) => completedLessonIds.includes(l.id)).length;

            return (
              <section key={module.id} className="border-b border-slate-800/40 last:border-b-0 pb-6 last:pb-0">
                <button
                  onClick={() => toggleLevel(levelIndex)}
                  className={`w-full group flex items-start justify-between gap-4 p-5 rounded-xl transition-all ${isCurrentLevel
                    ? 'bg-indigo-600/15 border border-indigo-500/40'
                    : 'bg-slate-900/40 border border-slate-800/50 hover:bg-slate-900/60'
                    }`}
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0 text-left">
                    <div className={`w-1.5 h-8 rounded-full shrink-0 ${isCurrentLevel ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : isCompletedLevel ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className={`text-lg md:text-xl font-bold ${isCurrentLevel ? 'text-white' : 'text-slate-200'}`}>{module.title}</h2>
                        {isCurrentLevel && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-black uppercase">Current</span>}
                        {isCompletedLevel && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black uppercase">Done</span>}
                      </div>
                      <p className="text-sm text-slate-400 font-medium">
                        {(() => {
                          const cleanedTitle = module.title.split(':').pop()?.trim() || module.title;
                          return LEVEL_DESCRIPTIONS[cleanedTitle] || `${lessons.length} lessons`;
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 mt-1">
                    <span className="text-xs font-bold text-slate-500">{completedInLevel}/{lessons.length}</span>
                    <ChevronDown size={20} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 pl-4 space-y-2">
                    {lessons.map((lesson: any, lessonIndex: number) => {
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      const isFirstIncomplete = !isCompleted && lessonIndex === lessons.findIndex((l: any) => !completedLessonIds.includes(l.id));

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${isFirstIncomplete ? 'bg-indigo-600/10 border border-indigo-500/30' : 'hover:bg-slate-800/30'
                            }`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500/10 text-emerald-400' : isFirstIncomplete ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                              {isCompleted ? <CheckCircle size={20} /> : <Play size={20} fill={isFirstIncomplete ? 'currentColor' : 'none'} />}
                            </div>
                            <div className="text-left font-medium min-w-0">
                              <p className={`text-sm md:text-base truncate ${isCompleted ? 'text-slate-400' : 'text-white'}`}>{lesson.title}</p>
                              <p className="text-xs text-slate-500">{lesson.duration || '15 mins'}</p>
                            </div>
                          </div>
                          {isFirstIncomplete && <Sparkles size={16} className="text-indigo-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>

      {user && language && <CertificateModal isOpen={showCertModal} onClose={() => setShowCertModal(false)} userId={user._id} courseId={language.id} courseName={language.name} />}
    </div>
  );
};

export default CourseTrack;
