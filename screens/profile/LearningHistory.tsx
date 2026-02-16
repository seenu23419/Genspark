import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle,
    Clock,
    Trophy,
    ChevronRight,
    Calendar,
    Activity,
    Brain,
    AlertCircle,
    Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurriculum } from '../../contexts/CurriculumContext';
import { ActivityItem, Lesson } from '../../types';

const LearningHistory: React.FC = () => {
    const { user, loadActivityHistory } = useAuth();
    const { data: curriculumData, loading: curriculumLoading } = useCurriculum();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'completed' | 'pending'>('completed');

    // Trigger lazy-loading of detailed history if empty
    React.useEffect(() => {
        if (user && (!user.activity_history || user.activity_history.length === 0)) {
            loadActivityHistory();
        }
    }, [user, loadActivityHistory]);

    // 1. Process History Data
    const history = useMemo(() => {
        if (!user || !user.activity_history) return [];
        return user.activity_history.filter(item => item.type === 'lesson' || item.type === 'challenge');
    }, [user]);

    // Group history by itemId (lessonId) to get best/latest performance
    const lessonPerformance = useMemo(() => {
        const perf: Record<string, { latest: ActivityItem, attempts: number, bestScore?: number }> = {};
        history.forEach(item => {
            const id = item.itemId || item.title; // Fallback to title if itemId missing
            if (!perf[id]) {
                perf[id] = { latest: item, attempts: 1, bestScore: item.score };
            } else {
                perf[id].attempts += 1;
                if (new Date(item.date) > new Date(perf[id].latest.date)) {
                    perf[id].latest = item;
                }
                if (item.score !== undefined) {
                    perf[id].bestScore = Math.max(perf[id].bestScore || 0, item.score);
                }
            }
        });
        return perf;
    }, [history]);

    // 2. Get All Lessons from Curriculum
    const allLessons = useMemo(() => {
        if (!curriculumData) return [];
        const lessons: (Lesson & { langId: string, moduleTitle: string })[] = [];
        Object.entries(curriculumData).forEach(([langId, modules]) => {
            modules.forEach(module => {
                module.lessons.forEach(lesson => {
                    lessons.push({ ...lesson, langId, moduleTitle: module.title });
                });
            });
        });
        return lessons;
    }, [curriculumData]);

    const completedLessons = useMemo(() => {
        const completedIds = user?.completedLessonIds || [];
        return allLessons.filter(l => completedIds.includes(l.id));
    }, [allLessons, user?.completedLessonIds]);

    const pendingLessons = useMemo(() => {
        const completedIds = user?.completedLessonIds || [];
        const unlockedIds = user?.unlockedLessonIds || [];
        return allLessons.filter(l => !completedIds.includes(l.id) && unlockedIds.includes(l.id));
    }, [allLessons, user?.completedLessonIds, user?.unlockedLessonIds]);

    // 3. Stats
    const stats = useMemo(() => {
        const totalTime = history.reduce((sum, item) => sum + (item.timeSpent || 0), 0);
        const quizItems = history.filter(item => item.score !== undefined);
        const avgScore = quizItems.length > 0
            ? Math.round(quizItems.reduce((sum, item) => sum + (item.score || 0), 0) / quizItems.length)
            : 0;

        return {
            totalTime,
            avgScore,
            completedCount: completedLessons.length,
            totalCount: allLessons.length
        };
    }, [history, completedLessons, allLessons]);

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        if (mins < 60) return `${mins}m ${seconds % 60}s`;
        const hours = Math.floor(mins / 60);
        return `${hours}h ${mins % 60}m`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold">Learning Performance</h1>
                    <div className="w-8" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 pb-24">
                {/* 1. Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="flex items-center gap-2 text-indigo-500 mb-2">
                            <CheckCircle size={16} />
                            <span className="text-[10px] font-black uppercase tracking-wider">Completed</span>
                        </div>
                        <div className="text-2xl font-black">{stats.completedCount}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">out of {stats.totalCount}</div>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                            <Star size={16} />
                            <span className="text-[10px] font-black uppercase tracking-wider">Avg Score</span>
                        </div>
                        <div className="text-2xl font-black">{stats.avgScore}%</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Quiz Accuracy</div>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                            <Clock size={16} />
                            <span className="text-[10px] font-black uppercase tracking-wider">Study Time</span>
                        </div>
                        <div className="text-2xl font-black">{formatDuration(stats.totalTime)}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Total spent</div>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="flex items-center gap-2 text-rose-500 mb-2">
                            <Activity size={16} />
                            <span className="text-[10px] font-black uppercase tracking-wider">Attempts</span>
                        </div>
                        <div className="text-2xl font-black">{history.length}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Actions logged</div>
                    </div>
                </div>

                {/* 2. Tabs */}
                <div className="flex gap-2 mb-8 bg-slate-200/50 dark:bg-white/5 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${activeTab === 'completed' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Completed ({completedLessons.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Pending ({pendingLessons.length})
                    </button>
                </div>

                {/* 3. List Section */}
                {activeTab === 'completed' ? (
                    <div className="space-y-4">
                        {completedLessons.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                                <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-400">No completed lessons yet</h3>
                                <button
                                    onClick={() => navigate('/learn')}
                                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm"
                                >
                                    Start Learning
                                </button>
                            </div>
                        ) : (
                            completedLessons.map(lesson => {
                                const perf = lessonPerformance[lesson.id];
                                return (
                                    <div
                                        key={lesson.id}
                                        className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-indigo-500/50 transition-all cursor-pointer"
                                        onClick={() => navigate(`/lesson/${lesson.id}`)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{lesson.langId} • {lesson.moduleTitle}</span>
                                                </div>
                                                <h3 className="text-lg font-black group-hover:text-indigo-500 transition-colors">{lesson.title}</h3>

                                                <div className="flex flex-wrap items-center gap-4 mt-3">
                                                    <div className="flex items-center gap-1.5 text-slate-500">
                                                        <Calendar size={14} />
                                                        <span className="text-xs font-bold">{perf ? formatDate(perf.latest.date) : 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-500">
                                                        <Clock size={14} />
                                                        <span className="text-xs font-bold">{perf?.latest.timeSpent ? formatDuration(perf.latest.timeSpent) : 'N/A'}</span>
                                                    </div>
                                                    {lesson.quizQuestions && lesson.quizQuestions.length > 0 && (
                                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${perf?.bestScore !== undefined ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'}`}>
                                                            <Trophy size={12} />
                                                            <span className="text-[10px] font-black uppercase">
                                                                {perf?.bestScore !== undefined ? `Quiz: ${perf.bestScore}/${lesson.quizQuestions.length}` : 'Quiz Pending'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors mt-2" />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingLessons.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                                <Trophy size={48} className="mx-auto text-emerald-500/50 mb-4" />
                                <h3 className="text-lg font-bold text-slate-400">All unlocked lessons completed!</h3>
                                <p className="text-xs text-slate-500 mt-2">Check the curriculum to unlock more.</p>
                            </div>
                        ) : (
                            pendingLessons.map(lesson => (
                                <div
                                    key={lesson.id}
                                    className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-indigo-500/50 transition-all cursor-pointer"
                                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{lesson.langId} • {lesson.moduleTitle}</span>
                                            </div>
                                            <h3 className="text-lg font-black transition-colors">{lesson.title}</h3>
                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Brain size={14} />
                                                    <span className="text-xs font-bold capitalize">{lesson.difficultyLevel || 'Beginner'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <BookOpen size={14} />
                                                    <span className="text-xs font-bold">{lesson.quizQuestions?.length > 0 ? 'Quiz Included' : 'Reading Only'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <div className="px-4 py-2 bg-indigo-600 text-white text-xs font-black uppercase rounded-lg group-hover:scale-105 transition-all">Start Now</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LearningHistory;
