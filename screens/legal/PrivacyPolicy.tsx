import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0b14] text-slate-300 py-12 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl">
                            <Shield className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Privacy Policy</h1>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Last updated: February 22, 2026</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6 text-sm leading-relaxed">
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">Introduction</h2>
                        <p>
                            Welcome to GenSpark. This Privacy Policy explains how we collect, use, and protect your information when you use our services,
                            including our AI-powered coding platform.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">Information We Collect</h2>
                        <p>
                            When you sign up using Google, we receive your name and email address from Google as part of the authentication process.
                            We also collect your progress and code snippets you save within the application to provide a personalized experience.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">How We Use Your Data</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>To provide and maintain our service.</li>
                            <li>To personalize your learning path.</li>
                            <li>To communicate with you regarding your account.</li>
                            <li>To provide customer support.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">Data Protection</h2>
                        <p>
                            Your data is stored securely using industry-standard encryption practices through Supabase. We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at support@genspark.app.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
