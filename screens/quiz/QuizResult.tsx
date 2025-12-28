
import React from 'react';
import { Trophy, Star, RefreshCw, XCircle, ChevronRight, AlertCircle, Terminal } from 'lucide-react';
import { Screen } from '../../types';

interface QuizResultProps {
  score: number;
  total: number;
  xp: number;
  onContinue: () => void;
  onRetry: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({ score, total, xp, onContinue, onRetry }) => {
  const isPass = score === total;
  
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-500">
        <div className="relative">
          <div className={`absolute inset-0 blur-3xl rounded-full ${isPass ? 'bg-yellow-400/20' : 'bg-red-400/10'}`}></div>
          <div className={`relative w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-2xl ${
            isPass ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/20' : 'bg-slate-800'
          }`}>
            {isPass ? <Trophy size={64} className="text-white fill-current" /> : <XCircle size={64} className="text-red-400" />}
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-black text-white mb-2">
            {isPass ? 'Mastered! 🎉' : 'Keep Practicing'}
          </h1>
          <p className="text-slate-400 text-lg font-medium">
            {isPass ? 'You\'ve cleared the knowledge check.' : 'Review the lesson and try again!'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Score</p>
            <h3 className={`text-2xl font-black ${isPass ? 'text-white' : 'text-red-400'}`}>{score} / {total}</h3>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">XP Earned</p>
            <h3 className="text-2xl font-black text-indigo-400">+{isPass ? xp : 0} XP</h3>
          </div>
        </div>

        {!isPass && (
          <div className="flex items-center gap-3 p-4 bg-red-400/5 border border-red-400/10 rounded-2xl text-left">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400/80 font-medium">100% score required to move to the lab.</p>
          </div>
        )}

        <div className="space-y-4 pt-4">
          {isPass ? (
            <button 
              onClick={onContinue}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <Terminal size={20} />
              Continue to Practice Lab
              <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              onClick={onRetry}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all active:scale-95"
            >
              <RefreshCw size={18} />
              Retry Quiz
            </button>
          )}
          
          <button 
            onClick={() => window.history.back()}
            className="w-full py-4 border border-slate-800 text-slate-500 rounded-2xl font-bold text-lg transition-all hover:text-white"
          >
            Review Lesson
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
