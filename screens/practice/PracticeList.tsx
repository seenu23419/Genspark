import React, { useMemo, useState, useEffect } from 'react';
import { ChevronRight, CheckCircle2, Clock, Loader2, Zap, Activity } from 'lucide-react';
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
      }
    };
    fetchProgress();
  }, []);

  // Wait for context to finish loading topics
  useEffect(() => {
    setLoading(contextLoading);
  }, [contextLoading]);

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
      <div className="flex flex-col h-screen bg-white dark:bg-[#0f172a] items-center justify-center transition-colors duration-300">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
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
    <div className="flex flex-col h-screen bg-transparent transition-colors duration-300">
      {/* HEADER */}
      <div className="bg-white/5 border-b border-white/[0.05] px-6 py-6 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Practice Arena</h1>
          <p className="text-[#94a3b8] text-sm font-medium">
            Solve problems to master your skills and climb the leaderboard.
          </p>
        </div>

        {/* Progress Bar & Stats */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Track Mastery</span>
            </div>
            <span className="text-xs font-bold text-blue-400">
              {completedCount} / {totalCount} completed
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-progress-gradient transition-all duration-1000 ease-out"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>


      {/* PROBLEM LIST */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 no-scrollbar">
        {filteredProblems.length > 0 ? (
          filteredProblems.map((problem, idx) => {
            const status = getProblemStatus(problem.id);
            const isCompleted = status === 'COMPLETED';
            const isInProgress = status === 'IN_PROGRESS';

            return (
              <div
                key={problem.id}
                className={`group card-base flex flex-col p-4 cursor-pointer ${isCompleted ? 'card-success opacity-60' : 'hover:card-active'}`}
                onClick={() => setSelectedProblem(problem)}
              >
                <div className="flex flex-col gap-3">
                  {/* Top Row: Difficulty & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${problem.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        problem.difficulty === 'medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                        {problem.difficulty || 'intermediate'}
                      </span>
                      {problem.concept && (
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                          {problem.concept}
                        </span>
                      )}
                    </div>

                    {/* Status Pill */}
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      : isInProgress
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        : 'bg-white/5 border-white/[0.08] text-slate-500'
                      }`}>
                      <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
                        {isCompleted ? 'DONE' : isInProgress ? 'IN PROGRESS' : 'UNTOUCHED'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                          {idx + 1}. {problem.title}
                        </h3>
                        {isCompleted && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-[#cbd5e1] line-clamp-1 font-medium italic opacity-70">
                        {problem.description}
                      </p>
                    </div>

                    <button className="p-2 bg-blue-600/10 text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all self-center">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5 rotate-12">
              <Zap size={32} className="text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">No challenges found</h3>
            <p className="text-[#94a3b8] text-sm mt-1">Check back later for new problems.</p>
          </div>
        )}
      </div>

      {/* FOOTER STATS */}
      <div className="bg-white/5 border-t border-white/5 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
        {filteredProblems.length} Active Challenges • {completedCount} Mastered
      </div>
    </div>
  );
};

export default PracticeList;
