import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePractice } from '../../contexts/PracticeContext';
import { ChevronRight, Target, Zap, Award, Search, Trophy, Terminal } from 'lucide-react';
import BannerAd from '../../components/BannerAd';

const PracticeHub: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { topics, loading, getProblemStatus, refreshProgress } = usePractice();
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
            <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-slate-950 gap-4 transition-colors duration-300 min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] animate-pulse">Initializing Hub...</p>
            </div>
        );
    }

    if (topics.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-10 text-center transition-colors duration-300 min-h-screen">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900/60 rounded-[2.5rem] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center mb-8">
                    <Terminal className="text-slate-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight italic">No Content Found</h2>
                <p className="text-slate-500 text-xs font-medium max-w-xs italic leading-relaxed">
                    We couldn't synchronize the practice modules. Please check your network or refresh the session.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-10 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition"
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
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 pb-24 font-sans selection:bg-blue-500/30 transition-colors duration-300">
            {/* 1. Header (Static) */}
            <div className="shrink-0 bg-transparent px-6 pt-2 pb-2 border-b border-slate-200 dark:border-white/[0.08]">
                <div className="max-w-7xl mx-auto flex flex-col gap-3 pt-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Practice Hub</h1>
                        </div>
                        <div className="text-right pb-1">
                            <span className="text-[11px] font-semibold text-slate-500 tracking-wide shrink-0">
                                {completedProblems} of {totalProblems} tasks solved
                            </span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-4">
                <BannerAd slot="practice-hub-banner" style={{ borderRadius: '1.5rem', overflow: 'hidden' }} />
            </div>

            {/* 2. Topic Selector (Sticky) */}
            <div className="shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-white/[0.08]">
                <div className="px-6 py-2 max-w-7xl mx-auto">
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
                                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'}`}>
                                        {topic.title}
                                    </span>
                                    <div className={`h-0.5 rounded-full transition-all duration-300 ${isActive ? 'w-full bg-blue-500' : 'w-0 bg-transparent'}`} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 2. Problem List */}
            <div className="bg-transparent pb-32">
                <div className="px-6 py-8 max-w-7xl mx-auto">
                    {filteredProblems.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredProblems.map((problem, idx) => {
                                if (!problem) return null; // Defensive check
                                const status = getProblemStatus(problem.id);
                                const isCompleted = status === 'COMPLETED';
                                const isInProgress = status === 'IN_PROGRESS';

                                return (
                                    <div
                                        key={problem.id}
                                        onClick={() => navigate(`/practice/problem/${problem.id}`)}
                                        className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 relative transition-all active:scale-[0.98] cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-blue-500/40"
                                    >
                                        {/* Card content: left info + right button */}
                                        <div className="flex items-center justify-between gap-4">
                                            {/* Left: meta + title */}
                                            <div className="space-y-2 min-w-0">
                                                {/* Meta Row */}
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-bold uppercase tracking-widest ${problem.difficulty === 'easy' ? 'text-emerald-500' : problem.difficulty === 'medium' ? 'text-amber-500' : 'text-red-500'}`}>
                                                        {problem.difficulty}
                                                    </span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                    <span className="text-[8px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                                                        {problem.concept || 'C LANGUAGE'}
                                                    </span>
                                                </div>
                                                {/* Title */}
                                                <h3 className={`text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight leading-tight capitalize ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                    <span className="text-blue-500 dark:text-blue-400/80 mr-3 font-bold tabular-nums">{(idx + 1).toString().padStart(2, '0')}</span>
                                                    {problem.title.toLowerCase()}
                                                </h3>
                                            </div>

                                            {/* Right: CTA Button */}
                                            <div className="shrink-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/practice/problem/${problem.id}`);
                                                    }}
                                                    className={`px-6 py-2.5 rounded-xl font-bold text-[9px] transition-all ${isCompleted
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                                        : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
                                                        }`}
                                                >
                                                    {isCompleted ? 'Solved' : 'Solve Challenge'}
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
