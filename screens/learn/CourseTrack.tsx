import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Play, CheckCircle, Clock, Loader2, AlertCircle, Sparkles, ChevronDown, Trophy, Medal, Target, Award, BookOpen, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurriculum } from '../../contexts/CurriculumContext';
import { LANGUAGES } from '../../constants';
import { Language, Lesson } from '../../types';
import { usePractice } from '../../contexts/PracticeContext';
import { supabaseDB } from '../../services/supabaseService';

// Level descriptions - provide emotional context and guide
const LEVEL_DESCRIPTIONS: { [key: string]: string } = {
  // General / Legacy
  'Basics': 'Build confidence with core concepts',
  'Intermediates': 'Deepen your core knowledge',
  'Advanced': 'Explore complex professional patterns',
  'Real-world Projects': 'Apply what you\'ve learned to real apps',
  'Final Assessment': 'The final milestone. Verify your mastery.',

  // JavaScript
  'JavaScript Basics': 'Enter the world of dynamic web logic',
  'Flow Control & Logic': 'Master decision making and loops in JS',
  'Functions & Scope': 'Write reusable, modular, and scoped code',
  'Data Structures (Arrays & Objects)': 'Organize complex data like a pro',
  'Asynchronous JavaScript': 'Master Promises, Async/Await and APIs',
  'Classes & Object-Oriented JS': 'Master blueprint-based programming and design',
  'Functional Programming & Advanced Patterns': 'Write cleaner, more predictable code',
  'Modules & Modern Tooling': 'Structure large-scale applications',
  'Final JS Assessment': 'Verify your JavaScript mastery.',

  // Python
  'Python Foundations': 'Start your journey with the world\'s most popular language',
  'Control Flow': 'Master logic, loops, and conditional patterns',
  'Functions & Modules': 'Architect reusable and modular Python code',
  'Data Structures': 'Master lists, dictionaries, tuples, and sets',
  'File Handling & Exceptions': 'Read, write, and handle errors gracefully',
  'Object-Oriented Programming (OOP)': 'Master classes, inheritance, and encapsulation',
  'Advanced Python Features': 'Decorators, generators, and magic methods',
  'Web Scraping & APIs': 'Extract data from the web and connect to services',
  'Python Mastery': 'Verify your Python expertise.',

  // Java
  'Java Basics (Zero Level)': 'Enter the world of enterprise development',
  'Data Types & Operators': 'Master the foundations of statically-typed code',
  'Control Flow Mastery': 'Build logic that handles complex scenarios',
  'Arrays & Strings': 'Deep dive into memory and text handling',
  'OOP Pillar 1 & 2 (Basics)': 'Think in objects and inheritance',
  'OOP Pillar 3 & 4 (Advanced)': 'Master abstraction and professional patterns',
  'Collections Framework': 'Handle complex data structures efficiently',
  'Modern Java & Concurrency': 'Master functional style and multithreading',
  'Final Java Assessment': 'Prove your mastery.',

  // C++
  'C++ Foundations': 'Master the basics of high-performance coding',
  'Control Flow & Functions': 'Build efficient logic and modular systems',
  'Data Structures & Pointers': 'Master memory addresses and raw data access',
  'STL & Advanced C++': 'Master templates and the Standard Library',
  'Modern C++ & Smart Pointers': 'Master memory safety and RAII patterns',
  'Advanced Memory & Move Semantics': 'Zero-cost abstractions and extreme efficiency',
  'Concurrency & Multithreading': 'Build high-performance parallel systems',
  'Final C++ Assessment': 'The ultimate systems programming milestone.',

  // DSA
  'Fundamentals & Complexity': 'Learn to analyze and optimize your code',
  'Linear Data Structures': 'Master arrays, lists, stacks, and queues',
  'Searching, Sorting & Hashing': 'Master the foundations of data retrieval',
  'Hierarchical Structures & Backtracking': 'Win at complex decision-making and trees',
  'Advanced Graphs & DP': 'Solve the world\'s toughest logic problems',
  'Advanced Graphs & Segment Trees': 'Master connectivity and range queries',
  'Greedy Algorithms & Bitwise': 'Exploit patterns for extreme efficiency',
  'Advanced Strings & Tries': 'Master pattern matching and dictionaries',
  'Final DSA Assessment': 'The ultimate test of algorithmic mastery.',

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
  'Final Database Assessment': 'Prove your SQL Grandmaster status.',

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

  // 2. Computed values
  const language = useMemo(() => LANGUAGES.find(l => l.id === langId), [langId]);
  const completedLessonIds = useMemo(() => user?.completedLessonIds || [], [user]);

  const modules = useMemo(() => {
    if (!language) return [];
    return (curriculumData[language.id] || []) as any[];
  }, [language, curriculumData]);

  // All levels are now unlocked for all languages, EXCEPT C which requires completion
  const isLevelUnlocked = (levelIndex: number): boolean => {
    if (langId !== 'c') return true;
    if (levelIndex === 0) return true;

    // Check if previous level is fully completed (lessons + problems)
    const prevModule = modules[levelIndex - 1];
    if (!prevModule) return true;

    const lessons = prevModule.lessons || [];
    const problems = prevModule.problems || [];

    const allLessonsDone = lessons.every((l: Lesson) => completedLessonIds.includes(l.id));
    const allProblemsDone = problems.every((p: any) => getProblemStatus(p.id) === 'COMPLETED');

    return allLessonsDone && allProblemsDone;
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


  const handleLessonClick = (lesson: Lesson, levelIndex: number) => {
    if (!isLevelUnlocked(levelIndex)) return;
    navigate(`/lesson/${lesson.id}`);
  };

  // 5. Render States
  if (loading[langId || ''] && modules.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-black flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10" />
          <Loader2 className="animate-spin text-indigo-500/60" size={40} />
        </div>
      </div>
    );
  }

  if (!language || (error[langId || ''] && modules.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-black flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <AlertCircle size={48} className="text-red-500/50 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-black uppercase tracking-widest text-[10px]">Track Not Found</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg mt-4 font-bold text-sm">Go Back</button>
      </div>
    );
  }

  const totalLessons = modules.reduce((sum: number, m: any) => sum + (m?.lessons?.length || 0), 0);
  const completedCount = completedLessonIds.filter((id: string) =>
    modules.some((m: any) => (m?.lessons || []).some((l: any) => l?.id === id))
  ).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-slate-100 dark:bg-black transition-colors duration-300">
      <div className="absolute top-0 left-1/2 w-[1200px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <header className="sticky top-0 z-40 bg-slate-100/95 dark:bg-black/95 backdrop-blur-sm border-b border-slate-300 dark:border-white/5 px-6 py-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/5 p-1 flex items-center justify-center">
              <img src={language.icon} alt={language.name} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white truncate">{language.name} Track</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center shadow-sm">
              <span className="text-sm font-black text-emerald-400">{progressPercent}%</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-tighter">Done</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 py-12 md:py-16 max-w-4xl mx-auto pb-32 font-sans">
        {/* Progress Bar (Mobile) */}
        {progressPercent < 100 && (
          <div className="md:hidden mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              <span>Overall Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {/* Stages */}
        <div className="space-y-4">
          {modules.map((module, levelIndex) => {
            const lessons = module.lessons || [];
            const isExpanded = !!expandedLevels[levelIndex];
            const isCertLevel = module.title.includes('Final Assessment') || module.title.includes('Mastery');
            const isCurrentLevel = levelIndex === currentLevelIndex;
            const isCompletedLevel = lessons.every((l: Lesson) => completedLessonIds.includes(l.id));
            const completedInLevel = lessons.filter((l: Lesson) => completedLessonIds.includes(l.id)).length;

            return (
              <section key={module.id} className="border-b border-slate-800/40 last:border-b-0 pb-6 last:pb-0">
                <button
                  onClick={() => toggleLevel(levelIndex)}
                  className={`w-full group flex items-start justify-between gap-4 p-5 rounded-xl transition-all ${isCurrentLevel
                    ? 'bg-indigo-600/15 border border-indigo-500/40'
                    : 'bg-slate-50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-900/60 shadow-sm'
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
                      {module.problems && module.problems.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1">
                            <Target size={10} className="text-indigo-400" />
                            <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-tight">
                              {module.problems.filter((p: any) => getProblemStatus(p.id) === 'COMPLETED').length}/{module.problems.length} Assignments
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 mt-1">
                    {!isLevelUnlocked(levelIndex) && <Lock size={16} className="text-slate-600" />}
                    <span className="text-xs font-bold text-slate-500">{completedInLevel}/{lessons.length}</span>
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
                          disabled={!isLevelUnlocked(levelIndex)}
                          onClick={() => handleLessonClick(lesson, levelIndex)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${isCompleted ? 'bg-emerald-500/10 border border-emerald-500/20' :
                            isFirstIncomplete ? 'bg-indigo-600/10 border border-indigo-500/30' :
                              'hover:bg-slate-800/30'
                            } ${!isLevelUnlocked(levelIndex) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500/10 text-emerald-400' : isFirstIncomplete ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500'}`}>
                              {!isLevelUnlocked(levelIndex) ? <Lock size={20} /> : isCompleted ? <CheckCircle size={20} /> : <BookOpen size={20} />}
                            </div>
                            <div className="text-left font-medium min-w-0">
                              <p className={`text-sm md:text-base truncate ${isCompleted ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{lesson.title}</p>
                            </div>
                          </div>
                          {isFirstIncomplete && isLevelUnlocked(levelIndex) && <Sparkles size={16} className="text-indigo-400 shrink-0" />}
                        </button>
                      );
                    })}

                    {/* Level Assignments Section */}
                    {module.problems && module.problems.length > 0 && (
                      <div className="mt-10 mb-6">
                        <div className="flex items-center gap-3 px-2 mb-6">
                          <div className="h-[1px] flex-1 bg-slate-800/60" />
                          <div className="flex items-center gap-2">
                            <Award size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Assignment Phase</span>
                          </div>
                          <div className="h-[1px] flex-1 bg-slate-800/60" />
                        </div>

                        <div className="space-y-3">
                          {module.problems.map((prob: any) => {
                            const pStatus = getProblemStatus(prob.id);
                            const isCompleted = pStatus === 'COMPLETED';
                            const isUnlocked = levelIndex <= currentLevelIndex;

                            return (
                              <button
                                key={prob.id}
                                disabled={!isUnlocked}
                                onClick={() => navigate(`/practice/problem/${prob.id}`)}
                                className={`w-full group flex items-center justify-between p-5 rounded-2xl transition-all border ${isCompleted
                                  ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
                                  : isUnlocked
                                    ? 'bg-indigo-600/5 border-indigo-500/20 hover:bg-indigo-600/10 hover:border-indigo-500/40'
                                    : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 opacity-50 grayscale shadow-none'
                                  }`}
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : isUnlocked
                                      ? 'bg-indigo-500/20 text-indigo-400'
                                      : 'bg-slate-800 text-slate-600'
                                    }`}>
                                    {isCompleted ? <CheckCircle size={24} /> : isUnlocked ? <Target size={24} /> : <Lock size={24} />}
                                  </div>
                                  <div className="text-left overflow-hidden">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className={`font-bold text-sm ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{prob.title}</h4>
                                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase ${prob.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-500' :
                                        prob.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                          'bg-rose-500/10 text-rose-500'
                                        }`}>{prob.difficulty}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium">Coding Assignment • Required to advance</p>
                                  </div>
                                </div>
                                {isUnlocked && !isCompleted && (
                                  <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                    Start Assignment <Play size={10} fill="currentColor" />
                                  </div>
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

        {/* Certificate Section */}
      </main>
    </div>
  );
};

export default CourseTrack;
