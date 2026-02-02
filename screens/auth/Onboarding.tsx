
import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, ArrowRight, Loader2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Onboarding: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-capitalize helper
    const capitalize = (val: string) => {
        return val.charAt(0).toUpperCase() + val.slice(1);
    };

    // Validation Logic
    // Minimum 2 characters, Alphabetic only
    const firstNameError = useMemo(() => {
        if (firstName.length === 0) return null;
        if (firstName.length < 2) return "Minimum 2 characters required";
        if (!/^[A-Za-z]+$/.test(firstName)) return "Alphabetic characters only";
        return null;
    }, [firstName]);

    const isValid = firstName.length >= 2 && !firstNameError;

    useEffect(() => {
        console.log("🎯 Onboarding: Component MOUNTED", { userId: user?._id, timestamp: Date.now() });
    }, [user?._id]);

    const handleAction = async (isSkip: boolean) => {
        if (loading) return;
        setLoading(true);
        setError(null);

        console.log('🎯 [ONBOARDING] handleAction called', { isSkip, userId: user?._id });

        try {
            const updates = isSkip
                ? { onboardingCompleted: true }
                : {
                    firstName: capitalize(firstName.trim()),
                    lastName: lastName ? capitalize(lastName.trim()) : '',
                    onboardingCompleted: true
                };

            console.log('🎯 [ONBOARDING] Calling updateProfile with:', updates);
            await updateProfile(updates);
            console.log('✅ [ONBOARDING] updateProfile completed successfully');

            // Force immediate navigation
            console.log('🚀 [ONBOARDING] Forcing navigation to home');
            navigate('/', { replace: true });

            // Fallback: If navigation doesn't work, force reload to home
            setTimeout(() => {
                console.warn('⚠️ [ONBOARDING] Timeout reached, forcing window location change');
                window.location.href = '/';
            }, 2000);
        } catch (err: any) {
            console.error('❌ [ONBOARDING] Error in handleAction:', err);
            setError(err.message || "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050714] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col space-y-8">

                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
                            <UserIcon className="text-white" size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Set up your profile</h2>
                        <p className="text-[10px] text-indigo-400 font-bold opacity-80 bg-indigo-500/10 py-0.5 px-2 rounded-full inline-block">APP VERSION: 3.5</p>
                        <div className="space-y-1">
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Used for certificates and your profile.
                            </p>
                            <p className="text-slate-500 text-xs italic">
                                You can change this anytime later.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <div className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">First Name (Required)</label>
                                <div className="relative group">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(capitalize(e.target.value))}
                                        placeholder="e.g. Alex"
                                        className={`w-full px-5 py-4 bg-[#010409] border ${firstNameError ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'} rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:outline-none focus:border-indigo-500/50 text-white transition-all font-medium placeholder:text-slate-700`}
                                    />
                                    {firstNameError && (
                                        <p className="text-[10px] text-red-400 mt-1.5 ml-1 font-medium animate-in slide-in-from-top-1">
                                            {firstNameError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Last Name (Optional)</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(capitalize(e.target.value))}
                                    placeholder="e.g. Smith"
                                    className="w-full px-5 py-4 bg-[#010409] border border-white/10 hover:border-white/20 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:outline-none focus:border-indigo-500/50 text-white transition-all font-medium placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4 pt-2">
                            <button
                                onClick={() => handleAction(false)}
                                disabled={loading || !isValid}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-bold text-base transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 group"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : (
                                    <>
                                        Start Learning [V4.0]
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => handleAction(true)}
                                disabled={loading}
                                className="w-full py-2 text-slate-500 hover:text-slate-400 text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
