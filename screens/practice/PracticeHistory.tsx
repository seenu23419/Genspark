import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Code, Clock, Target, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePractice } from '../../contexts/PracticeContext';
import { useCurriculum } from '../../contexts/CurriculumContext';

const PracticeHistory: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { progress, topics, refreshProgress } = usePractice();
    const { data: curriculumData } = useCurriculum();

    if (!user) return null;

    // Force refresh on mount
    React.useEffect(() => { refreshProgress(); }, [refreshProgress]);

    // Merge Context Progress + Local Storage for immediate updates
    const solvedProblems = React.useMemo(() => {
        let combined = { ...progress };
        try {
            const localRaw = localStorage.getItem('practice_progress_local');
            if (localRaw) {
                const localData = JSON.parse(localRaw);
                combined = { ...combined, ...localData };
            }
        } catch (e) { /* ignore */ }

        return Object.entries(combined)
            .map(([key, val]: [string, any]) => ({
                ...val,
                challenge_id: val.challenge_id || val.id || key // Fallback to key for local items
            }))
            .filter((p: any) => p && (p.status === 'completed' || p.status === 'COMPLETED'))
            .sort((a: any, b: any) => new Date(b.completed_at || b.last_attempt_at).getTime() - new Date(a.completed_at || a.last_attempt_at).getTime());
    }, [progress]);

    // Helper to find problem title from topics OR curriculum
    const getProblemTitle = (id: string) => {
        // 1. Check Practice Topics
        for (const topic of topics) {
            const prob = topic.problems.find(p => p.id === id);
            if (prob) return prob.title;
        }

        // 2. Check Curriculum Data
        if (curriculumData) {
            for (const langId in curriculumData) {
                const modules = curriculumData[langId] || [];
                for (const module of modules) {
                    if (module.problems) {
                        const prob = module.problems.find((p: any) => p.id === id);
                        if (prob) return prob.title;
                    }
                }
            }
        }

        return `Problem: ${id}`;
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-white animate-in fade-in duration-700 font-sans selection:bg-amber-500/30 transition-colors duration-300">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="relative p-6 md:p-10 max-w-5xl mx-auto space-y-10 pb-20">
                {/* Header */}
                <header className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/')}
                        className="p-3 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/80 hover:border-white/10 transition-all active:scale-90 shadow-2xl"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-amber-500/50 underline-offset-8">Practice History</h1>
                        <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-[0.2em]">Detailed analysis of your solved problems</p>
                    </div>
                </header>

                {/* Performance Overview (Subtle) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Solved</div>
                        <div className="text-2xl font-black text-amber-400">{solvedProblems.length}</div>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Languages</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{new Set(solvedProblems.map(p => p.language_used)).size}</div>
                    </div>
                </div>

                {/* History List */}
                <div className="space-y-4">
                    {solvedProblems.length > 0 ? (
                        solvedProblems.map((item, index) => {
                            const accuracy = Math.round(100 / (item.attempts_count || 1));
                            return (
                                <div
                                    key={item.challenge_id}
                                    onClick={() => navigate(`/practice/problem/${item.challenge_id}`)}
                                    className="group relative bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white dark:hover:bg-slate-800/60 hover:border-indigo-500 dark:hover:border-indigo-500/80 transition-all duration-300 animate-in slide-in-from-bottom-4 cursor-pointer shadow-sm hover:shadow-xl ring-0 hover:ring-1 hover:ring-indigo-500/30"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg group-hover:text-amber-500 transition-colors">{getProblemTitle(item.challenge_id)}</h3>
                                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-black tracking-wider uppercase text-[9px]">{item.language_used || 'c'}</span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-slate-600" />
                                                {new Date(item.completed_at || item.last_attempt_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Target size={12} className="text-emerald-500" />
                                                {accuracy}% Accuracy
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Code size={12} className="text-slate-600" />
                                                {item.attempts_count || 1} {item.attempts_count === 1 ? 'Submission' : 'Submissions'}
                                            </div>
                                        </div>
                                    </div>

                                    {item.execution_time && (
                                        <div className="mt-4 md:mt-0 md:text-right md:pl-8 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0">
                                            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-black mb-1 opacity-60 flex items-center gap-1 md:justify-end">
                                                <Clock size={10} /> Runtime
                                            </div>
                                            <div className="font-mono text-emerald-400 font-black text-xl drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] tabular-nums">{item.execution_time}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center border border-white/5">
                                <Code className="text-slate-700" />
                            </div>
                            <div className="text-slate-500 italic font-medium tracking-wide">No solved problems yet. Your practice history will appear here!</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PracticeHistory;
