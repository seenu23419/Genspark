
import React from 'react';
import { ArrowLeft, Play, Info, CheckCircle2, Star } from 'lucide-react';
import { Challenge } from '../../types';

interface ChallengeDetailProps {
  challenge: Challenge | null;
  onSolve: () => void;
}

const ChallengeDetail: React.FC<ChallengeDetailProps> = ({ challenge, onSolve }) => {
  if (!challenge) return null;

  return (
    <div className="h-full bg-slate-950 flex flex-col">
      <header className="p-4 border-b border-slate-800 bg-slate-900 flex items-center gap-4">
        <button onClick={() => window.history.back()} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-white">Challenge Description</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black text-white">{challenge.title}</h1>
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-2xl font-bold">
                <Star size={18} fill="currentColor" />
                {challenge.xp} XP
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold">
              <span className={`px-3 py-1 rounded-full uppercase tracking-widest ${
                challenge.difficulty === 'Easy' ? 'bg-emerald-400/10 text-emerald-400' :
                challenge.difficulty === 'Medium' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-red-400/10 text-red-400'
              }`}>
                {challenge.difficulty}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-500">1.2k Submissions</span>
            </div>
          </div>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Info className="text-indigo-400" size={20} />
              Problem Statement
            </h3>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-slate-300 leading-relaxed">
              {challenge.description}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white">Input Format</h3>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-slate-400 font-mono text-sm">
                {challenge.inputFormat}
              </div>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white">Output Format</h3>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-slate-400 font-mono text-sm">
                {challenge.outputFormat}
              </div>
            </section>
          </div>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white">Constraints</h3>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-slate-400 font-mono text-sm pt-1">{challenge.constraints}</p>
            </div>
          </section>

          <div className="pt-10 sticky bottom-0 bg-slate-950 pb-10">
            <button 
              onClick={onSolve}
              className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-bold text-xl flex items-center justify-center gap-4 hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95"
            >
              <Play size={24} fill="currentColor" />
              Solve in Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;
