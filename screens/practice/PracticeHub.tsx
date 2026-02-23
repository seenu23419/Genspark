import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { usePractice } from '../../contexts/PracticeContext';

const PracticeHub: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { topics, loading, getProblemStatus, progress, refreshProgress } = usePractice();
    const [activeTopicId, setActiveTopicId] = useState<string | null>(searchParams.get('topic'));


    // Initial Topic Selection from URL or default to first
    useEffect(() => {
        const topicFromUrl = searchParams.get('topic');
        if (topicFromUrl) {
            setActiveTopicId(topicFromUrl);
        } else if (topics.length > 0 && !activeTopicId) {
            setActiveTopicId(topics[0].id);
        }
    }, [topics, searchParams]);

    const activeTopic = useMemo(() => {
        if (!topics || topics.length === 0) return null;
        return topics.find(t => t && t.id === activeTopicId) || topics[0];
    }, [topics, activeTopicId]);

    const filteredProblems = activeTopic?.problems || [];

    // Force refresh on mount
    useEffect(() => {
        refreshProgress();
    }, [refreshProgress]);

    // Minimalist Loading State
    if (loading && topics.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-black gap-4 transition-colors duration-300">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Initializing Hub...</p>
            </div>
        );
    }

    if (topics.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-black p-10 text-center transition-colors duration-300">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex items-center justify-center mb-8 shadow-2xl">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight italic">No Content Found</h2>
                <p className="text-slate-500 text-xs font-medium max-w-xs italic leading-relaxed">
                    We couldn't synchronize the practice modules. Please check your network or refresh the session.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-10 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/20 active:scale-95 transition"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    // Total stats
    const totalProblems = (topics || []).flatMap(t => t?.problems || []).length;

    // DEMO FIX: Read directly from localStorage + Context to ensure count is never 0 if work was done
    const getLocalCount = () => {
        try {
            const raw = localStorage.getItem('practice_progress_local');
            if (!raw) return 0;
            const parsed = JSON.parse(raw);
            return Object.values(parsed).filter((p: any) => p.status === 'completed').length;
        } catch (e) { return 0; }
    };

    const contextCount = (topics || []).flatMap(t => t?.problems || []).filter(p => p && getProblemStatus(p.id) === 'COMPLETED').length;
    const completedProblems = Math.max(contextCount, getLocalCount());

    const progressPercent = totalProblems > 0 ? (completedProblems / totalProblems) * 100 : 0;


    return (
        <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-white pb-24 font-sans selection:bg-indigo-500/30 transition-colors duration-300">
            {/* 1. Header (Static) */}
            <div className="shrink-0 bg-transparent px-6 pt-10 pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="max-w-5xl mx-auto flex flex-col gap-3">
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic whitespace-nowrap">PRACTICE HUB</h1>
                        </div>
                        <div className="text-right pb-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
                                {completedProblems} of {totalProblems} tasks solved
                            </span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* 2. Topic Selector (Sticky) */}
            <div className="shrink-0 bg-slate-50 dark:bg-black sticky top-0 z-30 border-b border-slate-200 dark:border-white/10 shadow-lg">
                <div className="px-6 py-2 max-w-5xl mx-auto">
                    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2">
                        {topics.map((topic) => {
                            if (!topic) return null; // Defensive check
                            const isActive = activeTopicId === topic.id;
                            return (
                                <button
                                    key={topic.id}
                                    onClick={() => setActiveTopicId(topic.id)}
                                    className={`shrink-0 flex flex-col items-center gap-1.5 transition-all duration-300 group`}
                                >
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-400'}`}>
                                        {topic.title}
                                    </span>
                                    <div className={`h-0.5 rounded-full transition-all duration-300 ${isActive ? 'w-full bg-indigo-500' : 'w-0 bg-transparent'}`} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 2. Problem List */}
            <div className="bg-transparent pb-32">
                <div className="px-6 py-8 max-w-5xl mx-auto">
                    {filteredProblems.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredProblems.map((problem, idx) => {
                                if (!problem) return null; // Defensive check
                                const status = getProblemStatus(problem.id);
                                const isCompleted = status === 'COMPLETED';
                                const isInProgress = status === 'IN_PROGRESS';

                                const accentColor = isCompleted ? 'bg-emerald-500' : (isInProgress ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-600 shadow-sm');
                                const statusText = isCompleted ? 'COMPLETED ✓' : (isInProgress ? 'IN PROGRESS' : 'NOT STARTED');
                                const statusColor = isCompleted ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : (isInProgress ? 'text-blue-600 dark:text-blue-400 border-blue-500/20 bg-blue-500/5' : 'text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50');

                                return (
                                    <div
                                        key={problem.id}
                                        onClick={() => navigate(`/practice/problem/${problem.id}`)}
                                        className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/20 rounded-2xl p-6 relative transition-all active:scale-[0.98] cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/90 shadow-sm hover:shadow-xl hover:border-indigo-500 dark:hover:border-indigo-500/80 ring-0 hover:ring-1 hover:ring-indigo-500/50"
                                    >
                                        {/* Card content: meta + title + button */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            {/* Left: meta + title */}
                                            <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
                                                {/* Meta Row */}
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${problem.difficulty === 'easy' ? 'text-emerald-500' : problem.difficulty === 'medium' ? 'text-amber-500' : 'text-rose-500'}`}>
                                                        {problem.difficulty}
                                                    </span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
                                                    <span className="text-[8px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                                                        {problem.concept || 'C LANGUAGE'}
                                                    </span>
                                                </div>
                                                {/* Title */}
                                                <h3 className={`text-lg sm:text-xl font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight leading-tight ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                    {idx + 1}. {problem.title}
                                                </h3>
                                            </div>

                                            {/* Right: CTA Button */}
                                            <div className="shrink-0 w-full sm:w-auto">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/practice/problem/${problem.id}`);
                                                    }}
                                                    className={`w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl font-black text-[10px] sm:text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isCompleted
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:bg-indigo-700'
                                                        }`}
                                                >
                                                    {isCompleted ? 'SOLVED ✓' : 'SOLVE CHALLENGE'}
                                                    <ChevronRight size={14} className="sm:hidden" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <h3 className="text-xl font-black text-slate-200 dark:text-white/20 uppercase tracking-tighter">No problems in this topic</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PracticeHub;
