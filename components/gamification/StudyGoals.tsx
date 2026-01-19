import React, { useEffect, useState, useMemo } from 'react';
import { Target, Plus, CheckCircle2, Clock, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseDB } from '../../services/supabaseService';
import GoalModal from './GoalModal';
import GoalAnalytics from './GoalAnalytics';
import GoalTemplatesComponent from './GoalTemplates';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  icon: React.ReactNode;
  icon_type: string;
  color: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  target: <Target size={18} />,
  zap: <Zap size={18} />,
  clock: <Clock size={18} />
};

const StudyGoals: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Derive active goals in memory to avoid redundant DB calls
  const activeGoals = useMemo(() => goals.filter(g => !g.completed), [goals]);

  useEffect(() => {
    if (!user) return;
    if (!((user as any)._id)) {
      setGoals(getMockGoals());
      setLoading(false);
      return;
    }
    loadGoals();
  }, [user]);

  const loadGoals = async (retryCount = 0) => {
    try {
      setLoading(retryCount === 0);
      const userId = (user as any)?._id || (user as any)?.id;
      if (!userId) {
        setGoals([]);
        setLoading(false);
        return;
      }

      console.log(`Loading all goals (attempt ${retryCount + 1}/3) for user ${userId}`);

      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 20000));
      const query = supabaseDB.supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', userId)
        .order('deadline', { ascending: true });

      const { data, error } = await Promise.race([query, timeout]) as any;

      if (error) {
        console.error('Error loading goals:', error);
        if (retryCount < 2) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => loadGoals(retryCount + 1), delay);
          return;
        }
        setGoals([]);
      } else if (data && data.length > 0) {
        console.log(`✅ Loaded ${data.length} total goals`);
        const formattedGoals = data.map((g: any) => ({
          id: g.id,
          title: g.title,
          target: g.target,
          current: g.current,
          unit: g.unit,
          deadline: g.deadline,
          icon: ICON_MAP[g.icon_type] || <Target size={18} />,
          icon_type: g.icon_type,
          color: g.color_gradient,
          completed: g.completed,
          created_at: g.created_at,
          updated_at: g.updated_at
        }));
        setGoals(formattedGoals);
      } else {
        setGoals([]);
      }
    } catch (e) {
      console.error('Error in loadGoals:', e);
      if (e instanceof Error && e.message.includes('timeout') && retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => loadGoals(retryCount + 1), delay);
        return;
      }
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const getMockGoals = (): Goal[] => {
    return [
      {
        id: '1',
        title: 'Complete Python Basics',
        target: 10,
        current: 7,
        unit: 'lessons',
        deadline: '2026-02-08',
        icon: <Target size={18} />,
        icon_type: 'target',
        color: 'from-blue-500 to-cyan-500',
        completed: false
      },
      {
        id: '2',
        title: 'Practice Daily',
        target: 30,
        current: 18,
        unit: 'days',
        deadline: '2026-02-08',
        icon: <Zap size={18} />,
        icon_type: 'zap',
        color: 'from-yellow-500 to-orange-500',
        completed: false
      }
    ];
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.round((current / target) * 100);
  };

  const updateGoal = async (goalId: string, current: number) => {
    try {
      const userId = (user as any)?._id || (user as any)?.id;
      if (!userId) return;

      // Optimistic Update
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current } : g));

      const { error } = await supabaseDB.supabase
        .from('study_goals')
        .update({ current, updated_at: new Date().toISOString() })
        .eq('id', goalId)
        .eq('user_id', userId);

      if (error) {
        console.error('Update Goal Error:', error);
        loadGoals(); // Revert on error
      }
    } catch (e) {
      console.error('Error updating goal:', e);
    }
  };

  const completeGoal = async (goalId: string) => {
    try {
      const userId = (user as any)?._id || (user as any)?.id;
      if (!userId) return;

      // Optimistic Update
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, completed: true } : g));

      const { error } = await supabaseDB.supabase
        .from('study_goals')
        .update({
          completed: true,
          current: goals.find(g => g.id === goalId)?.target || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error completing goal:', error);
        loadGoals(); // Revert on error
      }
    } catch (e) {
      console.error('Error completing goal:', e);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Active Goals Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Target size={20} className="text-indigo-400" />
            Study Goals
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="hover:bg-indigo-600/20 p-2 rounded-lg transition-colors text-indigo-400 text-xs font-bold"
              title="Use templates"
            >
              Templates
            </button>
            <button
              onClick={() => {
                setSelectedTemplate(null);
                setIsModalOpen(true);
              }}
              className="hover:bg-indigo-600/20 p-2 rounded-lg transition-colors"
            >
              <Plus size={18} className="text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Templates Section */}
        {showTemplates && (
          <GoalTemplatesComponent onSelectTemplate={handleTemplateSelect} />
        )}

        {/* Goal Analytics Board */}
        <GoalAnalytics goals={goals} loading={loading} />

        {/* Active Goals List */}
        {loading && goals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm font-bold animate-pulse">Synchronizing performance data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const progress = calculateProgress(goal.current, goal.target);
              const daysLeft = Math.ceil(
                (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={goal.id}
                  className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl hover:border-indigo-500/30 transition-all group animate-in slide-in-from-bottom-2 duration-500"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${goal.color} text-white shadow-lg shadow-black/20`}>
                        {goal.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{goal.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {goal.current} / {goal.target} {goal.unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                      <div>
                        <p className="text-sm font-black text-white">{progress}%</p>
                        <p className={`text-[10px] ${daysLeft <= 3 ? 'text-red-400 animate-pulse font-black' : 'text-slate-400'}`}>
                          {daysLeft} days left
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mb-4 border border-slate-800">
                    <div
                      className={`h-full bg-gradient-to-r ${goal.color} transition-all duration-700 ease-out`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => updateGoal(goal.id, Math.max(0, goal.current - 1))}
                      className="text-xs px-2 py-1 bg-slate-700/50 hover:bg-slate-600 text-slate-400 rounded-lg transition-all active:scale-90"
                      title="Decrease progress"
                    >
                      −
                    </button>
                    <button
                      onClick={() => updateGoal(goal.id, Math.min(goal.target, goal.current + 1))}
                      className="text-xs px-3 py-2 bg-indigo-600/60 hover:bg-indigo-600 text-white rounded-lg transition-all flex-1 font-bold active:scale-95 shadow-lg shadow-indigo-900/20"
                    >
                      +1 Progress
                    </button>
                  </div>

                  {progress >= 100 && (
                    <div className="mt-3 animate-in fade-in zoom-in duration-300">
                      <button
                        onClick={() => completeGoal(goal.id)}
                        className="w-full flex items-center justify-center gap-2 text-xs text-white font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 py-2.5 px-4 rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                      >
                        <CheckCircle2 size={14} />
                        Mission Accomplished
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {activeGoals.length === 0 && !loading && (
              <div className="text-center py-12 bg-slate-900/30 rounded-3xl border border-slate-800/50 animate-in fade-in duration-700">
                <Target size={40} className="text-slate-800 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-bold">All caught up!</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Create a new goal to keep climbing</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTemplate(null);
        }}
        onGoalCreated={loadGoals}
        templates={selectedTemplate ? [selectedTemplate] : []}
      />
    </div>
  );
};

export default StudyGoals;
