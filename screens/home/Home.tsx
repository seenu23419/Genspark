import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurriculum } from '../../contexts/CurriculumContext';
import { CURRICULUM, LANGUAGES } from '../../constants';
import { Play, Settings, Flame, BookOpen, Code, Trophy, Zap, Brain, Award, ChevronRight, Activity, Terminal } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { usePractice } from '../../contexts/PracticeContext';

const Home: React.FC = () => {
    const { user, loading, updateUser } = useAuth();
    const { data: curriculumData } = useCurriculum();
    const { progress } = usePractice();
    const navigate = useNavigate();

    // Track selected path locally
    const [selectedPathId, setSelectedPathId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (user && !selectedPathId) {
            setSelectedPathId(user.lastLanguageId || 'c');
        }
    }, [user, selectedPathId]);

    // ADMIN: Auto-complete C for seenu@gmail.com
    React.useEffect(() => {
        const adminComplete = async () => {
            if (!user || !curriculumData || user.email !== 'seenu@gmail.com') return;

            // Check if already completed to avoid infinite loop
            const cModules = curriculumData['c'] || (CURRICULUM as any)['c'] || [];
            const allCLessons = cModules.flatMap((m: any) => m.lessons.map((l: any) => l.id));

            const currentCCompleted = user.completedLessonIds?.filter(id => id.startsWith('c') && !id.startsWith('cpp')) || [];

            // Only run if we have lessons AND they aren't all marked as completed yet
            if (allCLessons.length > 0 && currentCCompleted.length < allCLessons.length && !localStorage.getItem('admin_c_completed_v3')) {
                console.log("🚀 Admin User Detected: Starting C Completion...");
                try {
                    console.log(`Marking ${allCLessons.length} lessons as complete...`);
                    await updateUser({
                        completedLessonIds: allCLessons,
                        lastLanguageId: 'c'
                    });

                    // Try to set flag, but don't fail if localStorage is blocked
                    try {
                        localStorage.setItem('admin_c_completed_v3', 'true');
                    } catch (e) {
                        console.warn("Could not save to localStorage, but DB is updated.");
                    }

                    alert("✅ ADMIN ACTION: C Language Course Marked as 100% Complete!");
                } catch (e) {
                    console.error("Admin completion failed", e);
                }
            }
        };
        adminComplete();
    }, [user?.email, user?.completedLessonIds?.length, curriculumData, updateUser]);

    const handlePathSelect = (pathId: string) => {
        setSelectedPathId(pathId);
        updateUser({ lastLanguageId: pathId }).catch(console.error);
    };

    // Derived Data
    const currentPath = useMemo(() => {
        if (!selectedPathId) return null;
        return (LANGUAGES as any).find((l: any) => l.id === selectedPathId) || (LANGUAGES as any)[0];
    }, [selectedPathId]);

    const modules = useMemo(() => {
        if (!currentPath) return [];
        return (curriculumData[currentPath.id] || (CURRICULUM as any)[currentPath.id] || []) as any[];
    }, [currentPath, curriculumData]);

    const completedLessonIds = user?.completedLessonIds || [];

    // Find current lesson (First UNCOMPLETED lesson in selected path)
    const currentLesson = useMemo(() => {
        if (!user || !curriculumData || !selectedPathId) return null;

        const mods = curriculumData[selectedPathId] || (CURRICULUM as any)[selectedPathId] || [];
        const allLessons = mods.flatMap((m: any) => m.lessons);

        // 1. Find the first lesson that has NOT been completed
        const firstUncompleted = allLessons.find((l: any) => !completedLessonIds.includes(l.id));

        if (firstUncompleted) return firstUncompleted;

        // 2. If all completed, return the last lesson as a fallback for the title/view
        // but we'll handle the "null/completed" state in the UI
        return allLessons[allLessons.length - 1] || null;
    }, [user, curriculumData, selectedPathId, completedLessonIds]);

    // Calculate total lessons
    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedCount = modules.reduce((sum, m) => sum + m.lessons.filter((l: any) => completedLessonIds.includes(l.id)).length, 0);
    const isPathCompleted = totalLessons > 0 && completedCount === totalLessons;

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-white pb-24 font-sans selection:bg-indigo-500/30 transition-colors duration-300">
            {/* Minimal background glow */}
            {/* DEBUG OVERLAY - Only visible in development if enabled or for specific users */}
            {user?.email === 'seenu@gmail.com' && (
                <div className="fixed top-20 right-4 z-[9999] bg-black/90 text-emerald-400 p-4 rounded-2xl border border-emerald-500/30 text-[10px] font-mono shadow-2xl backdrop-blur-md max-w-[200px]">
                    <div className="flex items-center gap-2 mb-2 border-b border-emerald-500/20 pb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="font-bold uppercase">System Debug</span>
                    </div>
                    <div className="space-y-1">
                        <p><span className="text-slate-500 text-[8px]">PATH:</span> {selectedPathId}</p>
                        <p><span className="text-slate-500 text-[8px]">LESSON:</span> {currentLesson?.id || 'NULL'}</p>
                        <p><span className="text-slate-500 text-[8px]">DONE:</span> {completedCount}/{totalLessons} ({Math.round(isPathCompleted ? 100 : (completedCount / totalLessons) * 100)}%)</p>
                        <p><span className="text-slate-500 text-[8px]">TARGET:</span> {isPathCompleted ? '/profile' : `/lesson/${currentLesson?.id || 'c1'}`}</p>
                    </div>
                </div>
            )}

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-6">

                {/* Date */}
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-6">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>

                {/* 2. WELCOME SECTION - Improved */}
                <div className="mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        Welcome back, {user.firstName || 'Developer'}
                    </h2>
                    <p className="text-slate-500 text-base mb-1">
                        {isPathCompleted ? 'Congratulations! You have mastered this path.' : 'Your learning journey continues today.'}
                    </p>
                    <p className="text-indigo-400 text-sm font-medium">
                        {isPathCompleted ? 'Claim your rewards in the Profile section.' : 'Your next task is ready.'}
                    </p>
                </div>

                {/* 7. LANGUAGE PATH INDICATOR - Premium Redesign */}
                <section className="mb-10 p-6 bg-slate-200/30 dark:bg-slate-900/60 border-[3px] border-slate-400 dark:border-white/40 dark:ring-1 dark:ring-white/5 rounded-2xl relative overflow-hidden hover:border-indigo-500/70 transition-all duration-500 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Zap size={18} className="text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Learning Path</h3>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {(LANGUAGES as any).map((lang: any) => (
                            <button
                                key={lang.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePathSelect(lang.id);
                                }}
                                className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 border-[3px] ${selectedPathId === lang.id
                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/50'
                                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-400 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-500 dark:hover:border-slate-500'
                                    }`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 3. PRIMARY ACTION CARD - Enhanced */}
                <section className="mb-6">
                    <div
                        onClick={(e) => {
                            // Robust check: don't navigate to track if a link or button was clicked inside the card
                            const target = e.target as HTMLElement;
                            if (target.closest('a') || target.closest('button')) return;

                            console.log("[NAV DEBUG] Card Background Clicked -> Navigating to track:", selectedPathId);
                            navigate(`/track/${selectedPathId}`);
                        }}
                        className={`relative overflow-hidden rounded-2xl border-[3px] backdrop-blur-xl transition-all duration-500 group cursor-pointer ${isPathCompleted
                            ? 'bg-slate-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-500/80 hover:border-emerald-500 shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-50 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-500/80 hover:border-indigo-500 shadow-lg shadow-indigo-500/30'
                            }`}>
                        <div className="p-6 md:p-8 relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className={`text-xs font-black uppercase tracking-wider mb-2 ${isPathCompleted ? 'text-emerald-600 dark:text-emerald-300' : 'text-indigo-600 dark:text-indigo-300'}`}>
                                        {isPathCompleted ? 'Path Mastered' : (completedCount === 0 ? 'Start Your Journey' : 'Continue Learning')}
                                    </p>
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                        {isPathCompleted ? `${currentPath?.name} Mastered! 🎉` : (currentLesson?.title || 'Introduction to C')}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {currentPath?.name} • {isPathCompleted ? `All ${totalLessons} Lessons Completed` : `Lesson ${completedCount + 1} of ${totalLessons}`}
                                    </p>
                                </div>
                                <div className="flex items-center justify-center relative w-24 h-24 md:w-28 md:h-28 shrink-0 ml-4 mt-6 group/progress">
                                    <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                                        {/* Outer Glow Background */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            className="text-slate-200 dark:text-white/5"
                                        />

                                        {/* Progress Ring */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke="url(#progressGradient)"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${283 * (completedCount / totalLessons)}, 283`}
                                            className="transition-all duration-1000 ease-out"
                                        />

                                        <defs>
                                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#4f46e5" /> {/* Indigo */}
                                                <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan */}
                                            </linearGradient>
                                        </defs>

                                        {/* Center Fill (Subtle) */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="35"
                                            className="fill-white/10 dark:fill-white/5"
                                        />
                                    </svg>

                                    {/* Percentage Center */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                                            {Math.round((completedCount / totalLessons) * 100) || 0}
                                            <span className="text-xs ml-0.5 text-indigo-500 font-bold">%</span>
                                        </span>
                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-indigo-400 transition-colors">Progress</span>
                                    </div>

                                    {/* Active Pulse (Only if in progress) */}
                                    {!isPathCompleted && completedCount > 0 && (
                                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping pointer-events-none" />
                                    )}
                                </div>
                            </div>

                            <Link
                                to={isPathCompleted ? '/profile/history' : `/lesson/${currentLesson?.id || modules[0]?.lessons[0]?.id || (selectedPathId + '1')}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(`[NAV DEBUG] Link Clicked. LessonID: ${currentLesson?.id}`);
                                }}
                                className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-200 shadow-lg relative z-20 ${isPathCompleted
                                    ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-500/20'
                                    : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-500/20'
                                    }`}
                            >
                                {isPathCompleted ? <Trophy size={18} /> : <Play size={18} className="fill-current" />}
                                {isPathCompleted ? 'View Performance' : (completedCount === 0 ? 'Start Lesson' : 'Resume Lesson')}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 5. PROGRESS SNAPSHOT - Interactive */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={() => navigate('/profile/streaks')}
                        className="relative p-5 bg-slate-200/40 dark:bg-slate-900/60 backdrop-blur-sm border-2 border-slate-400 dark:border-indigo-500/70 dark:ring-1 dark:ring-white/5 rounded-xl hover:border-indigo-500 transition-all duration-500 group overflow-hidden text-left shadow-sm"
                    >
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 via-indigo-500 to-indigo-600 rounded-full"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="ml-3">
                                <div className="text-sm text-slate-600 dark:text-slate-400 font-bold mb-2 flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors">
                                    <Activity size={16} className="text-indigo-500 dark:text-indigo-400" />
                                    Current Streak
                                </div>
                                <div className="text-3xl font-black text-slate-900 dark:text-white transition-colors duration-300">{user?.streak || 0} days</div>
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/profile/history')}
                        className="relative p-5 bg-slate-200/40 dark:bg-slate-900/60 backdrop-blur-sm border-2 border-slate-400 dark:border-rose-500/70 dark:ring-1 dark:ring-white/5 rounded-xl hover:border-rose-500 transition-all duration-500 group overflow-hidden text-left shadow-sm"
                    >
                        <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 via-rose-500 to-rose-600 rounded-full"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="ml-3 flex-1">
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-2 flex items-center gap-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors">
                                    <Award size={16} className="text-rose-500 dark:text-rose-400" />
                                    Lessons Completed
                                </div>
                                <div className="text-3xl font-black text-slate-900 dark:text-white mb-2 transition-colors duration-300">{completedCount} / {totalLessons}</div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-full h-1.5">
                                    <div className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/practice/history')}
                        className="relative p-5 bg-slate-200/40 dark:bg-slate-900/60 backdrop-blur-sm border-2 border-slate-400 dark:border-amber-500/70 dark:ring-1 dark:ring-white/5 rounded-xl hover:border-amber-500 transition-all duration-500 group overflow-hidden text-left shadow-sm"
                    >
                        <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-full"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="ml-3 flex-1">
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-2 flex items-center gap-2 group-hover:text-amber-600 dark:group-hover:text-amber-200 transition-colors">
                                    <Terminal size={16} className="text-amber-500 dark:text-amber-400" />
                                    Practice Solved
                                </div>
                                <div className="text-3xl font-black text-slate-900 dark:text-white mb-2 transition-colors duration-300">
                                    {Math.max(
                                        Object.values(progress || {}).filter(p => p && (p.status === 'completed' || p.status === 'COMPLETED')).length,
                                        (() => {
                                            try {
                                                const raw = localStorage.getItem('practice_progress_local');
                                                if (!raw) return 0;
                                                const parsed = JSON.parse(raw);
                                                return Object.values(parsed).filter((p: any) => p.status === 'completed' || p.status === 'COMPLETED').length;
                                            } catch (e) { return 0; }
                                        })()
                                    )}
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-full h-1.5">
                                    <div
                                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, (Object.values(progress || {}).filter(p => p && (p.status === 'completed' || p.status === 'COMPLETED')).length / 20) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
                        </div>
                    </button>
                </div>


            </div>
        </div>
    );
};

export default Home;
