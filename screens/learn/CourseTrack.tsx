import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Play, CheckCircle, Clock, Loader2, AlertCircle, Sparkles, ChevronDown, Trophy, Medal, Target, Award, BookOpen, Search, Activity, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurriculum } from '../../contexts/CurriculumContext';
import { LANGUAGES } from '../../constants';
import { Language, Lesson, Certificate } from '../../types';
import { usePractice } from '../../contexts/PracticeContext';
import { certificateService } from '../../services/certificateService';
import { CertificateModal } from '../../components/CertificateModal';
import { supabaseDB } from '../../services/supabaseService';

// Level descriptions - provide emotional context and guide
const LEVEL_DESCRIPTIONS: { [key: string]: string } = {
  // General / Legacy
  'Basics': 'Build confidence with core concepts',
  'Intermediates': 'Deepen your core knowledge',
  'Advanced': 'Explore complex professional patterns',
  'Real-world Projects': 'Apply what you\'ve learned to real apps',
  'Final Certification': 'The final milestone. Verify your mastery.',

  // JavaScript
  'JavaScript Basics': 'Enter the world of dynamic web logic',
  'Flow Control & Logic': 'Master decision making and loops in JS',
  'Functions & Scope': 'Write reusable, modular, and scoped code',
  'Data Structures (Arrays & Objects)': 'Organize complex data like a pro',
  'Asynchronous JavaScript': 'Master Promises, Async/Await and APIs',
  'Classes & Object-Oriented JS': 'Master blueprint-based programming and design',
  'Functional Programming & Advanced Patterns': 'Write cleaner, more predictable code',
  'Modules & Modern Tooling': 'Structure large-scale applications',
  'Final JS Certification': 'Verify your JavaScript mastery and claim your reward.',

  // Python
  'Python Foundations': 'Start your journey with the world\'s most popular language',
  'Control Flow': 'Master logic, loops, and conditional patterns',
  'Functions & Modules': 'Architect reusable and modular Python code',
  'Data Structures': 'Master lists, dictionaries, tuples, and sets',
  'File Handling & Exceptions': 'Read, write, and handle errors gracefully',
  'Object-Oriented Programming (OOP)': 'Master classes, inheritance, and encapsulation',
  'Advanced Python Features': 'Decorators, generators, and magic methods',
  'Web Scraping & APIs': 'Extract data from the web and connect to services',
  'Python Certification': 'Verify your Python expertise and claim your reward.',

  // Java
  'Java Basics (Zero Level)': 'Enter the world of enterprise development',
  'Data Types & Operators': 'Master the foundations of statically-typed code',
  'Control Flow Mastery': 'Build logic that handles complex scenarios',
  'Arrays & Strings': 'Deep dive into memory and text handling',
  'OOP Pillar 1 & 2 (Basics)': 'Think in objects and inheritance',
  'OOP Pillar 3 & 4 (Advanced)': 'Master abstraction and professional patterns',
  'Collections Framework': 'Handle complex data structures efficiently',
  'Modern Java & Concurrency': 'Master functional style and multithreading',
  'Final Java Certification': 'Prove your mastery and claim your reward.',

  // C++
  'C++ Foundations': 'Master the basics of high-performance coding',
  'Control Flow & Functions': 'Build efficient logic and modular systems',
  'Data Structures & Pointers': 'Master memory addresses and raw data access',
  'STL & Advanced C++': 'Master templates and the Standard Library',
  'Modern C++ & Smart Pointers': 'Master memory safety and RAII patterns',
  'Advanced Memory & Move Semantics': 'Zero-cost abstractions and extreme efficiency',
  'Concurrency & Multithreading': 'Build high-performance parallel systems',
  'Final C++ Certification': 'The ultimate systems programming milestone.',

  // DSA
  'Fundamentals & Complexity': 'Learn to analyze and optimize your code',
  'Linear Data Structures': 'Master arrays, lists, stacks, and queues',
  'Searching, Sorting & Hashing': 'Master the foundations of data retrieval',
  'Hierarchical Structures & Backtracking': 'Win at complex decision-making and trees',
  'Advanced Graphs & DP': 'Solve the world\'s toughest logic problems',
  'Advanced Graphs & Segment Trees': 'Master connectivity and range queries',
  'Greedy Algorithms & Bitwise': 'Exploit patterns for extreme efficiency',
  'Advanced Strings & Tries': 'Master pattern matching and dictionaries',
  'Final DSA Certification': 'The ultimate test of algorithmic mastery.',

  // HTML/CSS
  'Semantic HTML5': 'Build the skeleton of the web with modern standards',
  'CSS Foundations': 'Style your content with the Box Model and Selectors',
  'Layout Power (Flexbox)': 'Create flexible, alignment-aware layouts',
  'Modern Grid Layouts': 'Design complex 2D grids with ease',
  'Responsive Web Design': 'Make your websites look great on any device',
  'CSS Variables & Preprocessors': 'Write clean, maintainable, and reusable styles',
  'Animations & Effects': 'Bring your UI to life with transitions',
  'Accessibility & Forms': 'Create inclusive and functional web applications',
  'Final Web Mastery Exam': 'Prove your frontend design and structural skills.',

  // SQL
  'SQL Basics (CRUD)': 'Master the core commands of data manipulation',
  'Filtering & Sorting': 'Query only the data you actually need',
  'Aggregate Functions': 'Summarize and group your data like a pro',
  'Relational Joins': 'Combine multiple tables using keys',
  'Table Constraints & Design': 'Learn to structure your database correctly',
  'Subqueries & CTEs': 'Write advanced and nested logical queries',
  'Database Normalization': 'Optimize storage and reduce redundancy',
  'Transactions & Performance': 'Handle critical operations and scale',
  'Final Database Certification': 'Prove your SQL Grandmaster status.',

  // Fullstack
  'Modern Frontend (React)': 'Build dynamic user interfaces with components',
  'Backend Foundations (Node.js)': 'Build high-performance servers and APIs',
  'NoSQL Databases (MongoDB)': 'Store and manage data with flexibility',
  'Authentication & Security': 'Protect your users and their data like a pro',
  'RESTful API Architecture': 'Design industry-standard communication layers',
  'Advanced React & State': 'Manage global state and optimize performance',
  'Deployment & SaaS Patterns': 'Ship your app to production and scale',
  'WebSockets & Testing': 'Real-time communication and quality control',
  'Final Fullstack Graduation': 'Prove your ability to build complete products.',

  // C
  'Introduction': 'Begin your journey with the mother of all languages',
  'Flow Control': 'Master logic, loops, and decision making in C',
  'Functions': 'Write reusable, modular, and optimized C code',
  'Arrays': 'Organize and manipulate sequential data efficiently',
  'Pointers': 'Master direct memory access and pointer arithmetic',
  'Dynamic Memory Allocation': 'Allocate and manage heap memory at runtime',
  'Structures & Files': 'Master custom data types and permanent storage',
  'Advanced Concepts': 'Macros, Bitwise, and Command Line interaction',
};

