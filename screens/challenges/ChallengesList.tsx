
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Filter, Star, Code2, ChevronRight, Search, ArrowLeft } from 'lucide-react';
import { CHALLENGES } from '../../constants';
import { Challenge } from '../../types';

interface ChallengesListProps {
  onSelect?: (challenge: Challenge) => void;
  onBack?: () => void;
}

const ChallengesList: React.FC<ChallengesListProps> = ({ onSelect, onBack: propOnBack }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  const filtered = useMemo(() => {
    return filter === 'All'
      ? CHALLENGES
      : CHALLENGES.filter(c => c.difficulty === filter);
  }, [filter]);

  const handleBack = () => {
    if (propOnBack) propOnBack();
    else navigate('/');
  };

  const handleSelect = (challenge: Challenge) => {
    if (onSelect) onSelect(challenge);
    else navigate(`/challenge/${challenge.id}`);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-400 bg-emerald-400/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'Hard': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Trophy className="text-yellow-500" />
              Coding Challenges
            </h1>
            <p className="text-slate-400">Put your problem-solving skills to the test</p>
          </div>
        </div>

        <div className="bg-slate-900 p-1.5 rounded-2xl flex gap-1 self-start">
          {['All', 'Easy', 'Medium', 'Hard'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((challenge) => (
          <div
            key={challenge.id}
            onClick={() => handleSelect(challenge)}
            className="group bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${getDifficultyColor(challenge.difficulty)}`}>
                <Code2 size={28} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{challenge.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-500 text-sm">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" fill="currentColor" />
                    {challenge.xp} XP
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy size={14} />
                    84% Success Rate
                  </span>
                </div>
              </div>
            </div>

            <button className="flex items-center justify-center gap-2 bg-slate-800 text-slate-200 px-6 py-3 rounded-2xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all active:scale-95">
              Solve Problem
              <ChevronRight size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengesList;
