import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurriculum } from '../../contexts/CurriculumContext';
import { CURRICULUM, LANGUAGES } from '../../constants';
import { Play, Settings, Flame, BookOpen, Code, Trophy, Zap, Brain, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const { user, loading, updateUser } = useAuth();
    const { data: curriculumData } = useCurriculum();
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
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full opacity-50" />
            </div>

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
                <section className="mb-10 p-6 bg-slate-200/30 dark:bg-slate-900/40 border-2 border-slate-300 dark:border-white/10 rounded-2xl relative overflow-hidden hover:border-indigo-500/30 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="flex items-center gap-2 mb-6">
                        <Zap size={18} className="text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Learning Path</h3>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {(LANGUAGES as any).map((lang: any) => (
                            <button
                                key={lang.id}
                                onClick={() => handlePathSelect(lang.id)}
                                className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 border-2 ${selectedPathId === lang.id
                                    ? 'bg-indigo-600 border-indigo-400 text-white scale-105'
                                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                                    }`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 3. PRIMARY ACTION CARD - Enhanced */}
                <section className="mb-6">
                    <div className={`relative overflow-hidden rounded-2xl border-2 backdrop-blur-xl transition-all duration-500 group ${isPathCompleted
                        ? 'bg-slate-50 dark:bg-emerald-950/20 border-emerald-300/50 dark:border-emerald-500/40 hover:border-emerald-500'
                        : 'bg-slate-50 dark:bg-indigo-950/20 border-indigo-300/50 dark:border-indigo-500/40 hover:border-indigo-500'
                        }`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="p-6 md:p-8">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className={`text-xs font-black uppercase tracking-wider mb-2 ${isPathCompleted ? 'text-emerald-600 dark:text-emerald-300' : 'text-indigo-600 dark:text-indigo-300'}`}>
                                        {isPathCompleted ? 'Path Mastered' : 'Continue Learning'}
                                    </p>
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                        {isPathCompleted ? `${currentPath?.name} Mastered! 🎉` : (currentLesson?.title || 'Introduction to C')}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {currentPath?.name} • {isPathCompleted ? `All ${totalLessons} Lessons Completed` : `Lesson ${completedCount + 1} of ${totalLessons}`}
                                    </p>
                                </div>
                                <div className="flex items-center justify-center relative w-16 h-16 md:w-20 md:h-20 shrink-0 ml-4">
                                    {/* Circular Progress */}
                                    {/* Circular Progress (Liquid Fill style: Bottom to Top) */}
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
                                        <defs>
                                            <linearGradient id="liquidFill" x1="0%" y1="100%" x2="0%" y2="0%">
                                                {/* Filled portion (fuchsia) */}
                                                <stop offset={`${totalLessons > 0 ? Math.min(100, Math.max(0, (completedCount / totalLessons) * 100)) : 0}%`} stopColor="#c026d3" />
                                                {/* Empty portion (transparent/bg) */}
                                                <stop offset={`${totalLessons > 0 ? Math.min(100, Math.max(0, (completedCount / totalLessons) * 100)) : 0}%`} stopColor="rgba(112, 26, 117, 0.2)" />
                                            </linearGradient>
                                        </defs>

                                        {/* Main Circle with Fill */}
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="16"
                                            fill={isPathCompleted ? '#10b981' : 'url(#liquidFill)'}
                                            stroke={isPathCompleted ? 'none' : 'rgba(112, 26, 117, 0.4)'}
                                            strokeWidth="1.5"
                                        />
                                    </svg>

                                    {/* Percentage Center */}
                                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${isPathCompleted ? 'text-emerald-900' : 'text-white'}`}>
                                        <span className="text-xs md:text-sm font-bold drop-shadow-md">
                                            {Math.round((completedCount / totalLessons) * 100) || 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => isPathCompleted ? navigate('/profile') : navigate(`/lesson/${currentLesson?.id || 'c1'}`)}
                                className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-200 shadow-lg ${isPathCompleted
                                    ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-500/20'
                                    : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-500/20'
                                    }`}
                            >
                                {isPathCompleted ? <Trophy size={18} /> : <Play size={18} className="fill-current" />}
                                {isPathCompleted ? 'View Performance' : 'Resume Lesson'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* 5. PROGRESS SNAPSHOT - Interactive */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={() => navigate('/profile/streaks')}
                        className="relative p-5 bg-slate-200/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-300 dark:border-indigo-500/20 rounded-xl hover:border-indigo-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] dark:hover:shadow-[0_0_30_rgba(99,102,241,0.3)] transition-all duration-500 group overflow-hidden text-left"
                    >
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 via-indigo-500 to-indigo-600 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="ml-3">
                                <div className="text-sm text-slate-600 dark:text-slate-400 font-bold mb-2 flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors">
                                    <Flame size={16} className="text-indigo-500 dark:text-indigo-400" />
                                    Current Streak
                                </div>
                                <div className="text-3xl font-black text-slate-900 dark:text-white transition-colors duration-300">{user?.streak || 0} days</div>
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/learn', { state: { initialFilter: 'completed' } })}
                        className="relative p-5 bg-slate-200/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-300 dark:border-rose-500/20 rounded-xl hover:border-rose-500 hover:shadow-[0_0_30px_rgba(244,63,94,0.05)] dark:hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-all duration-500 group overflow-hidden text-left"
                    >
                        <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 via-rose-500 to-rose-600 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.3)]"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="ml-3 flex-1">
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-2 flex items-center gap-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors">
                                    <BookOpen size={16} className="text-rose-500 dark:text-rose-400" />
                                    Lessons Completed
                                </div>
                                <div className="text-3xl font-black text-slate-900 dark:text-white mb-2 transition-colors duration-300">{completedCount} / {totalLessons}</div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-full h-1.5">
                                    <div className="bg-rose-500 h-1.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" style={{ width: `${totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/practice')}
                        className="relative p-5 bg-slate-200/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-300 dark:border-amber-500/20 rounded-xl hover:border-amber-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] dark:hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-500 group overflow-hidden text-left"
                    >
                        <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)]"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="ml-3 flex-1">
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-2 flex items-center gap-2 group-hover:text-amber-600 dark:group-hover:text-amber-200 transition-colors">
                                    <Code size={16} className="text-amber-500 dark:text-amber-400" />
                                    Practice Solved
                                </div>
                                <div className="text-3xl font-black text-slate-900 dark:text-white mb-2 transition-colors duration-300">0</div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-full h-1.5">
                                    <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" style={{ width: '0%' }}></div>
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
