import React, { useMemo, useState, useEffect } from 'react';
import { ChevronRight, CheckCircle2, Clock, Loader2, Zap } from 'lucide-react';
import CodingWorkspace from './CodingWorkspace';
import { PracticeProblem } from '../../services/practiceService';
import { usePractice } from '../../contexts/PracticeContext';
import { supabaseDB } from '../../services/supabaseService';

type ProgressState = Record<string, { status: string; completedAt?: number; attempts: number }>;

const PracticeList: React.FC = () => {
  const { topics, loading: contextLoading, getProblemStatus: getContextStatus } = usePractice();
  const [selectedProblem, setSelectedProblem] = useState<PracticeProblem | null>(null);
  const [progress, setProgress] = useState<ProgressState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const data = await supabaseDB.getAllPracticeProgress();
        const mappedProgress: ProgressState = {};
        data.forEach((p: any) => {
          mappedProgress[p.challenge_id] = {
            status: p.status,
            completedAt: p.completed_at ? new Date(p.completed_at).getTime() : undefined,
            attempts: p.attempts_count || 0
          };
        });
        setProgress(mappedProgress);
      } catch (e) {
        console.error("Failed to fetch practice progress:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const allProblems = useMemo(() => {
    const problems: PracticeProblem[] = [];
    topics.forEach(topic => {
      if (topic.problems) problems.push(...topic.problems);
    });
    return problems;
  }, [topics]);

  const filteredProblems = allProblems;

  const getProblemStatus = (problemId: string) => {
    const p = progress[problemId];
    if (p?.status === 'completed') return 'COMPLETED';
    if (p?.status === 'attempted') return 'IN_PROGRESS';
    return 'NOT_STARTED';
  };

  const completedCount = Object.values(progress).filter((p: any) => p.status === 'completed').length;
  const totalCount = allProblems.length;

  const handleProblemComplete = (problemId: string) => {
    // Optimistic update
    setProgress(prev => ({
      ...prev,
      [problemId]: {
        ...prev[problemId],
        status: 'completed',
        completedAt: Date.now(),
        attempts: (prev[problemId]?.attempts || 0) + 1
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-black items-center justify-center transition-colors duration-300">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Progress...</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER SELECTED PROBLEM
  // ═══════════════════════════════════════════════════════════

  if (selectedProblem) {
    return (
      <CodingWorkspace
        problem={selectedProblem as any}
        status={getProblemStatus(selectedProblem.id) as any}
        onBack={() => setSelectedProblem(null)}
        onComplete={handleProblemComplete}
        onNext={() => {
          const currentIdx = filteredProblems.findIndex(p => p.id === selectedProblem.id);
          if (currentIdx !== -1 && currentIdx + 1 < filteredProblems.length) {
            setSelectedProblem(filteredProblems[currentIdx + 1]);
          }
        }}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER PROBLEM LIST
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-black transition-colors duration-300">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-500/5 to-slate-200/5 dark:from-indigo-900/20 dark:to-slate-900/20 border-b border-slate-200 dark:border-slate-800/50 px-6 py-8 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-indigo-100 tracking-tight uppercase italic">Introduction</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Pick a problem and start coding. You can return anytime.
          </p>
        </div>

        {/* Progress Bar & Stats */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Course Progress</span>
            </div>
            <span className="text-sm font-black text-indigo-400">
              {completedCount} / {totalCount} completed
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-1000 ease-out"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>


      {/* PROBLEM LIST */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar">
        {filteredProblems.length > 0 ? (
          filteredProblems.map((problem, idx) => {
            const status = getProblemStatus(problem.id);
            const isCompleted = status === 'COMPLETED';
            const isInProgress = status === 'IN_PROGRESS';

            return (
              <div
                key={problem.id}
                className={`group relative overflow-hidden flex flex-col border rounded-2xl transition-all duration-300 cursor-pointer ${isCompleted
                  ? 'border-emerald-500/20 bg-emerald-500/[0.02] opacity-70'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:border-indigo-500/30 dark:hover:bg-slate-900/50 hover:shadow-lg'
                  }`}
                onClick={() => setSelectedProblem(problem)}
              >
                {/* State Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCompleted ? 'bg-green-500 shadow-[2px_0_10px_rgba(34,197,94,0.3)]' :
                  isInProgress ? 'bg-indigo-500 shadow-[2px_0_10px_rgba(99,102,241,0.3)]' :
                    'bg-slate-700'
                  }`} />

                <div className="p-5 flex flex-col gap-4">
                  {/* Top: Status & Difficulty */}
                  <div className="flex items-center justify-end">

                    {/* Status Pill */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${isCompleted
                      ? 'bg-green-500/10 border-green-500/20 text-green-500'
                      : isInProgress
                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                      }`}>
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                        {isCompleted ? 'COMPLETED ✓' : isInProgress ? 'IN PROGRESS' : 'NOT STARTED'}
                      </span>
                    </div>
                  </div>

                  {/* Body: Title & Tags */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors leading-tight">
                        {problem.title}
                      </h3>
                      {isCompleted && (
                        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      {problem.concept && (
                        <div className="flex items-center gap-1.5 bg-slate-800/40 px-2 py-0.5 rounded border border-white/5">
                          <Zap size={10} className="text-indigo-400" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {problem.concept}
                          </span>
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                        {problem.language || 'C'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {problem.description}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProblem(problem);
                      }}
                      className={`w-full flex items-center justify-center gap-2 h-11 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${isCompleted
                        ? 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-[0.98]'
                        }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Completed</span>
                        </>
                      ) : isInProgress ? (
                        <span>Continue</span>
                      ) : (
                        <span>Start Coding</span>
                      )}
                      {!isCompleted && <ChevronRight size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5 rotate-12">
              <Zap size={32} className="text-slate-700" />
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">No problems yet</h3>
            <p className="text-slate-500 text-sm mt-1">Check back soon for new challenges!</p>
          </div>
        )}
      </div>

      {/* FOOTER STATS */}
      <div className="bg-slate-900/80 border-t border-slate-700/50 px-4 py-3 text-center text-xs text-slate-500">
        Showing {filteredProblems.length} of {allProblems.length} problems
      </div>
    </div>
  );
};

export default PracticeList;
