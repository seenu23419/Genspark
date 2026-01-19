import React, { useEffect, useState } from 'react';
import { History, CheckCircle2, Calendar, Trash2 } from 'lucide-react';
import { supabaseDB } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';

interface HistoryGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  completedAt: string;
  daysToComplete: number;
}

const GoalHistory: React.FC = () => {
  const { user } = useAuth();
  const [completedGoals, setCompletedGoals] = useState<HistoryGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!((user as any)._id)) {
      setCompletedGoals([]);
      setLoading(false);
      return;
    }
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 3000));
      const query = supabaseDB.supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', user?._id)
        .eq('completed', true)
        .order('updated_at', { ascending: false });

      const { data: goals, error } = await Promise.race([query, timeout]) as any;

      if (error) {
        console.error('Error loading history:', error);
        return;
      }

      if (goals) {
        const formattedGoals: HistoryGoal[] = goals.map((g: any) => ({
          id: g.id,
          title: g.title,
          target: g.target,
          current: g.current,
          unit: g.unit,
          deadline: g.deadline,
          completedAt: g.updated_at,
          daysToComplete: Math.ceil(
            (new Date(g.updated_at).getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24)
          )
        }));
        setCompletedGoals(formattedGoals);
      }
    } catch (e) {
      console.error('Error in loadHistory:', e);
      setCompletedGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabaseDB.supabase
        .from('study_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user?._id);

      if (!error) {
        loadHistory();
      }
    } catch (e) {
      console.error('Error deleting goal:', e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
          <History size={20} className="text-indigo-400" />
          Goal History
        </h3>
        <p className="text-slate-400 text-sm">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
        <History size={20} className="text-indigo-400" />
        Goal History
        {completedGoals.length > 0 && (
          <span className="ml-auto text-xs bg-green-600 text-white px-2 py-1 rounded-full">
            {completedGoals.length} Completed
          </span>
        )}
      </h3>

      {completedGoals.length === 0 ? (
        <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-700">
          <History size={32} className="text-slate-700 mx-auto mb-2" />
          <p className="text-slate-400 text-sm font-bold">No completed goals yet. Keep working! 💪</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {completedGoals.map((goal) => (
            <div
              key={goal.id}
              className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 p-4 rounded-lg hover:border-green-500/50 transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white">{goal.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {goal.current} / {goal.target} {goal.unit}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(goal.completedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  ✓ Completed in {goal.daysToComplete} days
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalHistory;
