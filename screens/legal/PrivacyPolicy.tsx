import React from 'react';
import { ChevronLeft, Shield, Lock, Eye, FileText, UserCheck, MessageSquare, Trash2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    const sections = [
        {
            id: 'intro',
            title: '1. Introduction',
            icon: <Shield className="text-indigo-400" size={24} />,
            content: "Welcome to GenSpark! We're committed to protecting your privacy while helping you learn programming. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data. By using GenSpark, you agree to the practices described in this policy."
        },
        {
            id: 'collect',
            title: '2. Information We Collect',
            icon: <Eye className="text-indigo-400" size={24} />,
            content: "We collect basic account info (Name, Email), learning progress (lessons completed, time spent), and practice results (code submissions, performance scores). We do NOT collect passwords, payment details, or biometric data."
        },
        {
            id: 'use',
            title: '3. How We Use Information',
            icon: <UserCheck className="text-indigo-400" size={24} />,
            content: "Your data is used to personalize your learning journey, track progress, generate verifiable certificates, and improve the app experience. We never sell your personal data to third parties."
        },
        {
            id: 'storage',
            title: '4. Data Storage and Security',
            icon: <Lock className="text-indigo-400" size={24} />,
            content: "All user information is stored securely using encrypted cloud services (Supabase/Google). We use industry-standard SSL/TLS encryption for data transmission to ensure your information remains private."
        },
        {
            id: 'third-party',
            title: '5. Third-Party Services',
            icon: <FileText className="text-indigo-400" size={24} />,
            content: "We use Google Sign-In for secure authentication and trusted cloud providers for hosting. These partners follow strict data protection standards."
        },
        {
            id: 'rights',
            title: '6. Your Rights',
            icon: <Trash2 className="text-indigo-400" size={24} />,
            content: "You have the right to access your data, request updates, or delete your account at any time. Account deletion results in permanent removal of all personal progress and certificates within 30 days."
        },
        {
            id: 'changes',
            title: '7. Policy Changes',
            icon: <MessageSquare className="text-indigo-400" size={24} />,
            content: "We may update this policy as GeSpark evolves. Significant changes will be announced via email or in-app notifications."
        }
    ];

    return (
        <div className="fixed inset-0 bg-slate-950 overflow-y-auto">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-4 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ChevronLeft size={20} className="text-slate-400" />
                </button>
                <h1 className="text-lg font-bold text-white">Privacy Policy</h1>
                <div className="w-9" /> {/* Spacer */}
            </header>

            <main className="max-w-2xl mx-auto px-6 py-10 space-y-12">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 rounded-2xl mb-2">
                        <Shield className="text-indigo-500" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Your Privacy Matters</h2>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">
                        We collect only what's necessary to make your learning journey successful. No fluff, no selling data.
                    </p>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-widest pt-2">
                        Last Updated: Jan 18, 2026
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid gap-8">
                    {sections.map((section) => (
                        <div key={section.id} className="group p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all">
                            <div className="flex items-start gap-4">
                                <div className="mt-1">{section.icon}</div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                        {section.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-3xl text-center space-y-4">
                    <h3 className="text-xl font-bold text-white">Have Questions?</h3>
                    <p className="text-slate-300 text-sm">
                        Our support team is here to help with any data or privacy concerns.
                    </p>
                    <a
                        href="mailto:support@genspark.app"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all"
                    >
                        <Mail size={18} />
                        support@genspark.app
                    </a>
                </div>

                <footer className="text-center pb-10">
                    <p className="text-slate-600 text-[10px] uppercase tracking-widest">
                        GenSpark Learning Platform • Student-First Education
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
