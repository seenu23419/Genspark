import React from 'react';
import { Flame, Target, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DailyChallenge: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const streak = (user && (user as any).streak !== undefined) ? (user as any).streak || 0 : 0;

  return (
    <div className="bg-slate-900 border-2 border-slate-800 p-2 sm:p-3 md:p-6 md:p-8 rounded-lg md:rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-1.5 sm:gap-2 md:gap-4 hover:border-orange-500/30 transition-all shadow-xl">
      <div className="flex items-start md:items-center gap-1.5 sm:gap-2 md:gap-4 flex-1 w-full min-w-0">
        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 md:w-24 md:h-24 bg-orange-500/5 rounded-full border-2 md:border-4 border-orange-500/10 flex items-center justify-center text-orange-500 flex-shrink-0">
          <Flame className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 md:w-10 md:h-10" fill="currentColor" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[7px] sm:text-[8px] md:text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">Streak</p>
          <h3 className="text-sm sm:text-base md:text-2xl md:text-4xl font-black text-white leading-tight">{streak}d</h3>
          <p className="text-slate-400 text-[7px] sm:text-[8px] md:text-xs hidden md:block mt-0.5">Quick 10–15 min challenge</p>
        </div>
      </div>

      <div className="flex flex-col gap-1 sm:gap-1.5 md:gap-3 w-full md:w-auto min-w-0">
        <div className="text-left md:text-right text-[8px] sm:text-[9px] md:text-sm">
          <p className="text-slate-400 font-bold uppercase tracking-widest truncate">Today: Fix a loop</p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/practice');
          }}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg font-bold flex items-center justify-center md:justify-start gap-0.5 sm:gap-1 md:gap-2 text-[8px] sm:text-[9px] md:text-sm"
        >
          <Play size={10} className="sm:w-3 sm:h-3 md:w-4 md:h-4" /> Start
        </button>
      </div>
    </div>
  );
};

export default DailyChallenge;
