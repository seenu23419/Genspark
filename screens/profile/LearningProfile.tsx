import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Trophy,
    Clock,
    Target,
    CheckCircle2,
    Lock,
    Scroll,
    ArrowLeft,
    ExternalLink,
    ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { supabaseDB } from '../../services/supabaseService';
import { LANGUAGES } from '../../constants';

// Lesson ID prefix mapping for each course
const LESSON_PREFIXES: Record<string, string> = {
    'c': 'c',
    'cpp': 'cpp',
    'python': 'py',
    'java': 'j',
    'javascript': 'js',
    'dsa': 'd',
    'sql': 'sql',
    'htmlcss': 'hc',
    'fullstack': 'fs'
};

// Achievement requirements per course (lessons needed to unlock)
const ACHIEVEMENT_REQUIREMENTS: Record<string, { lessons: number; problems: number }> = {
    'c': { lessons: 41, problems: 15 }, // Updated to match actual content
    'cpp': { lessons: 15, problems: 20 },
    'python': { lessons: 15, problems: 20 },
    'java': { lessons: 15, problems: 20 },
    'javascript': { lessons: 20, problems: 25 },
    'dsa': { lessons: 25, problems: 30 },
    'sql': { lessons: 10, problems: 15 },
    'htmlcss': { lessons: 10, problems: 10 },
    'fullstack': { lessons: 20, problems: 25 }
};

