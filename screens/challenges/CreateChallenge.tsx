import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Code2,
    FileText,
    Zap,
    Target,
    Keyboard,
    Plus,
    Minus,
    Trophy,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CreateChallenge: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        xp: 100,
        starterCode: '// Write your function here\n\nint solve() {\n    return 0;\n}',
        testCases: [{ input: '', output: '' }]
    });

    const handleSave = () => {
        // Save to local storage for "Community Challenges"
        const existing = JSON.parse(localStorage.getItem('user_created_challenges') || '[]');
        const newChallenge = {
            ...formData,
            id: `custom_${Date.now()}`,
            created_at: new Date().toISOString(),
            creatorId: user?._id || 'anonymous',
            isUserCreated: true
        };
        localStorage.setItem('user_created_challenges', JSON.stringify([...existing, newChallenge]));

        // Return to list
        navigate('/challenges');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-[#0f172a]/50 border-b border-slate-200 dark:border-white/[0.08] sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/challenges')}
                            className="p-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">Arena Architect</h1>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Designing user-created challenge</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 mr-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${step === i ? 'bg-blue-500 scale-125' : 'bg-slate-300 dark:bg-slate-800'}`} />
                            ))}
                        </div>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                            <Save size={14} />
                            Deploy Arena
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="space-y-12">
                    {/* Section 1: Basics */}
                    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.08] rounded-[32px] p-8 md:p-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase italic">1. Challenge Core</h2>
                                <p className="text-xs text-slate-500">Define the identity and difficulty of your target.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Reverse a Linked List"
                                    className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Difficulty</label>
                                <div className="flex gap-2">
                                    {['Easy', 'Medium', 'Hard'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setFormData({ ...formData, difficulty: d })}
                                            className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.difficulty === d
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-500 hover:border-blue-500/50'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Description</label>
                                <textarea
                                    placeholder="Describe what the coder needs to achieve..."
                                    rows={4}
                                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none placeholder:text-slate-400"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Code configuration */}
                    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.08] rounded-[32px] p-8 md:p-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-500">
                                <Code2 size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase italic">2. Starter Snippet</h2>
                                <p className="text-xs text-slate-500">Provide the code environment for the user.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-950 rounded-2xl overflow-hidden border border-white/10">
                                <div className="px-4 py-2 flex items-center gap-2 border-b border-white/5 bg-white/5">
                                    <Keyboard size={12} className="text-slate-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Editor Configuration</span>
                                </div>
                                <textarea
                                    spellCheck={false}
                                    className="w-full bg-transparent p-6 text-sm font-mono text-emerald-400 leading-relaxed focus:outline-none resize-none min-h-[200px]"
                                    value={formData.starterCode}
                                    onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Test cases */}
                    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.08] rounded-[32px] p-8 md:p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-500">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase italic">3. Evaluation Matrix</h2>
                                    <p className="text-xs text-slate-500">Automatic testing to confirm success.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setFormData({ ...formData, testCases: [...formData.testCases, { input: '', output: '' }] })}
                                className="p-3 bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600/20 transition-all border border-blue-500/20"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.testCases.map((tc, idx) => (
                                <div key={idx} className="flex gap-4 items-start group">
                                    <div className="flex-1 grid grid-cols-2 gap-4 bg-slate-50 dark:bg-white/[0.02] p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08]">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest pl-1">Input</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. [1, 2, 3]"
                                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                                                value={tc.input}
                                                onChange={(e) => {
                                                    const newCases = [...formData.testCases];
                                                    newCases[idx].input = e.target.value;
                                                    setFormData({ ...formData, testCases: newCases });
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest pl-1">Output</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. [3, 2, 1]"
                                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                                                value={tc.output}
                                                onChange={(e) => {
                                                    const newCases = [...formData.testCases];
                                                    newCases[idx].output = e.target.value;
                                                    setFormData({ ...formData, testCases: newCases });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {formData.testCases.length > 1 && (
                                        <button
                                            onClick={() => setFormData({ ...formData, testCases: formData.testCases.filter((_, i) => i !== idx) })}
                                            className="mt-8 p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20 opacity-0 group-hover:opacity-100"
                                        >
                                            <Minus size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final Preview Tip */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-6">
                        <div className="w-12 h-12 shrink-0 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-emerald-500 uppercase italic">Great architects inspire others.</p>
                            <p className="text-xs text-emerald-600/70 font-medium">Glinto arenas should challenge logic and promote code quality. Ensure your test cases cover edge cases like empty inputs or large values.</p>
                        </div>
                        <CheckCircle2 size={32} className="text-emerald-500/50 hidden sm:block ml-auto" />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateChallenge;
