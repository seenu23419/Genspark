import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Trophy,
    Clock,
    Target,
    CheckCircle2,
    ArrowLeft,
    ShieldCheck,
    Zap,
    Activity as ActivityIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { supabaseDB } from '../../services/supabaseService';
import { LANGUAGES } from '../../constants';

// Lesson ID prefix mapping
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

const ACHIEVEMENT_REQUIREMENTS: Record<string, { lessons: number; problems: number }> = {
    'c': { lessons: 41, problems: 15 },
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
    const [activityData, setActivityData] = useState<{ name: string; score: number }[]>([]);

    useEffect(() => {
        if (user && (!user.activity_history || user.activity_history.length === 0)) {
            loadActivityHistory();
        }
    }, [user, loadActivityHistory]);

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
            const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            const last7Days = [];
            const today = new Date();
            const activityMap = new Map<string, number>();

            uniqueHistory.forEach(item => {
                const dateStr = item.date.split('T')[0];
                activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
            });

            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const count = activityMap.get(dateStr) || 0;
                const logActive = (user.activity_log || []).includes(dateStr);
                const score = (count * 15) + (logActive && count === 0 ? 5 : 0);

                last7Days.push({
                    name: days[d.getDay()],
                    score
                });
            }
            setActivityData(last7Days);
        };
        calculateStats();
    }, [user, uniqueHistory]);

    const totalTimeHours = React.useMemo(() => {
        let minutes = 0;
        uniqueHistory.forEach(item => {
            if (item.type === 'lesson') minutes += 15;
            else if (item.type === 'practice') minutes += 10;
            else minutes += 5;
        });
        return Math.max(minutes / 60, ((user?.lessonsCompleted || 0) * 15) / 60);
    }, [uniqueHistory, user?.lessonsCompleted]);

    useEffect(() => {
        const fetchPracticeStats = async () => {
            try {
                const progress = await supabaseDB.getAllPracticeProgress();
                setSolvedProblemsCount(progress.filter(p => p.status === 'completed').length);
            } catch (err) { console.error(err); }
        };
        if (user) fetchPracticeStats();
    }, [user]);

    if (!user) return null;

    const getCourseLessonsCompleted = (courseId: string): number => {
        const prefix = LESSON_PREFIXES[courseId];
        if (!prefix || !user.completedLessonIds) return 0;
        return Array.from(new Set(user.completedLessonIds)).filter(id => id.startsWith(prefix)).length;
    };

    return (
        <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8 md:space-y-12 pb-24 min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
            {/* Header */}
            <header className="space-y-6 px-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 hover:text-indigo-500 transition-all active:scale-95"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 md:gap-3 uppercase italic">
                                <ActivityIcon className="text-indigo-500 w-7 h-7 md:w-8 md:h-8" />
                                Analytics
                            </h1>
                            <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl">Glinto performance intelligence.</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {[
                    { label: 'Blueprints Started', value: user.lessonsCompleted || 0, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Problems Solved', value: solvedProblemsCount, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Interface Time', value: `${totalTimeHours.toFixed(1)}h`, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-8 flex flex-col items-center text-center space-y-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">{stat.value}</div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-8 md:p-10 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Activity Log</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Last 7 Days</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/5">
                            <Zap size={14} className="text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest">{user.streak}D STREAK</span>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }}
                                    dy={15}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', padding: '12px' }}
                                    itemStyle={{ color: '#6366f1', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#chartGradient)"
                                    name="INTENSITY"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights */}
                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-8 md:p-10 flex flex-col justify-between relative">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Insights</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Weekly Overview</p>
                    </div>

                    <div className="my-8 space-y-6">
                        <div className="space-y-1">
                            <div className="text-4xl font-black text-indigo-500 tracking-tighter uppercase italic leading-none">
                                {Math.floor(totalTimeHours)}h
                            </div>
                            <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Total Focus Time</div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/5 group hover:border-indigo-500/20 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Hall of Fame</p>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Alpha Rank Achieved</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-20 w-full opacity-20">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData}>
                                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 4, 4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Hall of Mastery */}
            <section className="space-y-6">
                <div className="flex items-center gap-4 px-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Hall of <span className="text-indigo-500">Mastery</span></h2>
                    <div className="flex-1 h-[1px] bg-slate-200 dark:bg-white/5" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {LANGUAGES.map(lang => {
                        const reqs = ACHIEVEMENT_REQUIREMENTS[lang.id];
                        if (!reqs) return null;
                        const progress = getCourseLessonsCompleted(lang.id);
                        const isDone = progress >= reqs.lessons && solvedProblemsCount >= reqs.problems;

                        return (
                            <div key={lang.id} className={`p-6 rounded-2xl border transition-all duration-300 ${isDone ? 'bg-emerald-500/[0.03] border-emerald-500/20' : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5'
                                }`}>
                                <div className="flex flex-col h-full justify-between gap-6">
                                    <div className="space-y-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${isDone ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-400'
                                            }`}>
                                            {isDone ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className={`text-lg font-black uppercase italic tracking-tight ${isDone ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                {lang.name}
                                            </h4>
                                            <p className={`text-[8px] font-black uppercase tracking-widest ${isDone ? 'text-emerald-600/60' : 'text-slate-400'}`}>
                                                {isDone ? 'Certified Status' : 'Status: Restricted'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                                            {isDone ? 'Verified Glinto Master' : `Needs ${Math.max(0, reqs.lessons - progress)} modules.`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default LearningProfile;

