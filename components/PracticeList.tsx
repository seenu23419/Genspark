import React, { useState, useMemo } from 'react';
import { ChevronRight, BookOpen, Zap, AlertCircle } from 'lucide-react';
import { PracticeProblem, PRACTICE_TOPICS } from '../data/practiceProblems';

interface PracticeListProps {
  onSelectProblem: (problem: PracticeProblem) => void;
  progress: Record<string, { solvedAt: number; attempts: number; lastAccepted?: boolean }>;
  searchQuery?: string;
  difficultyFilter?: 'any' | 'easy' | 'medium' | 'hard';
}

/**
 * Practice List Component
 * 
 * Displays problems in large, full-width cards (mobile-first design).
 * 
 * Each card shows:
 * - Difficulty (Easy / Medium / Hard)
 * - Concept (e.g., loops, functions)
 * - Status badge (NOT STARTED / IN PROGRESS / COMPLETED)
 * - Problem title (short)
 * - No full problem statement (keep cards clean)
 * 
 * Section progress shown at topic level:
 * - Example: "Introduction – 1 / 5 completed"
 */
const PracticeList: React.FC<PracticeListProps> = ({
  onSelectProblem,
  progress,
  searchQuery = '',
  difficultyFilter = 'any'
}) => {
  // Filter problems
  const filteredTopics = useMemo(() => {
    return PRACTICE_TOPICS.map(topic => {
      const filteredProblems = topic.problems.filter(p => {
        if (difficultyFilter !== 'any' && p.difficulty !== difficultyFilter) return false;
        if (searchQuery && !(
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.concept && p.concept.toLowerCase().includes(searchQuery.toLowerCase()))
        )) return false;
        return true;
      });
      return { ...topic, problems: filteredProblems };
    }).filter(topic => topic.problems.length > 0);
  }, [searchQuery, difficultyFilter]);

  // Calculate progress for each topic
  const getTopicProgress = (topicId: string, problems: PracticeProblem[]) => {
    const completed = problems.filter(p => progress[p.id]?.lastAccepted).length;
    return { completed, total: problems.length };
  };

  // Get status badge
  const getStatusBadge = (problemId: string) => {
    const p = progress[problemId];
    if (!p) {
      return { status: 'NOT_STARTED', label: 'Not Started', color: 'bg-slate-800/40 border-slate-700/50 text-slate-400' };
    }
    if (p.lastAccepted) {
      return { status: 'COMPLETED', label: 'Completed', color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' };
    }
    return { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500/20 border-blue-500/50 text-blue-400' };
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'medium':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
      case 'easy':
      default:
        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
    }
  };

  return (
    <div className="space-y-8 md:space-y-10">
      {filteredTopics.length === 0 ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mx-auto">
            <AlertCircle size={24} className="text-slate-600" />
          </div>
          <p className="text-slate-400">No problems match your filters.</p>
        </div>
      ) : (
        filteredTopics.map(topic => {
          const { completed, total } = getTopicProgress(topic.id, topic.problems);

          return (
            <section key={topic.id} className="space-y-4">
              {/* Topic Header with Progress */}
              <div className="px-4 sm:px-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-400" />
                    {topic.title}
                  </h2>
                  <span className="text-xs sm:text-sm font-medium text-slate-400">
                    {completed} / {total} completed
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-300"
                    style={{ width: `${(completed / total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Problem Cards */}
              <div className="space-y-3 px-4 sm:px-6">
                {topic.problems.map((problem, idx) => {
                  const statusBadge = getStatusBadge(problem.id);
                  const difficultyColor = getDifficultyColor(problem.difficulty);

                  return (
                    <button
                      key={problem.id}
                      onClick={() => onSelectProblem(problem)}
                      className="w-full text-left p-4 sm:p-5 border border-slate-700/50 rounded-lg hover:border-indigo-500/50 bg-slate-900/30 hover:bg-slate-900/60 transition-all duration-200 group space-y-3"
                    >
                      {/* Card Header: Title + Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                            {idx + 1}. {problem.title}
                          </h3>
                        </div>
                        <div
                          className={`px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider border whitespace-nowrap flex-shrink-0 ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </div>
                      </div>

                      {/* Card Body: Difficulty + Concept + Time + Relation */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${difficultyColor}`}
                        >
                          {problem.difficulty === 'hard' ? 'Hard' : problem.difficulty === 'medium' ? 'Medium' : 'Easy'}
                        </span>
                        {problem.concept && (
                          <span className="text-[10px] font-medium px-2.5 py-1 rounded-full text-slate-400 bg-slate-800/60">
                            {problem.concept}
                          </span>
                        )}
                      </div>

                      {/* Card Meta: Time + Related Lesson + Progress */}
                      <div className="space-y-2 pt-1">
                        {problem.estimatedTime && (
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>⏱</span>
                            <span className="font-medium">{problem.estimatedTime}–{problem.estimatedTime + 1} min</span>
                          </div>
                        )}
                        {problem.relatedLesson && (
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>📖</span>
                            <span className="font-medium line-clamp-1">{problem.relatedLesson}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Arrow Indicator */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-500">
                          {progress[problem.id]?.attempts ? `${progress[problem.id].attempts} attempt${progress[problem.id].attempts !== 1 ? 's' : ''}` : ''}
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
};

export default PracticeList;
