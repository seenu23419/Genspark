import React, { useEffect, useState } from 'react';
import { Trophy, Star, Zap, Target, Award, Flame } from 'lucide-react';
import { supabaseDB } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
}

const GoalBadges: React.FC = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!((user as any)._id)) {
      setBadges([]);
      setLoading(false);
      return;
    }
    loadBadges();
  }, [user]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 3000));
      const query = supabaseDB.supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', user?._id);

      const { data: goals, error } = await Promise.race([query, timeout]) as any;

      if (error) {
        console.error('Error loading goals:', error);
        return;
      }

      const allBadges: Badge[] = [];

      if (goals) {
        const completed = goals.filter((g: any) => g.completed).length;
        const total = goals.length;
        const totalProgress = goals.reduce((sum: number, g: any) => sum + (g.current / g.target * 100), 0) / Math.max(total, 1);

        // First Goal Completed
        allBadges.push({
          id: 'first-goal',
          name: 'Goal Setter',
          description: 'Complete your first goal',
          icon: <Target size={24} />,
          color: 'from-blue-500 to-cyan-500',
          earned: completed >= 1,
          progress: completed
        });

        // 5 Goals Completed
        allBadges.push({
          id: 'five-goals',
          name: 'Goal Master',
          description: 'Complete 5 goals',
          icon: <Trophy size={24} />,
          color: 'from-yellow-500 to-orange-500',
          earned: completed >= 5,
          progress: Math.min(completed, 5)
        });

        // 10 Goals Completed
        allBadges.push({
          id: 'ten-goals',
          name: 'Goal Legend',
          description: 'Complete 10 goals',
          icon: <Star size={24} />,
          color: 'from-purple-500 to-pink-500',
          earned: completed >= 10,
          progress: Math.min(completed, 10)
        });

        // 75% Average Progress
        allBadges.push({
          id: 'high-achiever',
          name: 'High Achiever',
          description: '75% average progress',
          icon: <Zap size={24} />,
          color: 'from-red-500 to-rose-500',
          earned: totalProgress >= 75,
          progress: Math.round(totalProgress)
        });

        // Perfect Completion (100%)
        allBadges.push({
          id: 'perfectionist',
          name: 'Perfectionist',
          description: 'Complete a goal at 100%',
          icon: <Award size={24} />,
          color: 'from-green-500 to-emerald-500',
          earned: goals.some((g: any) => g.current >= g.target),
          progress: goals.filter((g: any) => g.current >= g.target).length
        });

        // Consistent Progress (All goals > 50%)
        allBadges.push({
          id: 'consistent',
          name: 'Consistent Learner',
          description: 'Keep all goals above 50%',
          icon: <Flame size={24} />,
          color: 'from-indigo-500 to-purple-500',
          earned: total > 0 && goals.every((g: any) => (g.current / g.target) >= 0.5),
          progress: Math.round(
            (goals.filter((g: any) => (g.current / g.target) >= 0.5).length / Math.max(total, 1)) * 100
          )
        });
      }

      setBadges(allBadges);
    } catch (e) {
      console.error('Error in loadBadges:', e);
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Trophy size={20} className="text-indigo-400" />
          Badges
        </h3>
        <p className="text-slate-400 text-sm">Loading badges...</p>
      </div>
    );
  }

  const earnedBadges = badges.filter((b) => b.earned);
  const unlockedBadges = badges.filter((b) => !b.earned);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
        <Trophy size={20} className="text-indigo-400" />
        Achievement Badges
        <span className="ml-auto text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">
          {earnedBadges.length}/{badges.length}
        </span>
      </h3>

      {earnedBadges.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-green-400 uppercase tracking-widest">Earned Badges</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br ${badge.color} border-2 border-white/20 text-white text-center group hover:scale-105 transition-transform cursor-pointer min-w-0`}
              >
                <div className="flex justify-center mb-2 w-8 h-8 sm:w-10 sm:h-10 mx-auto">{badge.icon}</div>
                <p className="font-black text-sm truncate">{badge.name}</p>
                <p className="text-xs opacity-90 mt-1 truncate">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {unlockedBadges.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Locked Badges</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-3 sm:p-4 rounded-xl bg-slate-800/50 border-2 border-slate-700 text-slate-500 text-center opacity-60 min-w-0"
              >
                <div className="flex justify-center mb-2 opacity-40 w-8 h-8 sm:w-10 sm:h-10 mx-auto">{badge.icon}</div>
                <p className="font-black text-sm truncate">{badge.name}</p>
                <p className="text-xs mt-1 truncate">{badge.description}</p>
                {badge.progress !== undefined && (
                  <div className="mt-2 w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${Math.min(badge.progress, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalBadges;
