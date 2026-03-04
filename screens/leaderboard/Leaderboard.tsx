import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Flame, Zap, Star, TrendingUp, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseDB } from '../../services/supabaseService';

interface LeaderEntry {
    rank: number;
    name: string;
    avatar?: string;
    xp: number;
    streak: number;
    lessonsCompleted: number;
    isCurrentUser?: boolean;
}

const getLeague = (xp: number) => {
    if (xp >= 15000) return { name: 'Diamond', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: '💎' };
    if (xp >= 5000) return { name: 'Gold', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '👑' };
    if (xp >= 1000) return { name: 'Silver', color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: '⚔️' };
    return { name: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: '🛡️' };
};

const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={22} className="text-blue-500" />;
    if (rank === 2) return <Medal size={20} className="text-slate-400" />;
    if (rank === 3) return <Medal size={20} className="text-orange-700" />;
    return <span className="text-xs font-black text-slate-500 tabular-nums">#{rank}</span>;
};

const getRankBg = (rank: number) => {
    if (rank === 1) return 'border-blue-500/30 bg-blue-500/5 scale-105 z-10';
    if (rank === 2) return 'border-slate-400/30 bg-slate-400/5';
    if (rank === 3) return 'border-orange-700/30 bg-orange-700/5';
    return 'border-white/[0.08] bg-white/[0.02] hover:border-white/10';
};

