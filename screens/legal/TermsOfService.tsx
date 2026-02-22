import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0b14] text-slate-300 py-12 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl">
                            <FileText className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Terms of Service</h1>
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
                        <h2 className="text-lg font-bold text-white">Acceptance of Terms</h2>
                        <p>
                            By accessing or using GenSpark, you agree to be bound by these Terms of Service. If you do not agree to all of the terms,
                            you may not use our services.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">User Responsibility</h2>
                        <p>
                            You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
                            Our services are intended for learning purposes.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">Intellectual Property</h2>
                        <p>
                            The application content, features, and functionality are and will remain the exclusive property of GenSpark.
                            Our platform allows you to create and save code snippets for your personal educational use.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">Termination</h2>
                        <p>
                            We may terminate or suspend your account at any time, without prior notice or liability, for any reason, including if you breach the Terms.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">Changes to Terms</h2>
                        <p>
                            We reserve the right to modify or replace these Terms at any time. We will notify you of any significant changes by posting the new Terms on our platform.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