const CourseTrack: React.FC = () => {
  const { langId } = useParams<{ langId: string }>();
  const { user, updateUser } = useAuth();
  const { data: curriculumData, loading, error, fetchLanguageCurriculum } = useCurriculum();
  const { getProblemStatus } = usePractice();
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

  // All levels are unlocked for all languages (including C)
  // To re-enable locking for C, restore the original completion check below
  const isLevelUnlocked = (_levelIndex: number): boolean => {
    return true;
  };

  const currentLevelIndex = useMemo(() => {
    if (!modules || modules.length === 0) return 0;
    for (let mIdx = 0; mIdx < modules.length; mIdx++) {
      const module = modules[mIdx];
      const lessons = module?.lessons || [];
      const problems = module?.problems || [];

      const hasIncompleteLesson = lessons.some((l: Lesson) => l && !completedLessonIds.includes(l.id));
      const hasIncompleteProblem = langId === 'c' && problems.some((p: any) => getProblemStatus(p.id) !== 'COMPLETED');

      if (hasIncompleteLesson || hasIncompleteProblem) return mIdx;
    }
    return 0;
  }, [modules, completedLessonIds, langId, getProblemStatus]);

  // 3. Effects
  useEffect(() => {
    if (langId) {
      fetchLanguageCurriculum(langId);

      // Tag OneSignal with the course they are currently studying
      try {
        const OneSignal = (window as any).OneSignal;
        if (OneSignal) {
          OneSignal.User.addTag("active_course", langId);
        }
      } catch (e) { }
    }
  }, [langId, user?._id, fetchLanguageCurriculum]);

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
    if (!user || !language || modules.length === 0) return;
    setIsClaiming(true);
    try {
      const courseId = language.id;
      const courseName = language.name + ' Programming';

      // Dynamically find the last lesson ID of the last module
      const lastModule = modules[modules.length - 1];
      const lessons = lastModule.lessons || [];
      const finalLessonId = lessons.length > 0 ? lessons[lessons.length - 1].id : '';

      const cert = await certificateService.generateCertificateForCourse(user._id, courseId, courseName, finalLessonId);
      if (cert) {
        setShowCertModal(true);
        // Tag OneSignal to trigger "Congratulations" automation
        try {
          const OneSignal = (window as any).OneSignal;
          if (OneSignal) {
            OneSignal.User.addTag("certificate_claimed", "true");
          }
        } catch (e) { }
      }
      else alert("Requirement not met. You must complete the final certification exam to claim your certificate.");
    } catch (e) {
      alert('Failed to generate certificate. Please try again later.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleLessonClick = (lesson: Lesson, levelIndex: number) => {
    if (!isLevelUnlocked(levelIndex)) return;
    navigate(`/lesson/${lesson.id}`);
  };

  // 5. Render States
  if (loading[langId || ''] && modules.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/10" />
          <Loader2 className="animate-spin text-blue-500/60" size={40} />
        </div>
      </div>
    );
  }

  if (!language || (error[langId || ''] && modules.length === 0)) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-slate-200 dark:text-white/10 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-widest text-[10px]">Track Not Found</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg mt-4 font-bold text-sm">Go Back</button>
      </div>
    );
  }

  const totalLessons = modules.reduce((sum: number, m: any) => sum + (m?.lessons?.length || 0), 0);
  const completedCount = completedLessonIds.filter((id: string) =>
    modules.some((m: any) => (m?.lessons || []).some((l: any) => l?.id === id))
  ).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="absolute top-0 left-1/2 w-[1200px] h-[800px] bg-blue-500/[0.02] blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] px-6 md:px-12 py-4">
        <div className="w-full flex items-center justify-between gap-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 p-1 flex items-center justify-center border border-slate-200 dark:border-white/[0.08]">
              <img src={language.icon} alt={language.name} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white shrink-0">{language.name} Track</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-white/[0.08] flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{progressPercent}%</span>
              <span className="text-[8px] text-slate-500 dark:text-slate-500 uppercase tracking-tighter">Done</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 py-10 md:py-12 max-w-5xl mx-auto pb-32 font-sans">
        {/* Progress Bar (Mobile) */}
        {progressPercent < 100 && (
          <div className="md:hidden mb-6">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              <span>Path Progress</span>
              <span className="text-blue-400">{progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-progress-gradient transition-all duration-1000" style={{ width: `${progressPercent}% ` }} />
            </div>
          </div>
        )}

        {/* Stages */}
        <div className="space-y-3">
          {modules.map((module, levelIndex) => {
            const lessons = module.lessons || [];
            const isExpanded = !!expandedLevels[levelIndex];
            const isCurrentLevel = levelIndex === currentLevelIndex;
            const isCompletedLevel = lessons.every((l: Lesson) => completedLessonIds.includes(l.id));
            const completedInLevel = lessons.filter((l: Lesson) => completedLessonIds.includes(l.id)).length;

            return (
              <section key={module.id} className="relative">
                <button
                  onClick={() => toggleLevel(levelIndex)}
                  className={`w-full group flex items-start justify-between gap-4 p-4 transition-all ${isCurrentLevel
                    ? 'card-active'
                    : isCompletedLevel ? 'card-success' : 'card-base'
                    }`}
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0 text-left">
                    <div className={`w-1 h-8 rounded-full shrink-0 ${isCurrentLevel ? 'bg-blue-500' : isCompletedLevel ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className={`text-base md:text-lg font-bold ${isCurrentLevel ? 'text-blue-500 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>{module.title}</h2>
                        {isCurrentLevel && <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Current</span>}
                        {isCompletedLevel && <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Done</span>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic mb-2">
                        {(() => {
                          const cleanedTitle = module.title.split(':').pop()?.trim() || module.title;
                          return LEVEL_DESCRIPTIONS[cleanedTitle] || `${lessons.length} lessons`;
                        })()}
                      </p>

                      {module.problems && module.problems.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5">
                            <Target size={10} className="text-blue-400" />
                            <span className="text-[9px] text-blue-400 font-bold uppercase tracking-tight">
                              {module.problems.filter((p: any) => getProblemStatus(p.id) === 'COMPLETED').length}/{module.problems.length} Assignments
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 mt-1">
                    {!isLevelUnlocked(levelIndex) && <Lock size={14} className="text-slate-600" />}
                    <span className="text-[10px] font-bold text-slate-500">{completedInLevel}/{lessons.length}</span>
                    <ChevronDown size={16} className={`text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-2 ml-4 pl-4 border-l border-white/5 space-y-1.5 py-2">
                    {lessons.map((lesson: any, lessonIndex: number) => {
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      const isFirstIncomplete = !isCompleted && lessonIndex === lessons.findIndex((l: any) => !completedLessonIds.includes(l.id));

                      return (
                        <button
                          key={lesson.id}
                          disabled={!isLevelUnlocked(levelIndex)}
                          onClick={() => handleLessonClick(lesson, levelIndex)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${isCompleted ? 'bg-emerald-500/5' :
                            isFirstIncomplete ? 'bg-blue-500/5 border border-blue-500/10' :
                              'hover:bg-white/5'
                            } ${!isLevelUnlocked(levelIndex) ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500/10 text-emerald-400' : isFirstIncomplete ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-slate-500'}`}>
                              {!isLevelUnlocked(levelIndex) ? <Lock size={16} /> : isCompleted ? <CheckCircle size={16} /> : <BookOpen size={16} />}
                            </div>
                            <div className="text-left min-w-0">
                              <p className={`text-sm font-bold truncate ${isCompleted ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{lesson.title}</p>
                            </div>
                          </div>
                          {isFirstIncomplete && isLevelUnlocked(levelIndex) && <Sparkles size={14} className="text-blue-400 shrink-0" />}
                        </button>
                      );
                    })}

                    {/* Level Assignments Phase */}
                    {module.problems && module.problems.length > 0 && (
                      <div className="mt-6 mb-4">
                        <div className="flex items-center gap-2 px-2 mb-4">
                          <Activity size={12} className="text-blue-500" />
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Lab Phase</span>
                          <div className="h-[1px] flex-1 bg-white/5" />
                        </div>

                        <div className="space-y-2">
                          {module.problems.map((prob: any) => {
                            const pStatus = getProblemStatus(prob.id);
                            const isCompleted = pStatus === 'COMPLETED';
                            const isUnlocked = levelIndex <= currentLevelIndex;

                            return (
                              <button
                                key={prob.id}
                                disabled={!isUnlocked}
                                onClick={() => navigate(`/practice/problem/${prob.id}`)}
                                className={`w-full group flex items-center justify-between p-3 transition-all ${isCompleted
                                  ? 'card-success'
                                  : isUnlocked
                                    ? 'card-base hover:card-active'
                                    : 'card-base opacity-40'
                                  }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isCompleted
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : isUnlocked
                                      ? 'bg-blue-600/10 text-blue-400'
                                      : 'bg-white/5 text-slate-700'
                                    }`}>
                                    {isCompleted ? <CheckCircle size={20} /> : isUnlocked ? <Target size={20} /> : <Lock size={20} />}
                                  </div>
                                  <div className="text-left overflow-hidden">
                                    <div className="flex items-center gap-2">
                                      <h4 className={`font-bold text-sm ${isUnlocked ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>{prob.title}</h4>
                                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${prob.difficulty === 'easy' ? 'text-emerald-600' :
                                        prob.difficulty === 'medium' ? 'text-amber-600' :
                                          'text-rose-600'
                                        }`}>lab</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Technical Assignment • Required</p>
                                  </div>
                                </div>
                                {isUnlocked && !isCompleted && (
                                  <ChevronRight size={16} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