const Leaderboard: React.FC = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState<'global' | 'weekly'>('global');
    const [entries, setEntries] = useState<LeaderEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                // Fetch all users to avoid limit issues and demo fallback
                const { data, error } = await supabaseDB.supabase
                    .from('users')
                    .select('*')
                    .order('xp', { ascending: false });

                if (error) {
                    console.error("Leaderboard Fetch Error:", error);
                    throw error;
                }

                if (!data || data.length === 0) {
                    console.warn("Leaderboard: No users found in database.");
                    setEntries([]);
                    return;
                }

                const mapped: LeaderEntry[] = data.map((u: any, i: number) => ({
                    rank: i + 1,
                    name: u.name || (u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : (u.email ? u.email.split('@')[0] : 'User')),
                    avatar: u.avatar || u.avatar_url,
                    xp: u.points !== undefined ? u.points : (u.xp || 0),
                    streak: u.streak || 0,
                    lessonsCompleted: (u.completed_lesson_ids || []).length,
                    isCurrentUser: u.id === user?._id,
                }));

                setEntries(mapped);
            } catch (err) {
                // Fallback demo data
                const demo: LeaderEntry[] = [
                    { rank: 1, name: 'Alex Chen', xp: 8420, streak: 42, lessonsCompleted: 91 },
                    { rank: 2, name: 'Priya Sharma', xp: 7180, streak: 29, lessonsCompleted: 78 },
                    { rank: 3, name: 'Marcus Kim', xp: 6550, streak: 21, lessonsCompleted: 72 },
                    { rank: 4, name: 'Sofia Rodriguez', xp: 5890, streak: 18, lessonsCompleted: 65 },
                    { rank: 5, name: 'James Okafor', xp: 5200, streak: 15, lessonsCompleted: 58 },
                    { rank: 6, name: user?.name || 'You', xp: user?.xp || 1200, streak: user?.streak || 3, lessonsCompleted: user?.lessonsCompleted || 12, isCurrentUser: true },
                    { rank: 7, name: 'Yuki Tanaka', xp: 4100, streak: 12, lessonsCompleted: 50 },
                    { rank: 8, name: 'Lila Petrov', xp: 3760, streak: 8, lessonsCompleted: 44 },
                    { rank: 9, name: 'David Nguyen', xp: 3200, streak: 7, lessonsCompleted: 40 },
                    { rank: 10, name: 'Amara Diallo', xp: 2880, streak: 5, lessonsCompleted: 35 },
                ];
                setEntries(demo);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [tab, user]);

    const currentUserEntry = entries.find(e => e.isCurrentUser);
    const topThree = entries.slice(0, 3);
    const rest = entries.slice(3);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white pb-28 transition-colors duration-300">
            <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-[11px] font-semibold text-slate-500 tracking-tight animate-pulse uppercase">Syncing Rankings...</p>
                    </div>
                ) : (
                    <>
                        {/* 1. Podium Section */}
                        <div className="flex items-end justify-center gap-4 mb-16 px-2 pt-12">
                            {/* 2nd Place */}
                            {topThree[1] && (
                                <div className="flex-1 flex flex-col items-center group animate-in slide-in-from-bottom-8 duration-700 delay-200">
                                    <div className="relative mb-4">
                                        <div className="w-28 h-28 rounded-full border-2 border-slate-300 dark:border-white/10 p-1.5 transition-transform group-hover:scale-105">
                                            <div className="w-full h-full rounded-full bg-white dark:bg-[#1e293b] overflow-hidden flex items-center justify-center border border-slate-100 dark:border-white/[0.05]">
                                                {topThree[1].avatar ? <img src={topThree[1].avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-3xl font-black text-slate-400">{topThree[1].name[0]}</span>}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-xs font-black text-white border-2 border-white dark:border-[#0f172a]">
                                            2
                                        </div>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate tracking-tight">{topThree[1].name}</p>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/20`}>
                                            {getLeague(topThree[1].xp).icon} {topThree[1].xp.toLocaleString()} Pts
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 1st Place */}
                            {topThree[0] && (
                                <div className="flex-1 flex flex-col items-center group -translate-y-6 animate-in slide-in-from-bottom-12 duration-1000">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-blue-500/10 blur-[40px] rounded-full animate-pulse" />
                                        <div className="absolute -top-4 -right-1 z-20">
                                            <Crown size={28} className="text-blue-500 fill-blue-500" />
                                        </div>
                                        <div className="w-36 h-36 rounded-full border-[3px] border-blue-500 p-2 transition-transform group-hover:scale-105 duration-500 relative bg-[#1e293b]">
                                            <div className="w-full h-full rounded-full bg-white dark:bg-[#1e293b] overflow-hidden flex items-center justify-center border border-slate-100 dark:border-white/[0.05]">
                                                {topThree[0].avatar ? <img src={topThree[0].avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-5xl font-black text-blue-500 italic uppercase">{topThree[0].name[0]}</span>}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-lg font-black text-white border-4 border-white dark:border-[#0f172a]">
                                            1
                                        </div>
                                    </div>
                                    <div className="text-center space-y-1.5 z-10">
                                        <p className="text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight">{topThree[0].name}</p>
                                        <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20`}>
                                            {getLeague(topThree[0].xp).icon} {topThree[0].xp.toLocaleString()} Points
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {topThree[2] && (
                                <div className="flex-1 flex flex-col items-center group animate-in slide-in-from-bottom-8 duration-700 delay-500">
                                    <div className="relative mb-4">
                                        <div className="w-28 h-28 rounded-full border-2 border-orange-800/50 p-1.5 transition-transform group-hover:scale-105">
                                            <div className="w-full h-full rounded-full bg-white dark:bg-[#1e293b] overflow-hidden flex items-center justify-center border border-slate-100 dark:border-white/[0.05]">
                                                {topThree[2].avatar ? <img src={topThree[2].avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-3xl font-black text-orange-800 uppercase">{topThree[2].name[0]}</span>}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-800 flex items-center justify-center text-xs font-black text-white border-2 border-white dark:border-[#0f172a]">
                                            3
                                        </div>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate tracking-tight">{topThree[2].name}</p>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-orange-500/5 text-orange-400 border border-orange-500/10`}>
                                            {getLeague(topThree[2].xp).icon} {topThree[2].xp.toLocaleString()} Pts
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. List Section */}
                        <div className="mt-8 space-y-2 pb-32 px-2">
                            {rest.map((entry) => (
                                <div
                                    key={entry.rank}
                                    className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 ${entry.isCurrentUser
                                        ? 'card-active z-10'
                                        : 'card-base'
                                        }`}
                                >
                                    <div className="w-10 flex items-center justify-center shrink-0">
                                        {getRankIcon(entry.rank)}
                                    </div>
                                    <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                                        {entry.avatar ? (
                                            <img src={entry.avatar} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center text-xs font-black uppercase ${['bg-blue-600', 'bg-emerald-600', 'bg-indigo-600', 'bg-violet-600', 'bg-cyan-600'][entry.rank % 5]} text-white`}>
                                                {entry.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-[14px] font-bold truncate tracking-tight ${entry.isCurrentUser ? 'text-blue-500' : 'text-slate-900 dark:text-slate-100'}`}>
                                                {entry.name}
                                            </p>
                                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest bg-white/5 border border-white/10 ${getLeague(entry.xp).color}`}>
                                                {getLeague(entry.xp).name}
                                            </span>
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-0.5">Level {(Math.floor(entry.xp / 1000) + 1)} Professional</p>
                                    </div>
                                    <div className="shrink-0">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-lg">
                                            <Zap size={14} className="text-blue-500" />
                                            <span className="text-[13px] font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{entry.xp.toLocaleString()} XP</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 3. Sticky Current User Rank */}
                        {!entries.slice(0, 20).find(e => e.isCurrentUser) && user && (
                            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-2xl z-20">
                                <div className="bg-blue-600 text-white rounded-2xl px-6 py-4 flex items-center gap-4 border border-blue-400/30">
                                    <div className="w-8 text-sm font-bold tracking-tight shrink-0 text-center text-blue-200">
                                        -
                                    </div>
                                    <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 overflow-hidden flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold">{user.name?.[0] || user.firstName?.[0] || 'U'}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] font-bold truncate tracking-tight">Your Progress</p>
                                        <p className="text-xs font-medium text-blue-100">Keep climbing to reach the top!</p>
                                    </div>
                                    <div className="shrink-0 flex items-center justify-center min-w-[75px] bg-white/20 rounded-full py-1.5 px-4">
                                        <span className="text-[13px] font-black">{user.xp || 0} XP</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
