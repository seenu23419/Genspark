import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurriculum } from '../../contexts/useCurriculum';
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

    if (loading || !user) return null;

    return (
        <div className="min-h-screen bg-[#0a0b14] text-white pb-24 font-sans selection:bg-indigo-500/30">
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
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                        Welcome back, {user.firstName || 'Developer'}
                    </h2>
                    <p className="text-slate-400 text-base mb-1">
                        {isPathCompleted ? 'Congratulations! You have mastered this path.' : 'Your learning journey continues today.'}
                    </p>
                    <p className="text-indigo-400 text-sm font-medium">
                        {isPathCompleted ? 'Claim your rewards in the Profile section.' : 'Your next task is ready.'}
                    </p>
                </div>

                {/* 7. LANGUAGE PATH INDICATOR - Premium Redesign */}
                <section className="mb-10 p-6 bg-slate-900/40 border border-slate-700/40 rounded-2xl shadow-xl shadow-indigo-500/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Zap size={18} className="text-indigo-400" />
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Learning Path</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest hidden md:block">Active Choice</span>
                            <span className="text-[10px] font-black text-white bg-indigo-600 px-4 py-1.5 rounded-xl border border-indigo-400/50 shadow-lg shadow-indigo-500/20 uppercase tracking-wider">
                                {currentPath?.name || 'C Programming'}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {(LANGUAGES as any).map((lang: any) => (
                            <button
                                key={lang.id}
                                onClick={() => handlePathSelect(lang.id)}
                                className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 border-2 ${selectedPathId === lang.id
                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-500/40 scale-105'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 hover:border-slate-500'
                                    }`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 3. PRIMARY ACTION CARD - Enhanced */}
                <section className="mb-6">
                    <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 shadow-xl shadow-indigo-500/10 ${isPathCompleted
                        ? 'bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-emerald-500/30 hover:border-emerald-500/50'
                        : 'bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/30 hover:border-indigo-500/50'
                        }`}>
                        <div className="p-6 md:p-8">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isPathCompleted ? 'text-emerald-300' : 'text-indigo-300'}`}>
                                        {isPathCompleted ? 'Path Mastered' : 'Continue Learning'}
                                    </p>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                                        {isPathCompleted ? `${currentPath?.name} Mastered! 🎉` : (currentLesson?.title || 'Introduction to C')}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {currentPath?.name} • {isPathCompleted ? `All ${totalLessons} Lessons Completed` : `Lesson ${completedCount + 1} of ${totalLessons}`}
                                    </p>
                                </div>
                                <div className={`hidden md:flex items-center justify-center w-16 h-16 rounded-xl ${isPathCompleted ? 'bg-emerald-500/20' : 'bg-indigo-500/20'}`}>
                                    {isPathCompleted ? <Trophy size={32} className="text-emerald-400" /> : <BookOpen size={32} className="text-indigo-400" />}
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
                        className="relative p-5 bg-slate-900/40 border border-slate-700/30 rounded-xl hover:bg-slate-900/60 transition-all duration-300 group overflow-hidden text-left"
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.7)]"></div>
                        <div className="flex items-center justify-between">
                            <div className="ml-3">
                                <div className="text-sm text-slate-300 font-medium mb-2 flex items-center gap-2">
                                    <Flame size={16} className="text-emerald-400" />
                                    Current Streak
                                </div>
                                <div className="text-3xl font-bold text-white">7 days</div>
                            </div>
                            <ChevronRight size={20} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/learn', { state: { initialFilter: 'completed' } })}
                        className="relative p-5 bg-slate-900/40 border border-slate-700/30 rounded-xl hover:bg-slate-900/60 transition-all duration-300 group overflow-hidden text-left"
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 via-rose-500 to-rose-600 rounded-full shadow-[0_0_20px_rgba(251,113,133,0.7)]"></div>
                        <div className="flex items-center justify-between">
                            <div className="ml-3 flex-1">
                                <div className="text-sm text-slate-300 font-medium mb-2 flex items-center gap-2">
                                    <BookOpen size={16} className="text-rose-400" />
                                    Lessons Completed
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">{completedCount} / {totalLessons}</div>
                                <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                                    <div className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(completedCount / totalLessons) * 100}%` }}></div>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/practice')}
                        className="relative p-5 bg-slate-900/40 border border-slate-700/30 rounded-xl hover:bg-slate-900/60 transition-all duration-300 group overflow-hidden text-left"
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.7)]"></div>
                        <div className="flex items-center justify-between">
                            <div className="ml-3 flex-1">
                                <div className="text-sm text-slate-300 font-medium mb-2 flex items-center gap-2">
                                    <Code size={16} className="text-amber-400" />
                                    Practice Solved
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">0</div>
                                <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                                    <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                    </button>
                </div>

                {/* 6. QUICK ACTIONS - NEW */}
                <section className="mb-10">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => navigate('/practice')}
                            className="flex-shrink-0 px-6 py-3 bg-slate-800/70 hover:bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                        >
                            <Zap size={16} className="text-yellow-400" />
                            Practice 1 Min
                        </button>
                        <button
                            onClick={() => navigate('/quiz')}
                            className="flex-shrink-0 px-6 py-3 bg-slate-800/70 hover:bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                        >
                            <Brain size={16} className="text-purple-400" />
                            Take Quiz
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex-shrink-0 px-6 py-3 bg-slate-800/70 hover:bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-semibold transition-all duration-200 flex items-center gap-2 opacity-50 cursor-not-allowed"
                            disabled
                        >
                            <Award size={16} className="text-blue-400" />
                            View Certificate 🔒
                        </button>
                        <button
                            onClick={() => navigate('/learn')}
                            className="flex-shrink-0 px-6 py-3 bg-slate-800/70 hover:bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                        >
                            <Trophy size={16} className="text-cyan-400" />
                            Switch Language
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