const LearningProfile: React.FC = () => {
    const { user, loadActivityHistory } = useAuth();
    const navigate = useNavigate();
    const [solvedProblemsCount, setSolvedProblemsCount] = useState(0);

    // Trigger lazy-loading of detailed history if empty
    useEffect(() => {
        if (user && (!user.activity_history || user.activity_history.length === 0)) {
            loadActivityHistory();
        }
    }, [user, loadActivityHistory]);

    // Dynamic Activity Data Calculation
    const [activityData, setActivityData] = useState<{ name: string; time: number }[]>([]);

    // 1. Deduplicate Activity History (Same title/type on same day counts as one)
    const uniqueHistory = React.useMemo(() => {
        if (!user?.activity_history) return [];
        return (user.activity_history as any[]).filter((item, index, self) =>
            index === self.findIndex((t) => (
                new Date(t.date).toDateString() === new Date(item.date).toDateString() &&
                t.type === item.type &&
                t.title === item.title
            ))
        );
    }, [user?.activity_history]);

    useEffect(() => {
        const calculateStats = () => {
            if (!user) return;

            // 1. Calculate Activity Chart Data (Last 7 days intensity)
            // Now we count ACTUAL items done, not just "active/inactive"
            const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            const last7Days = [];
            const today = new Date();

            // Map for quick lookup: dateStr -> count
            const activityMap = new Map<string, number>();
            uniqueHistory.forEach(item => {
                const dateStr = item.date.split('T')[0]; // ISO string YYYY-MM-DD
                activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
            });

            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                const count = activityMap.get(dateStr) || 0;
                // Base 5 "points" for just being active (from activity_log), plus detailed count * 15
                const logActive = (user.activity_log || []).includes(dateStr);
                const intensity = (count * 15) + (logActive && count === 0 ? 5 : 0);

                last7Days.push({
                    name: days[d.getDay()],
                    time: intensity // This is now a relative "score" for the chart height
                });
            }
            setActivityData(last7Days);
        };

        calculateStats();
    }, [user, uniqueHistory]);

    // Calculate Total Time (Memoized for render)
    const totalTimeHours = React.useMemo(() => {
        if (!uniqueHistory.length) return ((user?.lessonsCompleted || 0) * 15) / 60; // Fallback

        let minutes = 0;
        uniqueHistory.forEach(item => {
            if (item.type === 'lesson') minutes += 15; // 15m per lesson
            else if (item.type === 'practice') minutes += 10; // 10m per practice
            else if ((item.type as string) === 'quiz' || (item.type as string) === 'challenge') minutes += 5; // 5m per quiz
            else minutes += 5; // Default
        });

        return minutes / 60;
    }, [uniqueHistory, user?.lessonsCompleted]);

    useEffect(() => {
        const fetchPracticeStats = async () => {
            try {
                const progress = await supabaseDB.getAllPracticeProgress();
                const solved = progress.filter(p => p.status === 'completed').length;
                setSolvedProblemsCount(solved);
            } catch (err) {
                console.error("Failed to fetch practice stats", err);
            }
        };
        if (user) fetchPracticeStats();
    }, [user]);


    if (!user) return null;

    // Helper function to count completed lessons for a specific course
    const getCourseLessonsCompleted = (courseId: string): number => {
        const prefix = LESSON_PREFIXES[courseId];
        if (!prefix || !user.completedLessonIds) return 0;
        // DEDUPLICATE: Use Set to count unique lesson IDs only
        const uniqueIds = new Set(user.completedLessonIds);
        return Array.from(uniqueIds).filter(id => id.startsWith(prefix)).length;
    };

    const lessonsStarted = user.lessonsCompleted || 0;
    const activeDaysCount = user.activity_log?.length || 0;
    const estimatedTime = (lessonsStarted * 15 + solvedProblemsCount * 10) / 60; // Est 15m/lesson, 10m/problem

    const cReqs = ACHIEVEMENT_REQUIREMENTS['c'];
    const totalCReqs = cReqs.lessons + cReqs.problems;
    const currentCScore = (user.lessonsCompleted || 0) + solvedProblemsCount;
    const isCCertified = (user.lessonsCompleted || 0) >= cReqs.lessons && solvedProblemsCount >= cReqs.problems;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8 pb-32 animate-in fade-in duration-500 bg-slate-100 dark:bg-black min-h-screen transition-colors duration-300">

            {/* Header with Back Button */}
            <header className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Learning Profile</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your progress & achievements</p>
                </div>
            </header>

            {/* 1. Progress Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Lessons Started', value: lessonsStarted, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', important: false },
                    { label: 'Problems Solved', value: solvedProblemsCount, icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-500/10', important: true },
                    { label: 'Time Invested', value: `${totalTimeHours.toFixed(1)}h`, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10', important: false },
                ].map((stat, idx) => (
                    <div key={idx} className={`relative p-5 md:p-6 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-3 overflow-hidden ${stat.important
                        ? 'bg-white dark:bg-slate-900 border-indigo-500/30 shadow-xl shadow-indigo-500/10'
                        : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 shadow-sm'
                        }`}>
                        {stat.important && (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent pointer-events-none" />
                        )}
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} ${stat.important ? 'shadow-lg shadow-indigo-500/10' : ''}`}>
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Learning Activity */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight italic">
                                Learning Activity
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Last 7 days</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">Today</span>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData.length > 0 ? activityData : [{ name: 'M', time: 0 }, { name: 'T', time: 0 }, { name: 'W', time: 0 }, { name: 'T', time: 0 }, { name: 'F', time: 0 }, { name: 'S', time: 0 }, { name: 'S', time: 0 }]}>
                                <defs>
                                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: '900' }}
                                    dy={10}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#fff', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="time"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorTime)"
                                    name="ACTIVITY"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex justify-center">
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">Minutes Practiced</span>
                    </div>
                </div>

                {/* 3. Weekly Focus */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl h-full flex flex-col">
                        <div className="mb-6">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic flex items-center gap-2">
                                Weekly Focus
                            </h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Consistency Tracker</p>
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-8">
                            <div className="space-y-1">
                                <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {Math.floor(totalTimeHours)}h {Math.round((totalTimeHours % 1) * 60)}m
                                </div>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total time spent learning</div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Trophy size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Best Day</div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white uppercase transition-colors">Most active: {user.streak}-day streak</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 h-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityData.length > 0 ? activityData : [{ name: 'M', time: 0 }, { name: 'T', time: 0 }, { name: 'W', time: 0 }, { name: 'T', time: 0 }, { name: 'F', time: 0 }, { name: 'S', time: 0 }, { name: 'S', time: 0 }]}>
                                    <Bar dataKey="time" fill="#6366f1" radius={[4, 4, 4, 4]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>


            {/* 5. Achievements (Secondary) */}
            <section className="space-y-6 pb-20">
                <div className="px-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Achievements
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Dynamic Course Achievements */}
                    {Array.from(new Set(LANGUAGES.map(l => l.id)))
                        .map(id => LANGUAGES.find(l => l.id === id)!)
                        .map((lang) => {
                            const courseId = lang.id;
                            const courseName = lang.name;
                            const requirements = ACHIEVEMENT_REQUIREMENTS[courseId];

                            // Skip if no requirements defined for this course
                            if (!requirements) return null;

                            const courseLessons = getCourseLessonsCompleted(courseId);
                            const isCompleted = courseLessons >= requirements.lessons && solvedProblemsCount >= requirements.problems;

                            return isCompleted ? (
                                // Completed State
                                <div key={courseId} className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900 border border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between shadow-xl shadow-emerald-500/5">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase italic">{courseName}</h4>
                                            <div className="px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 inline-block">
                                                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Completed</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5">
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                                            GenSpark Status Unlocked! You've mastered the basics.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                // Locked State
                                <div key={courseId} className="bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 dark:border-white/5">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black text-slate-400 dark:text-slate-300 tracking-tight italic uppercase">{courseName}</h4>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status Locked</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5">
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                                            Complete {Math.max(0, requirements.lessons - courseLessons)} more lessons to unlock status.
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                    <div className="bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 dark:border-white/5">
                                <Trophy size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-black text-slate-400 dark:text-slate-300 tracking-tight italic uppercase">Streak Starter</h4>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Login 3 days in a row</p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">
                                <span>Current Streak</span>
                                <span>{user.streak}/3 Days</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, (user.streak / 3) * 100)}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 dark:border-white/5">
                                <Target size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-black text-slate-400 dark:text-slate-300 tracking-tight italic uppercase">Problem Solver</h4>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Solve 10 Problems</p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">
                                <span>Progress</span>
                                <span>{solvedProblemsCount}/10</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (solvedProblemsCount / 10) * 100)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LearningProfile;
