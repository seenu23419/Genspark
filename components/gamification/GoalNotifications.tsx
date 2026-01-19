import React, { useEffect, useState } from 'react';
import { AlertCircle, Bell, Clock, CheckCircle2, X } from 'lucide-react';
import { supabaseDB } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';

interface GoalNotification {
  id: string;
  goalId: string;
  goalTitle: string;
  type: 'deadline-approaching' | 'completed' | 'behind-schedule';
  message: string;
  severity: 'info' | 'warning' | 'success';
  read: boolean;
  createdAt: Date;
}

const GoalNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<GoalNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!((user as any)._id)) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    generateNotifications();
  }, [user]);

  const generateNotifications = async () => {
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

      const newNotifications: GoalNotification[] = [];
      const now = new Date();

      if (goals) {
        goals.forEach((goal: any) => {
          const deadline = new Date(goal.deadline);
          const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const progress = Math.round((goal.current / goal.target) * 100);

          // Completed goal
          if (goal.completed) {
            newNotifications.push({
              id: `${goal.id}-completed`,
              goalId: goal.id,
              goalTitle: goal.title,
              type: 'completed',
              message: `Goal "${goal.title}" completed! 🎉`,
              severity: 'success',
              read: false,
              createdAt: new Date()
            });
          }

          // Deadline approaching (3 days or less)
          if (!goal.completed && daysLeft > 0 && daysLeft <= 3) {
            newNotifications.push({
              id: `${goal.id}-deadline`,
              goalId: goal.id,
              goalTitle: goal.title,
              type: 'deadline-approaching',
              message: `Deadline for "${goal.title}" in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!`,
              severity: 'warning',
              read: false,
              createdAt: new Date()
            });
          }

          // Behind schedule (less than 50% progress with less than 7 days left)
          if (!goal.completed && daysLeft > 0 && daysLeft <= 7 && progress < 50) {
            newNotifications.push({
              id: `${goal.id}-behind`,
              goalId: goal.id,
              goalTitle: goal.title,
              type: 'behind-schedule',
              message: `You're behind schedule on "${goal.title}" (${progress}% done)`,
              severity: 'warning',
              read: false,
              createdAt: new Date()
            });
          }
        });
      }

      setNotifications(newNotifications);
    } catch (e) {
      console.error('Error in generateNotifications:', e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle2 size={18} />;
      case 'warning':
        return <AlertCircle size={18} />;
      case 'info':
      default:
        return <Bell size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Bell size={20} className="text-indigo-400" />
          Notifications
        </h3>
        <p className="text-slate-400 text-sm">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
        <Bell size={20} className="text-indigo-400" />
        Notifications
        {notifications.length > 0 && (
          <span className="ml-auto text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">
            {notifications.length}
          </span>
        )}
      </h3>

      {notifications.length === 0 ? (
        <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-700">
          <Bell size={32} className="text-slate-700 mx-auto mb-2" />
          <p className="text-slate-400 text-sm font-bold">No active notifications</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border flex items-start gap-3 ${getSeverityColor(notification.severity)}`}
            >
              <div className="flex-shrink-0 mt-0.5">{getSeverityIcon(notification.severity)}</div>
              <div className="flex-1">
                <p className="font-bold text-sm">{notification.message}</p>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalNotifications;
