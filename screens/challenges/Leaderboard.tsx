
import React, { useState, useEffect } from 'react';
import { Trophy, User as UserIcon, Medal, Crown, Star, ArrowLeft, Search, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseService';

const Leaderboard: React.FC = () => {
    const navigate = useNavigate();
    const [topUsers, setTopUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .order('xp', { ascending: false });

                if (error) {
                    console.error("Challenges Leaderboard Error:", error);
                    throw error;
                }
                const formattedData = (data || []).map(u => ({
                    ...u,
                    name: u.name || (u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : (u.email ? u.email.split('@')[0] : 'Anonymous')),
                    avatar: u.avatar || u.avatar_url,
                    xp: u.points !== undefined ? u.points : (u.xp || 0)
                }));
                setTopUsers(formattedData);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankStyles = (index: number) => {
        switch (index) {
            case 0: return { icon: <Crown size={32} className="text-amber-400" />, bg: 'bg-amber-500/10 border-amber-500/30' };
            case 1: return { icon: <Medal size={28} className="text-slate-300" />, bg: 'bg-slate-300/10 border-slate-300/20' };
            case 2: return { icon: <Medal size={28} className="text-orange-500" />, bg: 'bg-orange-500/10 border-orange-500/20' };
            default: return { icon: <span className="text-slate-600 font-black text-xs uppercase tracking-widest">#{index + 1}</span>, bg: 'bg-white/5 border-white/5' };
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-32">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-amber-600/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-10 relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="space-y-1">
                            <h1 className="text-4xl font-bold tracking-tight leading-none flex items-center gap-3">
                                <Trophy className="text-amber-500" size={32} />
                                Global <span className="text-indigo-500 font-semibold text-3xl">Rankings</span>
                            </h1>
                            <p className="text-slate-500 text-[11px] font-semibold tracking-wide">Top 50 Learning Protocols</p>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full" />
                        </div>
                        <p className="text-slate-600 font-semibold text-[11px] tracking-widest animate-pulse uppercase">Scanning Network...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {topUsers.length > 0 ? topUsers.map((user, index) => {
                            const styles = getRankStyles(index);
                            const isTop3 = index < 3;

                            return (
                                <div
                                    key={user.id}
                                    className={`group relative flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all duration-500 ${styles.bg} ${isTop3 ? 'border-amber-500/40' : 'hover:border-white/20'}`}
                                >
                                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                                        {styles.icon}
                                    </div>

                                    <div className="relative shrink-0">
                                        {user.avatar ? (
                                            <img src={user.avatar} className="w-14 h-14 rounded-2xl object-cover border border-white/10" alt="" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                                                <UserIcon size={24} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
                                            </div>
                                        )}
                                        {isTop3 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-4 border-[#050505] flex items-center justify-center">
                                                <Star size={8} fill="currentColor" className="text-black" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors truncate capitalize">
                                            {(user.name || 'Anonymous Unit').toLowerCase()}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <div className="flex items-center gap-1.5">
                                                <Zap size={10} className="text-indigo-400" />
                                                <span className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase">Streak: {user.streak || 0}d</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Target size={10} className="text-emerald-400" />
                                                <span className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase">Lvl {Math.floor((user.xp || 0) / 100) + 1}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-white tracking-tighter">{user.xp || 0}</div>
                                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Points</div>
                                    </div>

                                    {/* Glass Highlight */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[2.5rem]" />
                                </div>
                            );
                        }) : (
                            <div className="bg-white/5 border border-dashed border-white/10 rounded-[3rem] p-20 text-center">
                                <Search className="text-slate-800 mx-auto mb-6" size={48} />
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">No Rankings Detected</h3>
                                <p className="text-slate-500 text-[11px] font-semibold tracking-wide mt-2">Rankings will appear as objectives are completed.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
