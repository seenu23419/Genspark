import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Code,
    Clock,
    Target,
    Calendar,
    ChevronRight,
    FileCode,
    CheckCircle2,
    AlertCircle,
    X,
    Copy,
    Terminal,
    Play
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePractice } from '../../contexts/PracticeContext';
import { useCurriculum } from '../../contexts/CurriculumContext';

const Submissions: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { progress, topics, refreshProgress } = usePractice();
    const { data: curriculumData } = useCurriculum();
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

    if (!user) return null;

    // Force refresh on mount
    React.useEffect(() => { refreshProgress(); }, [refreshProgress]);

    // Merge Context Progress + Local Storage for immediate updates
    const submissions = React.useMemo(() => {
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
                challenge_id: val.challenge_id || val.id || key
            }))
            .filter((p: any) => p && (p.status === 'completed' || p.status === 'attempted' || p.status === 'COMPLETED'))
            .sort((a: any, b: any) => new Date(b.completed_at || b.last_attempt_at).getTime() - new Date(a.completed_at || a.last_attempt_at).getTime());
    }, [progress]);

    // Helper to find problem title
    const getProblemTitle = (id: string) => {
        for (const topic of topics) {
            const prob = topic.problems.find(p => p.id === id);
            if (prob) return prob.title;
        }
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

    const StatusBadge = ({ status }: { status: string }) => {
        const isCompleted = status?.toLowerCase() === 'completed';
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isCompleted
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                {isCompleted ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {isCompleted ? 'Accepted' : 'Attempted'}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-300">
            {/* Header Section */}
            <div className="bg-white dark:bg-[#0f172a]/50 border-b border-slate-200 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-12 md:px-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-sm font-bold group"
                            >
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Back to Home
                            </button>
                            <div>
                                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white italic">Practice Submissions</h1>
                                <p className="text-slate-500 text-sm mt-1">Review and manage your coding history</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 px-6 py-3 rounded-2xl">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total Solved</p>
                                <p className="text-2xl font-black text-blue-500">{submissions.filter(s => s.status?.toLowerCase() === 'completed').length}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 px-6 py-3 rounded-2xl">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total Attempts</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{submissions.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 pb-32">
                {submissions.length > 0 ? (
                    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Problem</th>
                                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Language</th>
                                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Time</th>
                                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Date</th>
                                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {submissions.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5">
                                                <div
                                                    onClick={() => navigate(`/practice/problem/${item.challenge_id}`)}
                                                    className="font-bold text-slate-900 dark:text-white hover:text-blue-500 cursor-pointer transition-colors"
                                                >
                                                    {getProblemTitle(item.challenge_id)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black tracking-wider uppercase text-[10px]">
                                                    {item.language_used || 'c'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-1.5 font-mono text-emerald-500 text-xs font-bold">
                                                    <Clock size={12} />
                                                    {item.execution_time || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                    <Calendar size={12} />
                                                    {new Date(item.completed_at || item.last_attempt_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => setSelectedSubmission(item)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-600 dark:text-slate-400 hover:text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                                                >
                                                    <FileCode size={14} />
                                                    View Code
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.08] rounded-3xl">
                        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 mb-6">
                            <Code size={32} className="text-slate-300 dark:text-slate-700" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 italic px-5">No submissions found</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">Start solving problems in the Practice Hub to build your history!</p>
                        <button
                            onClick={() => navigate('/practice')}
                            className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all active:scale-95"
                        >
                            Explore Problems
                        </button>
                    </div>
                )}
            </main>

            {/* Code Viewer Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedSubmission(null)} />

                    <div className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                    <Terminal size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white italic leading-tight">
                                        {getProblemTitle(selectedSubmission.challenge_id)}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <StatusBadge status={selectedSubmission.status} />
                                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">{selectedSubmission.language_used || 'c'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Code Content */}
                        <div className="flex-1 overflow-auto p-6 bg-slate-50/50 dark:bg-white/[0.02]">
                            <div className="relative group">
                                <button
                                    onClick={() => navigator.clipboard.writeText(selectedSubmission.code_snapshot)}
                                    className="absolute top-4 right-4 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100"
                                    title="Copy Code"
                                >
                                    <Copy size={16} />
                                </button>
                                <pre className="font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300 p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 overflow-x-auto min-h-[300px]">
                                    {selectedSubmission.code_snapshot || '// No code recorded for this attempt.'}
                                </pre>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-5 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-emerald-500" />
                                    Runtime: {selectedSubmission.execution_time || '-'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Play size={12} className="text-blue-500" />
                                    Language: {selectedSubmission.language_used || 'c'}
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/practice/problem/${selectedSubmission.challenge_id}`)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                                Try Again
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Submissions;
