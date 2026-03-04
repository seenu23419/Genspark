import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
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
        <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8 md:space-y-12 pb-24 min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
            {/* Header */}
            <header className="space-y-6 px-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 hover:text-indigo-500 transition-all active:scale-95"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 md:gap-3 uppercase italic">
                                <Clock className="text-indigo-500 w-7 h-7 md:w-8 md:h-8" />
                                Activity History
                            </h1>
                            <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl">A chronological record of your learning journey.</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Activity History List */}
            <div className="space-y-4 px-1">
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
                            className={`group bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex items-center justify-between transition-all ${item.itemId || item.title.startsWith('Solved Challenge: ') ? 'cursor-pointer hover:border-indigo-500/30 active:scale-[0.99]' : ''}`}
                        >
                            <div className="space-y-2">
                                <h3 className="font-black text-slate-900 dark:text-white text-base md:text-lg uppercase italic tracking-tight">{item.title}</h3>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    <span>{new Date(item.date).toLocaleDateString()}</span>
                                    {item.language && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                            <span className="text-indigo-500">{item.language}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {item.executionTime ? (
                                <div className="text-right">
                                    <div className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black mb-1">Duration</div>
                                    <div className="font-black text-emerald-500 text-sm md:text-base">{item.executionTime}</div>
                                </div>
                            ) : (
                                <div className="text-slate-200 dark:text-slate-800">
                                    <Clock size={20} />
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-24 bg-white dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                        <Clock size={40} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                        <h3 className="text-xl font-black text-slate-400 dark:text-slate-700 uppercase italic tracking-tight">No record found</h3>
                        <p className="text-slate-500 text-sm font-medium mt-2">Start your learning journey to see history here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StreaksActivity;
