

import React, { useState, useEffect } from 'react';
import { User, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Onboarding: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("🎯 Onboarding: Component MOUNTED", { userId: user?._id, timestamp: Date.now() });
        return () => {
            console.log("🎯 Onboarding: Component UNMOUNTED", { userId: user?._id, timestamp: Date.now() });
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim()) {
            setError("First name is required.");
            return;
        }

        if (loading) return; // Prevent multiple submissions

        setLoading(true);
        setError(null);

        console.log("Onboarding: Submitting", { firstName, lastName });

        try {
            await updateProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                onboardingCompleted: true
            });
            console.log("Onboarding: Profile updated successfully, navigating to home");
            navigate('/', { replace: true });
        } catch (err: any) {
            console.error("Onboarding: Save failed", err);
            setError(err.message || "Failed to save profile. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0b14] flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col">
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-7 md:p-9 rounded-[2.5rem] shadow-2xl space-y-7">
                    <div className="text-center space-y-2">
                        <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto mb-5 ring-1 ring-white/10 shadow-xl shadow-indigo-600/20">
                            <Sparkles className="text-indigo-400" size={40} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Tell us about yourself</h2>
                        <p className="text-slate-400 font-medium text-sm">Your name will appear on certificates and achievements.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium animate-in shake duration-500">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-3.5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">First Name *</label>
                                <input
                                    autoFocus
                                    required
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Enter first name"
                                    className="w-full px-5 py-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none focus:border-slate-700 text-white transition-all font-bold placeholder:text-slate-600"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Last Name (Optional)</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Enter last name"
                                    className="w-full px-5 py-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none focus:border-slate-700 focus:bg-slate-900 text-white transition-all font-bold placeholder:text-slate-600 cursor-text"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !firstName.trim()}
                            className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 group disabled:opacity-60 disabled:shadow-none"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : (
                                <>
                                    Start Learning
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
