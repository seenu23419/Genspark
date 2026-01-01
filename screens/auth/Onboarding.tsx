
import React, { useState } from 'react';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim()) {
            setError("First name is required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await updateProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                onboardingCompleted: true
            });
            navigate('/', { replace: true });
        } catch (err: any) {
            setError(err.message || "Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl space-y-8">
                    <div className="text-center space-y-2">
                        <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10 shadow-xl shadow-indigo-600/20">
                            <Sparkles className="text-indigo-400" size={40} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Tell us about yourself</h2>
                        <p className="text-slate-400 font-medium">Your name will appear on certificates and achievements.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium animate-in shake duration-500">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">First Name *</label>
                                <input
                                    autoFocus
                                    required
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Enter first name"
                                    className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-white transition-all font-bold placeholder:text-slate-700"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Last Name (Optional)</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Enter last name"
                                    className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-white transition-all font-bold placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    Start Learning
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-slate-600 text-xs font-black uppercase tracking-[0.2em]">
                    Powered by GenSpark AI
                </p>
            </div>
        </div>
    );
};

export default Onboarding;
