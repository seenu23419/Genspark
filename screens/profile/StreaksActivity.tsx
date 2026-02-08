import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, ChevronLeft, ChevronRight, Zap, CheckCircle2, Trophy, XCircle, Award, BarChart3, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurriculum } from '../../contexts/CurriculumContext';
import { CURRICULUM } from '../../constants';

const StreaksActivity: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: curriculumData } = useCurriculum();
    const [selectedDay, setSelectedDay] = useState<any>(null);

    // Initial join date
    const joinDate = useMemo(() => {
        return user?.createdAt ? new Date(user.createdAt) : new Date();
    }, [user?.createdAt]);

    // Current month being viewed
    const [viewDate, setViewDate] = useState<Date>(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const streakCount = user?.streak || 0;

    // --- GAMIFICATION HELPERS ---

    // 1. Calculate Longest Streak
    const longestStreak = useMemo(() => {
        if (!user?.activity_log || user.activity_log.length === 0) return 0;

        // Convert to timestamps and sort
        const sortedDates = user.activity_log
            .map(dateStr => new Date(dateStr).setHours(0, 0, 0, 0))
            .sort((a, b) => a - b);

        // Remove duplicates just in case
        const uniqueDates = [...new Set(sortedDates)];

        let maxStreak = 0;
        let currentStreak = 0;
        let prevDate = null;

        for (const date of uniqueDates) {
            if (prevDate) {
                const diffTime = Math.abs(date - prevDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            maxStreak = Math.max(maxStreak, currentStreak);
            prevDate = date;
        }

        // If current streak is higher (e.g. today is part of it), use that
        return Math.max(maxStreak, streakCount);
    }, [user?.activity_log, streakCount]);

    // 2. Milestone Calculation
    const nextMilestone = useMemo(() => {
        const milestones = [3, 7, 14, 30, 50, 75, 100, 200, 365];
        const next = milestones.find(m => m > streakCount) || milestones[milestones.length - 1];
        const prev = milestones.filter(m => m <= streakCount).pop() || 0;

        // Progress percentage calculation
        const total = next - prev;
        const current = streakCount - prev;
        const progress = Math.min(100, Math.max(0, (current / total) * 100));

        return { target: next, progress, prev };
    }, [streakCount]);

    // 3. Weekly Activity Data (Last 7 Days)
    const weeklyActivity = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = [];
        const logs = new Set(user?.activity_log || []);

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            days.push({
                day: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
                active: logs.has(dateStr),
                isToday: i === 0
            });
        }
        return days;
    }, [user?.activity_log]);


    // Navigation handlers
    const prevMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const jumpToToday = () => {
        const today = new Date();
        setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    };

    // Generate activity data for the selected month
    const calendarData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const join = new Date(joinDate);
        join.setHours(0, 0, 0, 0);

        const activeDates = new Set(user?.activity_log || []);

        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const days = [];

        for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
            const date = new Date(year, month, d);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            const isToday = date.getTime() === today.getTime();
            const isJoinDate = date.getTime() === join.getTime();
            const isBeforeJoin = date < join;
            const isFuture = date > today;

            days.push({
                date: new Date(date),
                isActive: activeDates.has(dateStr),
                isToday,
                isJoinDate,
                isBeforeJoin,
                isFuture,
                dayNum: d,
                dateStr
            });
        }

        return {
            monthName: viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            days
        };
    }, [user?.activity_log, viewDate, joinDate]);

    const daysPracticed = calendarData.days.filter(d => d.isActive).length;

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0b14] text-white p-4 md:p-6 max-w-xl mx-auto space-y-4 animate-in fade-in duration-500 pb-12">
            {/* Header - Compact */}
            <header className="flex items-center gap-3 mb-1">
                <button
                    onClick={() => navigate('/')}
                    className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h1 className="text-lg font-black text-white tracking-tight uppercase">History</h1>
                </div>
            </header>

            {/* 1. Milestone Progress Card */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 shadow-lg flex items-center justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="relative z-10 flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest flex items-center gap-1.5">
                            <Award size={12} /> Next Milestone
                        </span>
                        <span className="text-[10px] font-black text-white bg-white/20 px-2 py-0.5 rounded-full">
                            {nextMilestone.target} DAYS
                        </span>
                    </div>
                    <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
                            style={{ width: `${nextMilestone.progress}%` }}
                        />
                    </div>
                    <p className="text-[9px] font-medium text-indigo-200 mt-2">
                        {streakCount >= nextMilestone.target
                            ? "Milestone Unlocked! 🎉"
                            : `${nextMilestone.target - streakCount} days to go! Keep it up.`}
                    </p>
                </div>
                <div className="relative z-10 ml-6 shrink-0">
                    <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/10 shadow-inner">
                        <Trophy size={20} className="text-yellow-300 drop-shadow-md" />
                    </div>
                </div>
            </section>

            {/* 2. Dashboard Stats Row - Mini */}
            <div className="grid grid-cols-2 gap-3 mb-2">
                <section className="relative overflow-hidden rounded-xl bg-slate-900/60 border border-indigo-500/20 p-3 flex items-center gap-3 shadow-lg">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0">
                        <Flame size={20} className={streakCount > 0 ? "animate-pulse" : "opacity-30"} />
                    </div>
                    <div>
                        <div className="text-xl font-black text-white leading-none mb-0.5">
                            {streakCount}
                        </div>
                        <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Current</p>
                    </div>
                </section>

                <section className="relative overflow-hidden rounded-xl bg-slate-900/60 border border-amber-500/20 p-3 flex items-center gap-3 shadow-lg">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 shrink-0">
                        <Trophy size={20} className="opacity-80" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-white leading-none mb-0.5">
                            {longestStreak}
                        </div>
                        <p className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Best Ever</p>
                    </div>
                </section>
            </div>

            {/* 3. Weekly Activity Chart */}
            <section className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={14} className="text-slate-400" />
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">Last 7 Days</h3>
                </div>
                <div className="flex items-end justify-between h-16 gap-2">
                    {weeklyActivity.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                            <div className={`w-full rounded-t-sm transition-all duration-500 ${day.active
                                ? 'bg-indigo-500 h-full shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                                : 'bg-slate-800 h-1/6 hover:bg-slate-700'}`}
                            />
                            <span className={`text-[8px] font-bold uppercase ${day.isToday ? 'text-indigo-400' : 'text-slate-600'}`}>
                                {day.day}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Interactive Calendar - Ultra-Compact Version */}
            <section className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider italic">
                        {calendarData.monthName}
                    </h3>

                    <div className="flex items-center gap-1.5 bg-slate-950/50 p-0.5 rounded-lg border border-slate-800">
                        <button onClick={prevMonth} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft size={14} />
                        </button>
                        <button onClick={jumpToToday} className="px-2 py-1 text-[8px] font-black uppercase text-slate-500 hover:text-white transition-colors">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 w-fit mx-auto">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-[8px] font-black text-slate-600 uppercase">
                            {d}
                        </div>
                    ))}

                    {Array.from({ length: (new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()) }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-8 h-8 md:w-10 md:h-10" />
                    ))}

                    {calendarData.days.map((day, idx) => {
                        const baseClasses = "relative w-8 h-8 md:w-10 md:h-10 rounded-lg transition-all flex items-center justify-center border text-[10px] md:text-xs font-black";
                        const isFutureClasses = day.isFuture ? "cursor-default border-transparent opacity-10" : "active:scale-90 cursor-pointer";

                        let stateClasses = "bg-slate-800/20 text-slate-500 border-slate-800/50 hover:bg-slate-700/30 hover:text-white";
                        if (day.isActive) stateClasses = "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border-indigo-400/50 scale-105 z-10";
                        else if (day.isJoinDate) stateClasses = "bg-indigo-500/10 text-indigo-400 border-indigo-500/40";
                        else if (day.isBeforeJoin) stateClasses = "bg-transparent text-slate-800 border-transparent opacity-10 pointer-events-none";
                        else if (day.isToday) stateClasses = "bg-slate-800 border-indigo-500/50 text-white ring-1 ring-indigo-500/30";

                        return (
                            <button
                                key={idx}
                                onClick={() => !day.isFuture && setSelectedDay(day)}
                                disabled={day.isFuture || day.isBeforeJoin}
                                className={`${baseClasses} ${isFutureClasses} ${stateClasses}`}
                            >
                                <span>{day.dayNum}</span>
                                {day.isActive && (
                                    <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-emerald-400 rounded-full border border-slate-900" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Selected Day Info Card */}
            {selectedDay && (
                <div className="p-4 bg-slate-900/90 border border-indigo-500/20 rounded-2xl shadow-xl animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedDay.isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-700'}`}>
                                {selectedDay.isActive ? <CheckCircle2 size={20} /> : (selectedDay.isJoinDate ? <Trophy size={20} /> : <Zap size={20} />)}
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase">
                                    {selectedDay.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </h4>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                    {selectedDay.isActive ? 'Active' : 'No Activity'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedDay(null)} className="p-1 hover:bg-slate-800 rounded-lg">
                            <XCircle size={16} className="text-slate-600" />
                        </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                        {(() => {
                            const dateStr = selectedDay.dateStr;
                            // DEDUPLICATE: Prevent same activity (type+title) from being visible even if DB has duplicates
                            const historyItems = (user.activity_history || [])
                                .filter(item =>
                                    // Check against both ISO string match and date string match for robustness
                                    item.date.startsWith(dateStr) ||
                                    new Date(item.date).toDateString() === selectedDay.date.toDateString()
                                )
                                .filter((item, index, self) =>
                                    index === self.findIndex((t) => (
                                        t.type === item.type && t.title === item.title
                                    ))
                                );

                            if (historyItems.length > 0) {
                                return (
                                    <div className="space-y-2">
                                        <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Activities</h5>
                                        {historyItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-slate-800/40 p-2 rounded-lg border border-white/5">
                                                <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                                    {item.type === 'lesson' ? <BookOpen size={12} /> :
                                                        item.type === 'practice' ? <Zap size={12} /> :
                                                            <Trophy size={12} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-200 truncate">{item.title}</p>

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }

                            return selectedDay.isActive ? (
                                <p className="text-xs text-slate-300 leading-relaxed italic">
                                    Consistency is key! You were active on this day. Use the app more to see detailed logs!
                                </p>
                            ) : (
                                <p className="text-xs text-slate-500 leading-relaxed italic">
                                    {selectedDay.isBeforeJoin
                                        ? "This was before you joined our elite squad."
                                        : "No activity recorded on this day."}
                                </p>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StreaksActivity;
