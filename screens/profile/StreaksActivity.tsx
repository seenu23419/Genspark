import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const StreaksActivity: React.FC = () => {
    const navigate = useNavigate();
    const { user, loadActivityHistory } = useAuth();

    // Trigger lazy-loading of detailed history if empty
    React.useEffect(() => {
        if (user && (!user.activity_history || user.activity_history.length === 0)) {
            loadActivityHistory();
        }
    }, [user, loadActivityHistory]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 space-y-10 animate-in fade-in duration-700 pb-12 font-sans w-full max-w-[1600px] mx-auto">
            {/* Header */}
            <header className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => navigate('/')}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight uppercase">History</h1>
                </div>
            </header>

            {/* Activity History List */}
            <div className="space-y-4">
                {user.activity_history && user.activity_history.length > 0 ? (
                    user.activity_history.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => {
                                const finalItemId = item.itemId || (item.title.startsWith('Solved Challenge: ') ? item.title.replace('Solved Challenge: ', '') : null);
                                if (item.type === 'practice' && finalItemId) {
                                    navigate(`/practice/problem/${finalItemId}`);
                                } else if (item.type === 'challenge' && finalItemId) {
                                    navigate(`/challenge/${finalItemId}`);
                                }
                            }}
                            className={`group relative bg-slate-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-500 transition-all ${item.itemId || item.title.startsWith('Solved Challenge: ') ? 'cursor-pointer hover:bg-slate-800/60 hover:border-white/10 active:scale-[0.99]' : ''}`}
                        >
                            <div className="space-y-1">
                                <h3 className="font-bold text-slate-200 text-sm">{item.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>{new Date(item.date).toLocaleString()}</span>
                                    {item.language && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                            <span className="uppercase">{item.language}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {item.executionTime && (
                                <div className="text-right">
                                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Time</div>
                                    <div className="font-mono text-emerald-400 font-bold text-sm">{item.executionTime}</div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-slate-600 italic">No activity history yet. Start coding!</div>
                )}
            </div>
        </div>
    );
};

export default StreaksActivity;
