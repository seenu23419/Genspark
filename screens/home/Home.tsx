import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurriculum } from '../../contexts/useCurriculum';
// Unused imports removed
import { CURRICULUM, LANGUAGES } from '../../constants';
import { LayoutDashboard, Lock, CheckCircle2, Play, ChevronRight } from 'lucide-react';
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

                {/* 2. Quick Actions - Minimal, professional */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
                    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
                        <div className="text-sm text-slate-500 font-medium mb-1">Current Streak</div>
                        <div className="text-2xl font-bold text-white">7 days</div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
                        <div className="text-sm text-slate-500 font-medium mb-1">Lessons Completed</div>
                        <div className="text-2xl font-bold text-white">{modules.reduce((sum, m) => sum + m.lessons.filter((l: any) => completedLessonIds.includes(l.id)).length, 0)}</div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
                        <div className="text-sm text-slate-500 font-medium mb-1">Active Tracks</div>
                        <div className="text-2xl font-bold text-white">{(LANGUAGES as any).length}</div>
                    </div>
                </div>

                {/* 3. Hero: Continue Learning - Clean and focused */}
                <section className="mb-16">
                    <div className="relative overflow-hidden rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
                        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                                        {currentLesson?.title || 'Introduction to Programming'}
                                    </h2>
                                    <p className="text-slate-400 text-base leading-relaxed max-w-lg">
                                        Pick up exactly where you left off. Continue learning and build your skills.
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate(`/lesson/${currentLesson?.id || 'c1'}`)}
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
                                >
                                    <Play size={18} className="fill-current" />
                                    Resume Lesson
                                </button>
                            </div>

                            {/* Decorative minimal graphic */}
                            <div className="hidden md:flex items-center justify-center w-48 h-48 flex-shrink-0">
                                <div className="w-full h-full border border-slate-800 rounded-lg bg-slate-950/50 flex items-center justify-center">
                                    <LayoutDashboard size={56} className="text-slate-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Minimal Context Switcher */}
                <div className="mt-12 pt-8 border-t border-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex-shrink-0">
                            Switch Path:
                        </span>
                        {(LANGUAGES as any).map((lang: any) => (
                            <button
                                key={lang.id}
                                onClick={() => handlePathSelect(lang.id)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${selectedPathId === lang.id
                                    ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                                    }`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate('/learn')}
                        className="text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors flex-shrink-0"
                    >
                        Browse Curriculum →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
