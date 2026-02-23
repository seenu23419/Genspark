import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
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
                            <FileText className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Terms of Service</h1>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Last updated: February 22, 2026</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-8 text-sm leading-relaxed text-slate-400">
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white border-l-2 border-indigo-500 pl-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using GenSpark ("the Service"), you agree to be bound by these Terms of Service and all applicable laws.
                            If you do not agree to these terms, you must immediately cease all use of the Service.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white border-l-2 border-indigo-500 pl-3">2. User Accounts & Security</h2>
                        <p>
                            You are responsible for safeguarding the credentials used to access the Service. GenSpark cannot and will not be liable for any loss or damage
                            arising from your failure to comply with the above. We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white border-l-2 border-indigo-500 pl-3">3. Educational Use Only</h2>
                        <p>
                            The Service is provided for educational and informational purposes. While we strive for accuracy, the coding exercises, compiler results,
                            and AI-generated explanations are provided "as-is" and "as-available." We do not guarantee that the Service will meet your specific educational requirements.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white border-l-2 border-indigo-500 pl-3">4. Intellectual Property</h2>
                        <p>
                            GenSpark and its original content, features, and functionality are owned by GenSpark. Users retain ownership of the code snippets they produce
                            using the Service but grant GenSpark a worldwide, non-exclusive, royalty-free license to store, execute, and display such snippets for Service operation.
                        </p>
                    </section>

                    <section className="space-y-3 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                            Disclaimer of Warranties
                        </h2>
                        <p className="font-medium text-slate-300">
                            THE SERVICE IS PROVIDED WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,
                            IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. GENSPARK DOES NOT WARRANT
                            THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                        </p>
                    </section>

                    <section className="space-y-3 p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                            Limitation of Liability
                        </h2>
                        <p className="font-medium text-slate-300">
                            IN NO EVENT SHALL GENSPARK BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES,
                            INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF YOUR ACCESS TO
                            OR USE OF THE SERVICE.
                        </p>
                    </section>

                    <section className="space-y-3 pt-6 border-t border-slate-800">
                        <p className="text-xs text-slate-500 font-bold italic">
                            GenSpark operates in compliance with standard industry regulations. For inquiries regarding these terms, please contact legal@genspark.app.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
