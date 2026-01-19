import React, { useMemo } from 'react';
import { TrendingUp, Target, CheckCircle2, Calendar, Plus, Rocket } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  icon?: React.ReactNode;
  icon_type?: string;
  color: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

interface GoalAnalyticsProps {
  goals: Goal[];
  loading?: boolean;
}

const GoalAnalytics: React.FC<GoalAnalyticsProps> = ({ goals, loading = false }) => {
  const stats = useMemo(() => {
    if (!goals || goals.length === 0) {
      return {
        totalGoals: 0,
        completedGoals: 0,
        activeGoals: 0,
        completionRate: 0,
        avgDaysToComplete: 0
      };
    }

    const completed = goals.filter(g => g.completed);
    const active = goals.filter(g => !g.completed);
    const completionRate = Math.round((completed.length / goals.length) * 100);

    // Calculate average days to complete
    let totalDays = 0;
    let completedWithDates = 0;

    completed.forEach(g => {
      if (g.created_at && g.updated_at) {
        const start = new Date(g.created_at).getTime();
        const end = new Date(g.updated_at).getTime();
        totalDays += (end - start);
        completedWithDates++;
      }
    });

    const avgDays = completedWithDates > 0
      ? Math.max(1, Math.round(totalDays / completedWithDates / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      totalGoals: goals.length,
      completedGoals: completed.length,
      activeGoals: active.length,
      completionRate,
      avgDaysToComplete: avgDays
    };
  }, [goals]);

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex items-center justify-center animate-pulse mb-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-2xl" />
          <div className="h-4 w-32 bg-slate-800 rounded-lg" />
        </div>
      </div>
    );
  }

  // If no goals, show a "Start Your Journey" placeholder to fill the space beautifully
  if (stats.totalGoals === 0) {
    return (
      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 mb-6 relative overflow-hidden group animate-in fade-in duration-1000">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <Rocket size={120} />
        </div>
        <div className="relative z-10 max-w-md">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Kickstart Progress</p>
          <h4 className="text-2xl font-black text-white italic tracking-tight mb-3">YOUR ACADEMY RANK DATA</h4>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Stats will appear here once you launch your first study goal. Track your velocity, success rate, and daily streaks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-700 mb-6">
      {/* Completion Meter (Large) */}
      <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 shadow-xl shadow-indigo-500/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Target size={120} />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">Performance Index</p>
            <h4 className="text-3xl font-black text-white italic tracking-tight">SUCCESS RATE</h4>
          </div>

          <div className="mt-6">
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-black text-white leading-none">{stats.completionRate}%</span>
              <div className="flex flex-col mb-1">
                <span className="text-xs font-bold text-indigo-100/70 leading-none">Global Completion</span>
              </div>
            </div>

            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
              <div
                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:col-span-2">
        {/* Active Goals */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between hover:border-indigo-500/30 transition-all cursor-default group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
              <Plus size={18} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active</span>
          </div>
          <div>
            <p className="text-3xl font-black text-white tracking-tight">{stats.activeGoals}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 italic">Targets pending</p>
          </div>
        </div>

        {/* Completed Goals */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between hover:border-emerald-500/30 transition-all cursor-default group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Completed</span>
          </div>
          <div>
            <p className="text-3xl font-black text-white tracking-tight">{stats.completedGoals}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 italic">Goals achieved</p>
          </div>
        </div>

        {/* Avg Pace */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between hover:border-orange-500/30 transition-all cursor-default group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400 group-hover:rotate-12 transition-transform">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg. Velocity</p>
              <p className="text-xl font-black text-white tracking-tight">{stats.avgDaysToComplete} Days <span className="text-slate-600 text-xs italic">/goal</span></p>
            </div>
          </div>
          <div className="hidden sm:block">
            <TrendingUp size={24} className="text-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalAnalytics;
