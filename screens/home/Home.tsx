import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurriculum } from '../../contexts/useCurriculum';
import { CURRICULUM, LANGUAGES } from '../../constants';
import { Play, Settings, Flame, BookOpen, Code, Trophy, Zap, Brain, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const { user, loading } = useAuth();
    const { data: curriculumData } = useCurriculum();
    const navigate = useNavigate();

    // Track selected path locally
    const [selectedPathId, setSelectedPathId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (user && !selectedPathId) {
            setSelectedPathId(user.lastLanguageId || 'c');
        }
    }, [user, selectedPathId]);

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

    // Find current lesson
    const currentLesson = useMemo(() => {
        if (!user || !curriculumData) return null;
        const langId = user.lastLanguageId || 'c';
        const mods = (curriculumData[langId] || (CURRICULUM as any)[langId] || []);
        const allLessons = mods.flatMap((m: any) => m.lessons);
        const lastLessonId = user.lastLessonId || 'c1';
        return allLessons.find((l: any) => l.id === lastLessonId) || allLessons[0];
    }, [user, curriculumData]);

    // Calculate total lessons
    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedCount = modules.reduce((sum, m) => sum + m.lessons.filter((l: any) => completedLessonIds.includes(l.id)).length, 0);

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
                        Your learning journey continues today.
                    </p>
                    <p className="text-indigo-400 text-sm font-medium">
                        Your next task is ready.
                    </p>
                </div>

                {/* 3. PRIMARY ACTION CARD - Enhanced */}
                <section className="mb-6">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 backdrop-blur-sm hover:border-indigo-500/50 transition-all duration-300 shadow-xl shadow-indigo-500/10">
                        <div className="p-6 md:p-8">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Continue Learning</p>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                                        {currentLesson?.title || 'Introduction to C'}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {currentPath?.name || 'C Programming'} • Lesson {completedCount + 1} of {totalLessons}
                                    </p>
                                </div>
                                <div className="hidden md:flex items-center justify-center w-16 h-16 bg-indigo-500/20 rounded-xl">
                                    <BookOpen size={32} className="text-indigo-400" />
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/lesson/${currentLesson?.id || 'c1'}`)}
                                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-indigo-500/20"
                            >
                                <Play size={18} className="fill-current" />
                                Resume Lesson
                            </button>
                        </div>
                    </div>
                </section>

                {/* 4. TODAY'S FOCUS - NEW */}
                <section className="mb-8">
                    <div className="relative p-5 bg-slate-900/40 border border-slate-700/30 rounded-xl hover:bg-slate-900/60 transition-all duration-300">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Today's Focus</p>
                                <h4 className="text-xl font-bold text-white mb-2">
                                    {currentLesson?.title || 'Introduction to C'}
                                </h4>
                                <p className="text-sm text-slate-400">Beginner</p>
                            </div>
                            <button
                                onClick={() => navigate(`/lesson/${currentLesson?.id || 'c1'}`)}
                                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors"
                            >
                                Start Now
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

                {/* 7. LANGUAGE PATH INDICATOR - Improved */}
                <section className="mb-8">
                    <p className="text-sm text-slate-400 mb-3">
                        You are learning: <span className="text-white font-bold">{currentPath?.name || 'C Programming'}</span>
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {(LANGUAGES as any).map((lang: any) => (
                            <button
                                key={lang.id}
                                onClick={() => handlePathSelect(lang.id)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedPathId === lang.id
                                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/30'
                                    : 'bg-slate-800/30 text-slate-500 hover:text-slate-400 hover:bg-slate-800/50 opacity-60'
                                    }`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
