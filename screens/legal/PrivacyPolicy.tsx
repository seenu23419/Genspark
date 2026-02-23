import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0b14] text-slate-300 py-12 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                    <Link
                        to="/login"
                        className="p-3 hover:bg-white/10 rounded-full transition-all bg-white/5 shrink-0 group"
                        title="Go back to Login"
                    >
                        <ArrowLeft size={24} className="text-white group-hover:scale-110 transition-transform" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl hidden sm:block">
                            <ShieldCheck className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Privacy Policy</h1>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Last updated: February 23, 2026</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-8 text-sm leading-relaxed text-slate-400">
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white border-l-2 border-indigo-500 pl-3">1. Information We Collect</h2>
                        <p>
                            We collect basic account information (email, name) and learning progress data (lessons completed, quiz scores, code snapshots).
                            All information is stored securely to provide you with a personalized educational experience.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white border-l-2 border-indigo-500 pl-3">2. AI-Powered Learning Assistance</h2>
                        <p>
                            GenSpark integrates advanced AI models (including Google Gemini) to provide real-time code explanations and debugging assistance.
                            When you request AI help, the Service sends your current code snippet and lesson context to these third-party providers.
                            No personally identifiable information (PII) is shared with AI providers for training or marketing purposes.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white border-l-2 border-indigo-500 pl-3">3. Cookies & Local Storage</h2>
                        <p>
                            We use `localStorage` to save your learning progress, current code snippets (autosave), and session state on your device.
                            This allows for instant recovery and a seamless learning experience. We do not use cross-site tracking cookies.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white border-l-2 border-indigo-500 pl-3">4. Data Protection & Security</h2>
                        <p>
                            Your data is stored securely using industry-standard encryption through Supabase. We do not sell your personal data to third parties.
                            All transmissions are encrypted via SSL/TLS for your protection.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white border-l-2 border-indigo-500 pl-3">5. Your Rights</h2>
                        <p>
                            You have the right to access, export, or delete your data at any time. Account deletion is permanent and can be requested through
                            your profile settings.
                        </p>
                    </section>

                    <section className="space-y-3 pt-6 border-t border-slate-800">
                        <p className="text-xs text-slate-500 font-bold italic">
                            By using GenSpark, you acknowledge and agree to the transparency measures outlined in this policy.
                            For data requests, contact support@genspark.app.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
