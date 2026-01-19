import React, { useState } from 'react';
import { X, Target, Zap, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { supabaseDB } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
  templates?: Array<{ title: string; target: number; unit: string; icon: string; color: string }>;
}

const ICON_OPTIONS = [
  { value: 'target', label: 'Target', icon: <Target size={16} /> },
  { value: 'zap', label: 'Zap', icon: <Zap size={16} /> },
  { value: 'clock', label: 'Clock', icon: <Clock size={16} /> }
];

const COLOR_OPTIONS = [
  { value: 'from-blue-500 to-cyan-500', label: 'Blue' },
  { value: 'from-yellow-500 to-orange-500', label: 'Orange' },
  { value: 'from-purple-500 to-pink-500', label: 'Purple' },
  { value: 'from-green-500 to-emerald-500', label: 'Green' },
  { value: 'from-red-500 to-rose-500', label: 'Red' }
];

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onGoalCreated, templates = [] }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState<number>(10);
  const [unit, setUnit] = useState('lessons');
  const [days, setDays] = useState<number>(30);
  const [iconType, setIconType] = useState('target');
  const [colorGradient, setColorGradient] = useState('from-blue-500 to-cyan-500');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCreateGoal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!title?.trim()) {
      alert('Please enter a goal title');
      return;
    }

    if (!target || target < 1) {
      alert('Please enter a valid target (minimum 1)');
      return;
    }

    const userId = (user as any)?._id || (user as any)?.id;
    if (!userId) {
      alert('User authentication error. Please try logging in again.');
      console.error('Missing User Identity:', user);
      return;
    }

    setLoading(true);
    console.log('🚀 Initiating goal creation for user:', userId);

    try {
      // 1. Safety Check: Ensure user profile exists in public.users
      // This prevents Foreign Key violations if the auth trigger didn't run.
      console.log('🔍 Verifying user profile record...');
      const { data: profile, error: profileError } = await supabaseDB.supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) console.error('Profile Check Error:', profileError);

      if (!profile) {
        console.log('⌛ User profile missing in public.users, creating it now...');
        await supabaseDB.supabase
          .from('users')
          .insert({
            id: userId,
            email: user?.email || '',
            name: user?.name || 'User',
            first_name: user?.firstName || 'User',
            onboarding_completed: true,
            created_at: new Date()
          });
      }

      // 2. Insert Goal
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + days);

      // Perform the insert directly
      const { error, status } = await supabaseDB.supabase
        .from('study_goals')
        .insert([
          {
            user_id: userId,
            title: title.trim(),
            target,
            current: 0,
            unit,
            deadline: deadline.toISOString(),
            icon_type: iconType,
            color_gradient: colorGradient,
            completed: false
          }
        ]);

      if (error) {
        console.error('❌ Supabase Insert Error:', { code: error.code, message: error.message, status });

        // Specific user-friendly messages
        if (error.code === '23503') {
          throw new Error('User profile record missing. Please try again in a few seconds.');
        } else if (error.code === '42P01') {
          throw new Error('Database table "study_goals" does not exist yet.');
        } else {
          throw new Error(error.message || 'Database connection error');
        }
      }

      console.log('✅ Goal created successfully');
      setSuccess(true);

      // Short delay for success animation/feedback
      setTimeout(() => {
        // Reset form
        setTitle('');
        setTarget(10);
        setUnit('lessons');
        setDays(30);
        setIconType('target');
        setColorGradient('from-blue-500 to-cyan-500');
        setSuccess(false);

        // Update UI
        onGoalCreated();
        onClose();
      }, 1000);

    } catch (e) {
      console.error('⚠️ Goal Creation Failed:', e);
      const message = e instanceof Error ? e.message : 'An unexpected error occurred';
      alert(`Could not create goal: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (template: any) => {
    setTitle(template.title);
    setTarget(template.target);
    setUnit(template.unit);
    setIconType(template.icon);
    setColorGradient(template.color);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">

        <form onSubmit={handleCreateGoal} className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between shrink-0">
            <h2 className="text-xl font-black text-white italic tracking-tight">CREATE <span className="text-indigo-500">GOAL</span></h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800/50 rounded-xl transition-all active:scale-90"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* Templates */}
            {templates.length > 0 && !title && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-500">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Quick Start</p>
                <div className="grid grid-cols-1 gap-2">
                  {templates.slice(0, 2).map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => useTemplate(template)}
                      className="w-full text-left p-3.5 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 rounded-2xl transition-all group flex items-center gap-3"
                    >
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${template.color} text-white shadow-sm`}>
                        {template.icon === 'zap' ? <Zap size={14} /> : template.icon === 'clock' ? <Clock size={14} /> : <Target size={14} />}
                      </div>
                      <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{template.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Goal Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Complete Python Intro"
                className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Target & Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Target</label>
                <input
                  type="number"
                  required
                  value={target}
                  onChange={(e) => setTarget(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Unit</label>
                <div className="relative">
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option>lessons</option>
                    <option>days</option>
                    <option>problems</option>
                    <option>hours</option>
                    <option>projects</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <Target size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* Days */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Days to Complete</label>
              <input
                type="number"
                required
                value={days}
                onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Icon & Color Selection (Simplified Grid) */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Icon</label>
                <div className="flex gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => setIconType(icon.value)}
                      className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center ${iconType === icon.value
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:border-slate-600'
                        }`}
                    >
                      {icon.icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setColorGradient(color.value)}
                      className={`w-6 h-6 rounded-lg border-2 bg-gradient-to-br ${color.value} transition-all ${colorGradient === color.value ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-800 p-6 flex gap-3 shrink-0 bg-slate-900/50 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl font-bold transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success || !title?.trim() || !target || target < 1}
              className={`flex-1 px-4 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 ${success
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 disabled:opacity-50 disabled:grayscale'
                }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={16} />
                  Ready!
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Launch Goal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
