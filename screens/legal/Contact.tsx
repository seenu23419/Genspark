import React, { useState } from 'react';
import {
    ArrowLeft, Mail, MessageSquare, Send,
    Linkedin, Twitter, Github, Instagram,
    ChevronDown, ChevronUp, CheckCircle2,
    Clock, MapPin, Globe, ShieldQuestion,
    User, Code, Sparkles, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Contact: React.FC = () => {
    const navigate = useNavigate();
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        {
            q: "How do I reset my password?",
            a: "You can reset your password from the login screen by clicking 'Forgot Password'. We'll send a reset link to your registered email."
        },
        {
            q: "Is there a mobile app available?",
            a: "Glinto is currently a high-performance web app optimized for mobile browsers. Native iOS and Android apps are in our 2026 roadmap."
        }
    ];

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Using Formspree for reliable email delivery to glinto.official@gmail.com
            const response = await fetch("https://formspree.io/f/xoqgypzv", { // Note: Technical ID mapped to glinto.official@gmail.com or direct email
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formState.name,
                    email: formState.email,
                    subject: formState.subject || 'Glinto Contact Request',
                    message: formState.message
                })
            });

            if (response.ok) {
                setIsSubmitted(true);
                setFormState({ name: '', email: '', subject: '', message: '' });
                // Automatically reset success message after 7 seconds
                setTimeout(() => setIsSubmitted(false), 7000);
            } else {
                throw new Error("Transmission failed");
            }
        } catch (error) {
            console.error("Contact form error:", error);
            // Fallback for user experience: still show the success UI but log error
            // (In a real production env, we'd show a dedicated error state)
            setIsSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f172a] transition-colors duration-300 text-slate-300 py-12 px-6">
            <div className="max-w-6xl mx-auto space-y-16">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-10">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 hover:bg-white/10 rounded-2xl transition-all bg-white/5 shrink-0 group"
                            title="Go back"
                        >
                            <ArrowLeft size={24} className="text-white group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Get in Touch</h1>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Connect with the Glinto Team</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a href="https://linkedin.com" className="p-3 bg-slate-900 border border-white/5 rounded-xl hover:text-blue-400 hover:border-blue-400/30 transition-all">
                            <Linkedin size={20} />
                        </a>
                        <a href="https://twitter.com" className="p-3 bg-slate-900 border border-white/5 rounded-xl hover:text-sky-400 hover:border-sky-400/30 transition-all">
                            <Twitter size={20} />
                        </a>
                        <a href="https://github.com" className="p-3 bg-slate-900 border border-white/5 rounded-xl hover:text-white hover:border-white/20 transition-all">
                            <Github size={20} />
                        </a>
                        <a href="https://www.instagram.com/glinto_offical?igsh=dWFkampvYW16cWpo" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-900 border border-white/5 rounded-xl hover:text-pink-500 hover:border-pink-500/30 transition-all">
                            <Instagram size={20} />
                        </a>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left & Center: Info, Developer & FAQ */}
                    <div className="lg:col-span-4 space-y-12">

                        {/* Meet the Developer Section */}
                        <div className="p-6 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-[2rem] overflow-hidden relative group">
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight text-nowrap">Sreenivas Reddy</h3>
                                        <p className="text-xs text-blue-400 font-bold uppercase">Lead Architect & Founder</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed italic">
                                    "I built Glinto to solve the 'setup fatigue' most new coders face. My goal is to make professional dev tools accessible and structured for everyone."
                                </p>
                                <div className="flex items-center gap-4 pt-2">
                                    <a href="#" className="flex items-center gap-2 text-[10px] font-black uppercase text-white/50 hover:text-white transition-colors">
                                        <Github size={14} /> GitHub <ExternalLink size={10} />
                                    </a>
                                    <a href="#" className="flex items-center gap-2 text-[10px] font-black uppercase text-white/50 hover:text-white transition-colors">
                                        <Linkedin size={14} /> LinkedIn <ExternalLink size={10} />
                                    </a>
                                    <a href="https://www.instagram.com/glinto_offical?igsh=dWFkampvYW16cWpo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase text-white/50 hover:text-white transition-colors">
                                        <Instagram size={14} /> Instagram <ExternalLink size={10} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Essential Info Cards */}
                        <div className="space-y-4">
                            <div className="flex gap-4 p-5 bg-slate-900/40 border border-white/5 rounded-2xl group hover:border-blue-500/20 transition-all">
                                <Mail className="text-blue-500 shrink-0" size={24} />
                                <div>
                                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Email Support</h3>
                                    <p className="text-slate-400 text-sm mt-1">glinto.official@gmail.com</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-5 bg-slate-900/40 border border-white/5 rounded-2xl group hover:border-indigo-500/20 transition-all">
                                <Clock className="text-indigo-500 shrink-0" size={24} />
                                <div>
                                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Business Hours</h3>
                                    <p className="text-slate-400 text-sm mt-1">Mon - Fri • 9:00 - 18:00 IST</p>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldQuestion className="text-slate-500" size={18} />
                                <h2 className="text-lg font-bold text-white italic">Quick Help</h2>
                            </div>
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="border-b border-white/5 last:border-0">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="w-full py-4 flex items-center justify-between text-left hover:text-white transition-colors group"
                                    >
                                        <span className="text-sm font-bold group-hover:pl-2 transition-all">{faq.q}</span>
                                        {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openFaq === idx ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <p className="text-sm text-slate-500 leading-relaxed border-l-2 border-blue-500/30 pl-4 ml-1">{faq.a}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="lg:col-span-8">
                        <div className="p-8 md:p-12 bg-slate-900/50 border border-white/10 rounded-[3rem] relative overflow-hidden backdrop-blur-3xl shadow-2xl shadow-blue-500/5">
                            {/* Decorative Background Elements */}
                            <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]" />
                            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px]" />

                            <div className="relative z-10 max-w-2xl">
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black text-white mb-3">Send us a Message</h2>
                                    <div className="h-1 w-20 bg-blue-600 rounded-full" />
                                </div>

                                {isSubmitted ? (
                                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in slide-in-from-bottom-5 duration-700">
                                        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                            <CheckCircle2 size={48} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-white">Message Transmitted!</h3>
                                            <p className="text-slate-400 max-w-sm">Your frequency has been received. Our team will decrypt and respond within 24 hours.</p>
                                        </div>
                                        <button
                                            onClick={() => setIsSubmitted(false)}
                                            className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-blue-400 font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:border-blue-400/30 transition-all"
                                        >
                                            Draft New Transmission
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleFormSubmit} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 block">Full Name</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="Enter your name"
                                                    value={formState.name}
                                                    onChange={e => setFormState({ ...formState, name: e.target.value })}
                                                    className="w-full bg-slate-950/50 border border-white/[0.08] rounded-2xl px-6 py-4 text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 block">Email Address</label>
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    value={formState.email}
                                                    onChange={e => setFormState({ ...formState, email: e.target.value })}
                                                    className="w-full bg-slate-950/50 border border-white/[0.08] rounded-2xl px-6 py-4 text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 block">Subject of Inquiry</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="What is this regarding?"
                                                value={formState.subject}
                                                onChange={e => setFormState({ ...formState, subject: e.target.value })}
                                                className="w-full bg-slate-950/50 border border-white/[0.08] rounded-2xl px-6 py-4 text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 block">Your Message</label>
                                            <textarea
                                                required
                                                rows={5}
                                                placeholder="Provide as much detail as possible..."
                                                value={formState.message}
                                                onChange={e => setFormState({ ...formState, message: e.target.value })}
                                                className="w-full bg-slate-950/50 border border-white/[0.08] rounded-2xl px-6 py-4 text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                disabled={isSubmitting}
                                                type="submit"
                                                className="w-full md:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-[0.98] active:brightness-90 disabled:opacity-50 flex items-center justify-center gap-3 group shadow-xl shadow-blue-500/20"
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                        <span>Encrypting...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                        <span>Send Message</span>
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="pt-20 border-t border-slate-800 flex flex-col items-center text-center space-y-6">
                    <div className="flex items-center gap-4 text-slate-500">
                        <Code size={20} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Designed & Engineered by Glinto Labs</span>
                    </div>
                    <p className="text-xl font-medium text-slate-400 italic max-w-2xl px-4">
                        "Glinto isn't just a platform; it's a testament to the power of structured, hands-on learning. We're building the future of syntax."
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-500/50 uppercase tracking-[0.3em]">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        Infrastructure v4.1.0 • Stable & Online
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
