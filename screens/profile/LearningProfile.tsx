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
import { Certificate } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { certificateService } from '../../services/certificateService';
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
    const { user } = useAuth();
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [certificatesLoading, setCertificatesLoading] = useState(true);
    const [solvedProblemsCount, setSolvedProblemsCount] = useState(0);

    // Dynamic Activity Data Calculation
    const [activityData, setActivityData] = useState<{ name: string; time: number }[]>([]);

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
            (user.activity_history || []).forEach(item => {
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
    }, [user]);

    // Calculate Total Time (Memoized for render)
    const totalTimeHours = React.useMemo(() => {
        if (!user?.activity_history) return ((user?.lessonsCompleted || 0) * 15) / 60; // Fallback

        let minutes = 0;
        user.activity_history.forEach(item => {
            if (item.type === 'lesson') minutes += 15; // 15m per lesson
            else if (item.type === 'practice') minutes += 10; // 10m per practice
            else if ((item.type as string) === 'quiz' || (item.type as string) === 'challenge') minutes += 5; // 5m per quiz
            else minutes += 5; // Default
        });

        return minutes / 60;
    }, [user]);

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

    useEffect(() => {
        const fetchCertificates = async () => {
            if (user) {
                try {
                    const userCerts = await certificateService.getUserCertificates(user._id);
                    setCertificates(userCerts);
                } catch (error) {
                    console.error('Error fetching certificates:', error);
                } finally {
                    setCertificatesLoading(false);
                }
            }
        };

        fetchCertificates();
    }, [user]);

    if (!user) return null;

    // Helper function to count completed lessons for a specific course
    const getCourseLessonsCompleted = (courseId: string): number => {
        const prefix = LESSON_PREFIXES[courseId];
        if (!prefix || !user.completedLessonIds) return 0;
        return user.completedLessonIds.filter(id => id.startsWith(prefix)).length;
    };

    const lessonsStarted = user.lessonsCompleted || 0;
    const activeDaysCount = user.activity_log?.length || 0;
    const estimatedTime = (lessonsStarted * 15 + solvedProblemsCount * 10) / 60; // Est 15m/lesson, 10m/problem

    const cReqs = ACHIEVEMENT_REQUIREMENTS['c'];
    const totalCReqs = cReqs.lessons + cReqs.problems;
    const currentCScore = (user.lessonsCompleted || 0) + solvedProblemsCount;
    const isCCertified = (user.lessonsCompleted || 0) >= cReqs.lessons && solvedProblemsCount >= cReqs.problems;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500 bg-[#0a0b14] min-h-screen">

            {/* Header with Back Button */}
            <header className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Learning Profile</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your progress & achievements</p>
                </div>
            </header>

            {/* 1. Progress Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Lessons Started', value: lessonsStarted, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/5' },
                    { label: 'Problems Solved', value: solvedProblemsCount, icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10', important: true },
                    { label: 'Time Invested', value: `${totalTimeHours.toFixed(1)}h`, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
                ].map((stat, idx) => (
                    <div key={idx} className={`relative p-8 rounded-[2rem] border transition-all flex flex-col items-center justify-center text-center gap-4 overflow-hidden ${stat.important
                        ? 'bg-slate-900 border-indigo-500/30 shadow-2xl shadow-indigo-500/10'
                        : 'bg-slate-900/50 border-white/5'
                        }`}>
                        {stat.important && (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                        )}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} ${stat.important ? 'shadow-xl shadow-indigo-500/10' : ''}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-white tracking-tight">{stat.value}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Learning Activity */}
                <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight italic">
                                Learning Activity
                            </h3>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Last 7 days</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-xl border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Today</span>
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
                    <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl h-full flex flex-col">
                        <div className="mb-6">
                            <h4 className="text-sm font-black text-white uppercase tracking-tight italic flex items-center gap-2">
                                Weekly Focus
                            </h4>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Consistency Tracker</p>
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-8">
                            <div className="space-y-1">
                                <div className="text-4xl font-black text-white tracking-tight">
                                    {Math.floor(totalTimeHours)}h {Math.round((totalTimeHours % 1) * 60)}m
                                </div>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total time spent learning</div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Trophy size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Best Day</div>
                                    <div className="text-xs font-bold text-white uppercase">Most active: {user.streak}-day streak</div>
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

            {/* 4. Certificates Section */}
            <section className="space-y-4">
                <div className="px-2">
                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        Certificates
                    </h3>
                    <p className="text-xs font-medium text-slate-400">Proof of your learning progress</p>
                </div>

                {/* C Programming Certificate Card */}
                <div className={`relative border rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 transition-all ${isCCertified
                    ? 'bg-gradient-to-r from-slate-900 to-indigo-950/30 border-indigo-500/50 shadow-2xl shadow-indigo-500/5'
                    : 'bg-slate-900/50 border-white/5 opacity-90'
                    }`}>

                    {/* Icon Section - Ribbon Style */}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${isCCertified
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-800 text-slate-500'
                        }`}>
                        <Scroll size={32} strokeWidth={1.5} />
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div>
                            <h4 className={`text-lg font-bold tracking-tight ${isCCertified ? 'text-white' : 'text-slate-400'
                                }`}>
                                C Programming Fundamentals Certificate
                            </h4>
                            {!isCCertified && (
                                <p className="text-sm text-slate-500 font-medium italic mt-1">
                                    "Your first certificate proves real skill, not just activity."
                                </p>
                            )}
                        </div>

                        {isCCertified ? (
                            <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5">
                                    <CheckCircle2 size={12} /> Certified
                                </span>
                                <button
                                    onClick={() => navigate('/certificate/verify/GS-C-2026-DEMO')}
                                    className="px-6 py-2 bg-white text-slate-900 rounded-lg font-bold text-xs hover:bg-indigo-50 transition active:scale-95 shadow-lg border border-transparent"
                                >
                                    View Certificate
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 pt-2 w-full">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span>Progress to unlock</span>
                                    <span>{Math.round((currentCScore / totalCReqs) * 100)}%</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (currentCScore / totalCReqs) * 100)}%` }}
                                    />
                                </div>

                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-1">
                                    <div className={`flex items-center gap-1.5 ${(user.lessonsCompleted || 0) >= cReqs.lessons ? 'text-emerald-500' : ''}`}>
                                        {(user.lessonsCompleted || 0) >= cReqs.lessons ? <CheckCircle2 size={12} /> : <Lock size={12} />}
                                        <span>{user.lessonsCompleted || 0}/{cReqs.lessons} Lessons</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${solvedProblemsCount >= cReqs.problems ? 'text-emerald-500' : ''}`}>
                                        {solvedProblemsCount >= cReqs.problems ? <CheckCircle2 size={12} /> : <Lock size={12} />}
                                        <span>{solvedProblemsCount}/{cReqs.problems} Problems</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 5. Achievements (Secondary) */}
            <section className="space-y-6 pb-20">
                <div className="px-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Achievements
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Unlocked / Earned Certificates */}
                    {certificates.map((cert) => (
                        <div key={cert.id} className="group bg-slate-900/60 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-2">
                            <div className="p-8 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                        <CheckCircle2 size={28} />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ID: {cert.certificate_id.slice(0, 8)}</div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-xl font-black text-white tracking-tight">{cert.course_name} Program</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issued {new Date(cert.completion_date).toLocaleDateString()}</p>
                                </div>

                                <button
                                    onClick={() => navigate(`/certificate/verify/${cert.certificate_id}`)}
                                    className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-100 transition shadow-xl"
                                >
                                    View Certificate <ExternalLink size={12} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Dynamic Course Achievements */}
                    {LANGUAGES.map((lang) => {
                        const courseId = lang.id;
                        const courseName = lang.name;
                        const requirements = ACHIEVEMENT_REQUIREMENTS[courseId];

                        // Skip if no requirements defined for this course
                        if (!requirements) return null;

                        const courseLessons = getCourseLessonsCompleted(courseId);
                        const isCompleted = courseLessons >= requirements.lessons && solvedProblemsCount >= requirements.problems;
                        const hasCertificate = certificates.some(c => c.course_name === courseName);

                        // Don't show if already has certificate
                        if (hasCertificate) return null;

                        return isCompleted ? (
                            // Completed State
                            <div key={courseId} className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl shadow-emerald-500/5">
                                <div className="space-y-6">
                                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                        <CheckCircle2 size={28} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black text-white tracking-tight uppercase">{courseName}</h4>
                                        <div className="px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 inline-block">
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Completed</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                        You've mastered the basics! Go claim your certificate above.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            // Locked State
                            <div key={courseId} className="bg-slate-900/40 border border-dashed border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                                        <ShieldCheck size={28} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black text-slate-300 tracking-tight italic uppercase">{courseName}</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reward Locked</p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                        Complete {Math.max(0, requirements.lessons - courseLessons)} more lessons to unlock.
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    <div className="bg-slate-900/40 border border-dashed border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                                <Trophy size={28} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-black text-slate-300 tracking-tight italic uppercase">Streak Starter</h4>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Login 3 days in a row</p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                <span>Current Streak</span>
                                <span>{user.streak}/3 Days</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, (user.streak / 3) * 100)}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-dashed border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                                <Target size={28} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-black text-slate-300 tracking-tight italic uppercase">Problem Solver</h4>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Solve 10 Problems</p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                <span>Progress</span>
                                <span>{solvedProblemsCount}/10</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
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
