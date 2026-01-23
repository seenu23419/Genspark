import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurriculum } from '../../contexts/useCurriculum';
// Unused imports removed
import { CURRICULUM, LANGUAGES } from '../../constants';
import { LayoutDashboard, Lock, CheckCircle2, Play, ChevronRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const { user, loading } = useAuth();
    const { data: curriculumData } = useCurriculum();
    const navigate = useNavigate();

    // -- State --
    // Track selected path locally to allow browsing different courses
    // Initialize with user's last language or default to first available
    const [selectedPathId, setSelectedPathId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (user && !selectedPathId) {
            setSelectedPathId(user.lastLanguageId || 'c');
        }
    }, [user, selectedPathId]);

    const handlePathSelect = (pathId: string) => {
        setSelectedPathId(pathId);
    };

    // -- Derived Data --
    const currentPath = useMemo(() => {
        if (!selectedPathId) return null;
        return (LANGUAGES as any).find((l: any) => l.id === selectedPathId) || (LANGUAGES as any)[0];
    }, [selectedPathId]);

    const modules = useMemo(() => {
        if (!currentPath) return [];
        return (curriculumData[currentPath.id] || (CURRICULUM as any)[currentPath.id] || []) as any[];
    }, [currentPath, curriculumData]);

    const completedLessonIds = user?.completedLessonIds || [];

    // Check if level is unlocked
    const isLevelUnlocked = (levelIndex: number): boolean => {
        if (levelIndex === 0) return true;
        // Simple logic: if previous level checks out, unlock current.
        // For a more robust app, might check all lessons in previous level.
        if (currentPath?.id === 'c') return true; // C is fully open in this demo phase
        const prevLevel = modules[levelIndex - 1];
        if (!prevLevel) return false;
        // Check if ANY lesson in previous level is done (lax rule) or ALL (strict)
        // Using strict rule:
        return prevLevel.lessons.every((l: any) => completedLessonIds.includes(l.id));
    };

    // Find current lesson for "Continue Learning"
    const currentLesson = useMemo(() => {
        if (!user || !curriculumData) return null;
        // Determine the relevant language for "Continue Learning"
        // Priority: selectedPathId if it matches user's active, otherwise user's last active
        const langId = user.lastLanguageId || 'c';

        const mods = (curriculumData[langId] || (CURRICULUM as any)[langId] || []);
        const allLessons = mods.flatMap((m: any) => m.lessons);

        const lastLessonId = user.lastLessonId || 'c1';
        // If last lesson is completed, try to find next. If not, return it.
        // For simplicity in this view, we just return the 'last visited' one or the first one.
        return allLessons.find((l: any) => l.id === lastLessonId) || allLessons[0];
    }, [user, curriculumData]);

    // Calculate progress for current path
    const progress = useMemo(() => {
        if (!modules.length) return 0;
        const allLessons = modules.flatMap((m: any) => m.lessons);
        const totalLessons = allLessons.length;
        if (totalLessons === 0) return 0;
        const completedCount = allLessons.filter((l: any) => completedLessonIds.includes(l.id)).length;
        return Math.round((completedCount / totalLessons) * 100);
    }, [modules, completedLessonIds]);


    if (loading || !user) return null;

    return (
        <div className="min-h-screen bg-[#0a0b14] text-white pb-24 font-sans selection:bg-indigo-500/30">
            {/* Minimal background glow */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full opacity-50" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10">

                {/* 1. Header - Professional and clean */}
                <header className="mb-14">

                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                        Welcome back, {user.firstName || 'Developer'}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Continue your learning journey and master new skills.
                    </p>
                </header>

                {/* 3. Hero: Continue Learning - Moved above stats as requested */}
                <section className="mb-12">
                    <div className="relative overflow-hidden rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
                        <div className="p-4 md:p-6 flex flex-row items-center justify-between gap-6">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                                        {currentLesson?.title || 'Introduction to Programming'}
                                    </h2>
                                    <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                                        Pick up exactly where you left off. Continue learning and build your skills.
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate(`/lesson/${currentLesson?.id || 'c1'}`)}
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
                                >
                                    <BookOpen size={16} />
                                    Resume Lesson
                                </button>
                            </div>

                            {/* Circular Progress System */}
                            <div className="flex items-center justify-center w-auto flex-shrink-0">
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    {/* Back Circle */}
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-slate-800"
                                        />
                                        {/* Progress Circle */}
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-indigo-500 transition-all duration-1000 ease-out"
                                            strokeDasharray={2 * Math.PI * 40}
                                            strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold text-white">{progress}%</span>
                                        <span className="text-[8px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">Done</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Quick Actions - Minimal, professional */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {/* Card 1: Streak */}
                    <div className="relative p-6 bg-[#151725] rounded-l-2xl rounded-r-md overflow-hidden group shadow-lg shadow-black/20">
                        {/* Rounded Left Accent Bar */}
                        <div className="absolute left-0 top-3 bottom-3 w-2 bg-pink-600 rounded-r-2xl shadow-[0_0_15px_rgba(219,39,119,0.6)]"></div>

                        <div className="pl-4">
                            <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">Current Streak</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">{user.streak || 1}</span>
                                <span className="text-lg text-slate-500 font-medium">days</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Lessons */}
                    <div className="relative p-6 bg-[#151725] rounded-l-2xl rounded-r-md overflow-hidden group shadow-lg shadow-black/20">
                        <div className="absolute left-0 top-3 bottom-3 w-2 bg-violet-600 rounded-r-2xl shadow-[0_0_15px_rgba(124,58,237,0.6)]"></div>

                        <div className="pl-4">
                            <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">Lessons Completed</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">{modules.reduce((sum, m) => sum + m.lessons.filter((l: any) => completedLessonIds.includes(l.id)).length, 0)}</span>
                                <span className="text-lg text-slate-500 font-medium">lessons</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Active Tracks */}
                    <div className="relative p-6 bg-[#151725] rounded-l-2xl rounded-r-md overflow-hidden group shadow-lg shadow-black/20">
                        <div className="absolute left-0 top-3 bottom-3 w-2 bg-orange-500 rounded-r-2xl shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>

                        <div className="pl-4">
                            <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">Active Tracks</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">
                                    {/* Calculate actually active tracks based on progress */}
                                    {(LANGUAGES as any).filter((l: any) =>
                                        modules.some((m: any) => m.lessons.some((lesson: any) => completedLessonIds.includes(lesson.id) && lesson.id.startsWith(l.id)))
                                        || l.id === user.lastLanguageId
                                        || l.id === 'c' // Always active for demo
                                    ).length}
                                </span>
                                <span className="text-lg text-slate-500 font-medium">languages</span>
                            </div>
                        </div>
                    </div>
                </div>




            </div>
        </div>
    );
};

export default Home;
