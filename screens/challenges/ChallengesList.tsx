import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, Code2, ChevronRight, ArrowLeft, Target, Zap, Plus, Users, Trash2 } from 'lucide-react';
import { CHALLENGES as STATIC_CHALLENGES } from '../../constants';
import { Challenge } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import BannerAd from '../../components/BannerAd';

interface ChallengesListProps {
  onSelect?: (challenge: Challenge) => void;
  onBack?: () => void;
}

const ChallengesList: React.FC<ChallengesListProps> = ({ onSelect, onBack: propOnBack }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard' | 'Community'>('All');
  const [communityChallenges, setCommunityChallenges] = useState<Challenge[]>([]);

  const loadCommunityChallenges = () => {
    try {
      const local = JSON.parse(localStorage.getItem('user_created_challenges') || '[]');
      setCommunityChallenges(local);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    loadCommunityChallenges();
  }, []);

  const handleDeleteCommunity = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this Arena? This cannot be undone.")) return;

    try {
      const local = JSON.parse(localStorage.getItem('user_created_challenges') || '[]');
      const updated = local.filter((c: any) => c.id !== id);
      localStorage.setItem('user_created_challenges', JSON.stringify(updated));
      setCommunityChallenges(updated);
    } catch (err) {
      console.error("Failed to delete challenge", err);
    }
  };

  const allChallenges = useMemo(() => [...STATIC_CHALLENGES, ...communityChallenges], [communityChallenges]);

  const filtered = useMemo(() => {
    if (filter === 'All') return allChallenges;
    if (filter === 'Community') return communityChallenges;
    return allChallenges.filter(c => c.difficulty === filter);
  }, [filter, allChallenges, communityChallenges]);

  const handleBack = () => {
    if (propOnBack) propOnBack();
    else navigate('/');
  };

  const handleSelect = (challenge: Challenge) => {
    if (onSelect) onSelect(challenge);
    else navigate(`/challenge/${challenge.id}`);
  };

  const getDifficultyStyles = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium': return 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Hard': return 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-500 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white pb-24 font-sans selection:bg-blue-500/30 transition-colors duration-300">
      {/* 1. Header (Static) */}
      <div className="shrink-0 bg-transparent px-6 pt-2 pb-2 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 pt-4">
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Trophy size={24} className="text-blue-500" /> Arenas
                </h1>
              </div>
            </div>
            <div className="text-right pb-1 flex flex-col items-end">
              <button
                onClick={() => navigate('/challenge/create')}
                className="mb-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Plus size={14} />
                Architect Arena
              </button>
              <span className="text-[10px] font-black text-slate-500 tracking-wide shrink-0 uppercase">
                {allChallenges.length} Active targets
              </span>
            </div>
          </div>
          {/* Progress Bar (Visual filler to match Practice Hub) */}
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-900/60 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-full opacity-20" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-4">
        <BannerAd slot="challenges-list-banner" style={{ borderRadius: '1.5rem', overflow: 'hidden' }} />
      </div>

      {/* 2. Filter Selector (Sticky) */}
      <div className="shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-white/[0.08] mt-4">
        <div className="px-6 py-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2">
            {['All', 'Easy', 'Medium', 'Hard', 'Community'].map((f) => {
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className="shrink-0 flex flex-col items-center gap-1.5 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-1.5">
                    {f === 'Community' && <Users size={12} className={isActive ? 'text-blue-500' : 'text-slate-500'} />}
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-blue-600 dark:text-white' : 'text-slate-500 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-400'}`}>
                      {f}
                    </span>
                  </div>
                  <div className={`h-0.5 rounded-full transition-all duration-300 ${isActive ? 'w-full bg-blue-500' : 'w-0 bg-transparent'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Challenges List */}
      <div className="bg-transparent pb-32">
        <div className="px-6 py-8 max-w-7xl mx-auto">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((challenge, idx) => (
                <div
                  key={challenge.id}
                  onClick={() => handleSelect(challenge)}
                  className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 relative transition-all active:scale-[0.98] cursor-pointer group hover:bg-white dark:hover:bg-[#243147] hover:border-blue-500/30"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-5 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 group-hover:scale-105 ${getDifficultyStyles(challenge.difficulty).split(' ')[0]}`}>
                        <span className="text-lg font-bold tracking-tight">{idx + 1}</span>
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors capitalize truncate">
                            {challenge.title.toLowerCase()}
                          </h3>
                          <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase border tracking-widest ${getDifficultyStyles(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Star size={10} className="text-amber-500" />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 tracking-wide uppercase">{challenge.xp} Points</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            {(challenge as any).isUserCreated ? (
                              <>
                                <Users size={10} className="text-emerald-400" />
                                <span className="text-[10px] font-black tracking-wide uppercase text-emerald-500/80">Community Built</span>
                              </>
                            ) : (
                              <>
                                <Zap size={10} className="text-blue-400" />
                                <span className="text-[10px] font-bold tracking-wide uppercase">Core Arena</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-4">
                      {(challenge as any).isUserCreated && (challenge as any).creatorId === user?._id && (
                        <button
                          onClick={(e) => handleDeleteCommunity(e, challenge.id)}
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90 border border-transparent hover:border-red-500/20"
                          title="Delete Arena"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <div className="text-right hidden sm:block mr-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocol</p>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">Active</p>
                      </div>
                      <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 group-hover:bg-blue-600 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white transition-all duration-300">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400 mb-6 border border-slate-200 dark:border-white/5">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-800 tracking-tight">No Arenas Detected</h3>
              <p className="text-slate-400 dark:text-slate-500 text-[11px] font-semibold tracking-wide mt-2 italic">Adjust your filters to find targets.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengesList;

