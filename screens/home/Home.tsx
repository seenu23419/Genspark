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
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 pb-24 font-sans selection:bg-blue-500/30 transition-colors duration-300">
            {/* Professional Global Header */}

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8">
                {/* 2. WELCOME SECTION - Improved */}
                <div className="mb-6">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        Welcome back, {user.firstName || 'Developer'}
                    </h2>
                    <p className="text-slate-500 text-base">
                        {isPathCompleted ? 'Congratulations! You have mastered this path.' : 'Your learning journey continues today.'}
                    </p>
                </div>

                {/* 7. LANGUAGE PATH INDICATOR - Premium Redesign */}
                <section className="mb-6 p-4 card-base relative overflow-hidden transition-all duration-500">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity size={18} className="text-blue-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">Learning Path</h3>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {(LANGUAGES as any).map((lang: any) => (
                            <button
                                key={lang.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePathSelect(lang.id);
                                }}
                                className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 border ${selectedPathId === lang.id
                                    ? 'bg-blue-600 border-blue-400 text-white card-active'
                                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
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
                            const target = e.target as HTMLElement;
                            if (target.closest('a') || target.closest('button')) return;
                            navigate(`/track/${selectedPathId}`);
                        }}
                        className={`card-base relative overflow-hidden group cursor-pointer ${isPathCompleted
                            ? 'card-success'
                            : 'card-active'
                            }`}>
                        <div className="p-4 md:p-6 relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isPathCompleted ? 'text-emerald-500' : 'text-blue-500'}`}>
                                        {isPathCompleted ? 'Path Mastered' : (completedCount === 0 ? 'Start Your Journey' : 'Continue Learning')}
                                    </p>
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                        {isPathCompleted ? `${currentPath?.name} Mastered!` : (currentLesson?.title || 'Introduction to C')}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {currentPath?.name} • {isPathCompleted ? `All ${totalLessons} Lessons Completed` : `Lesson ${completedCount + 1} of ${totalLessons}`}
                                    </p>
                                </div>
                                <div className="flex items-center justify-center relative w-24 h-24 md:w-28 md:h-28 shrink-0 ml-4 mt-2">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            className="text-slate-200 dark:text-white/5"
                                        />

                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke="url(#progressGradient)"
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                            strokeDasharray={`${283 * (completedCount / totalLessons)}, 283`}
                                            className="transition-all duration-1000 ease-out"
                                        />

                                        <defs>
                                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#22d3ee" />
                                            </linearGradient>
                                        </defs>
                                    </svg>

                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tighter">
                                            {Math.round((completedCount / totalLessons) * 100) || 0}
                                            <span className="text-xs ml-0.5 text-blue-400 font-bold">%</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={isPathCompleted ? '/profile/history' : `/lesson/${currentLesson?.id || modules[0]?.lessons[0]?.id || (selectedPathId + '1')}`}
                                onClick={(e) => e.stopPropagation()}
                                className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-200 relative z-20 ${isPathCompleted
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                                    }`}
                            >
                                {isPathCompleted ? <Trophy size={18} /> : <Play size={18} className="fill-current" />}
                                {isPathCompleted ? 'View Performance' : (completedCount === 0 ? 'Start Lesson' : 'Resume Lesson')}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 5. PROGRESS SNAPSHOT - Interactive */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                        onClick={() => navigate('/profile/streaks')}
                        className="card-base p-5 group text-left"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-2 transition-colors">
                                    <Flame size={14} className="text-blue-500" />
                                    Current Streak
                                </div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tighter">{user?.streak || 0} days</div>
                            </div>
                            <ChevronRight size={18} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/profile/history')}
                        className="card-base p-5 group text-left"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex-1">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-2 transition-colors">
                                    <Award size={14} className="text-blue-500" />
                                    Lessons Completed
                                </div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tighter mb-2">{completedCount} <span className="text-xs text-slate-500 font-normal">of {totalLessons}</span></div>
                                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1">
                                    <div className="bg-progress-gradient h-1 rounded-full transition-all duration-500" style={{ width: `${totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/practice/history')}
                        className="card-base p-5 group text-left"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex-1">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-2 transition-colors">
                                    <Terminal size={14} className="text-blue-500" />
                                    Practice Solved
                                </div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tighter mb-2">
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
                                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1">
                                    <div
                                        className="bg-progress-gradient h-1 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, (Object.values(progress || {}).filter(p => p && (p.status === 'completed' || p.status === 'COMPLETED')).length / 20) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </button>
                </div>


            </div>
        </div>
    );
};

export default Home;
