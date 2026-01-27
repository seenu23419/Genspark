import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Calendar, CheckCircle2, XCircle, Zap, Play, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurriculum } from '../../contexts/useCurriculum';
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
        const d = new Date(joinDate);
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });

    const streakCount = user?.streak || 0;

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

        // Add leading empty boxes for calendar alignment (optional, but keep simple grid for now)
        // User asked for "month-wise", usually meaning a grid. 
        // We'll show all days of the month.

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

    // Find current lesson
    const currentLesson = useMemo(() => {
        if (!user || !curriculumData) return null;
        const langId = user.lastLanguageId || 'c';
        const mods = (curriculumData[langId] || (CURRICULUM as any)[langId] || []);
        const allLessons = mods.flatMap((m: any) => m.lessons);
        const lastLessonId = user.lastLessonId || 'c1';
        return allLessons.find((l: any) => l.id === lastLessonId) || allLessons[0];
    }, [user, curriculumData]);

    const daysPracticed = calendarData.days.filter(d => d.isActive).length;
    const isNewUser = (user?.activity_log || []).length === 0;

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0b14] text-white p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
            {/* Header */}
            <header className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight italic uppercase">Learning History</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Journey Since {joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                </div>
            </header>

            {/* 1. Main Streak Card */}
            <section className="relative overflow-hidden rounded-[3rem] bg-slate-900 border border-indigo-500/20 shadow-2xl p-10 md:p-14 text-center flex flex-col items-center">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
                <div className="relative mb-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-[0_0_60px_rgba(99,102,241,0.2)] border border-indigo-500/20">
                        <Flame size={60} className={streakCount > 0 ? "animate-pulse" : "opacity-30"} />
                    </div>
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-white mb-2 tracking-tighter">
                    {streakCount} <span className="text-xl md:text-2xl text-slate-500 italic lowercase">{streakCount === 1 ? 'day' : 'days'}</span>
                </h2>
                <p className="text-slate-400 text-sm font-medium max-w-xs mb-8">
                    {streakCount > 0 ? "You're building a massive momentum. Keep it up!" : "Start your learning journey today to begin your streak!"}
                </p>
                <button
                    onClick={() => navigate('/learn')}
                    className="w-full max-w-xs flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 group"
                >
                    <Play size={18} className="fill-white" />
                    Continue Learning
                </button>
            </section>

            {/* 2. Interactive Calendar */}
            <section className="bg-slate-900/95 border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-[2.5rem]" />

                {/* Calendar Navigation */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                            <Calendar size={20} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic">
                            {calendarData.monthName}
                        </h3>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                        <button
                            onClick={prevMonth}
                            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={jumpToToday}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 sm:grid-cols-7 md:grid-cols-7 lg:grid-cols-7 gap-2 md:gap-4">
                    {/* Weekday headers */}
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-black text-slate-600 uppercase mb-2">
                            {d}
                        </div>
                    ))}

                    {/* Empty boxes for start day offset */}
                    {Array.from({ length: (new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()) }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-full aspect-square opacity-0" />
                    ))}

                    {calendarData.days.map((day, idx) => {
                        const baseClasses = "relative aspect-square rounded-xl md:rounded-2xl transition-all flex flex-col items-center justify-center gap-1 group border";
                        const isFutureClasses = day.isFuture ? "cursor-default border-transparent" : "active:scale-95";

                        let stateClasses = "bg-slate-950/40 text-slate-600 border-white/5 hover:bg-slate-800 hover:text-white";
                        if (day.isActive) stateClasses = "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border-indigo-400/50";
                        else if (day.isJoinDate) stateClasses = "bg-indigo-500/10 text-indigo-400 border-indigo-500/40";
                        else if (day.isBeforeJoin) stateClasses = "bg-slate-950/20 text-slate-800 border-white/5 opacity-40";
                        else if (day.isToday) stateClasses = "bg-slate-800 border-indigo-500/50 text-white";

                        return (
                            <button
                                key={idx}
                                onClick={() => !day.isFuture && setSelectedDay(day)}
                                disabled={day.isFuture}
                                className={`${baseClasses} ${isFutureClasses} ${stateClasses}`}
                            >
                                <span className="text-[10px] md:text-sm font-black">{day.dayNum}</span>
                                {day.isActive && (
                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-xl" />
                                )}
                                {day.isJoinDate && !day.isActive && (
                                    <div className="absolute -bottom-1 text-[8px] font-black tracking-tighter text-indigo-400 uppercase">Start</div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-indigo-600 shadow-lg shadow-indigo-600/30" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-indigo-500/10 border border-indigo-500/40" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Join Date</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-slate-950/20 border border-white/5 opacity-40" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pre-Join</span>
                    </div>
                </div>
            </section>

            {/* Selected Day Info Card */}
            {selectedDay && (
                <div className="p-6 md:p-8 bg-slate-900/90 border border-indigo-500/20 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${selectedDay.isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-700'}`}>
                                {selectedDay.isActive ? <CheckCircle2 size={28} /> : (selectedDay.isJoinDate ? <Trophy size={28} /> : <Zap size={28} />)}
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-white uppercase tracking-tight">
                                    {selectedDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </h4>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {selectedDay.isJoinDate ? 'Joined GenSpark 🎉' : (selectedDay.isActive ? 'Action Logged' : 'No activity')}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                            <XCircle size={20} className="text-slate-600" />
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5">
                        {selectedDay.isActive ? (
                            <p className="text-sm text-slate-300 leading-relaxed italic">
                                Consistency is key! You spent time mastering {user.lastLanguageId === 'c' ? 'C Programming' : 'development'} on this day.
                            </p>
                        ) : (
                            <p className="text-sm text-slate-500 leading-relaxed italic">
                                {selectedDay.isBeforeJoin
                                    ? "This was before you joined our elite squad of developers."
                                    : "No activity recorded on this day. Every small step counts towards mastery!"}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StreaksActivity;
