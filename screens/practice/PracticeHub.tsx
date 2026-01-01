import React, { useState } from 'react';
import { Terminal, Lightbulb, RotateCcw, Play, ChevronRight, CheckCircle2, ListFilter } from 'lucide-react';
import Compiler from '../compiler/Compiler';
import { PRACTICE_TOPICS, PracticeProblem } from '../../data/practiceProblems';

const PracticeHub: React.FC = () => {
    const [activeTopicId, setActiveTopicId] = useState(PRACTICE_TOPICS[0].id);
    const [selectedProblem, setSelectedProblem] = useState<PracticeProblem | null>(null);
    const [showHint, setShowHint] = useState(false);

    const activeTopic = PRACTICE_TOPICS.find(t => t.id === activeTopicId) || PRACTICE_TOPICS[0];

    return (
        <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
            {/* Header / Topic Tabs */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30">
                <div className="flex items-center gap-2 p-4 overflow-x-auto no-scrollbar scroll-smooth">
                    {PRACTICE_TOPICS.map(topic => (
                        <button
                            key={topic.id}
                            onClick={() => {
                                setActiveTopicId(topic.id);
                                setSelectedProblem(null);
                                setShowHint(false);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${activeTopicId === topic.id
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {topic.title}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                {!selectedProblem ? (
                    <div className="p-6 md:p-10 space-y-6 max-w-4xl mx-auto">
                        <header className="space-y-1">
                            <div className="flex items-center gap-2 text-indigo-400">
                                <ListFilter size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{activeTopic.title}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white">Select a Practice Problem</h2>
                            <p className="text-slate-500 text-sm md:text-base">Master each concept with guided coding challenges.</p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeTopic.problems.map((problem, idx) => (
                                <div
                                    key={problem.id}
                                    onClick={() => setSelectedProblem(problem)}
                                    className="group bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all cursor-pointer shadow-xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Terminal size={60} />
                                    </div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-black text-slate-600 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">Challenge {idx + 1}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-2 group-hover:text-indigo-400 transition-colors">{problem.title}</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{problem.description}</p>
                                    <div className="mt-6 flex items-center text-indigo-400 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                        Solve Now <ChevronRight size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col md:flex-row animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Problem Context Panel */}
                        <div className="w-full md:w-1/3 bg-slate-900/30 border-r border-slate-800 p-6 md:p-8 space-y-8 overflow-y-auto no-scrollbar">
                            <button
                                onClick={() => {
                                    setSelectedProblem(null);
                                    setShowHint(false);
                                }}
                                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
                            >
                                <ChevronRight className="rotate-180" size={16} /> Back to List
                            </button>

                            <div className="space-y-2">
                                <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">{activeTopic.title}</span>
                                <h3 className="text-2xl font-black text-white leading-tight">{selectedProblem.title}</h3>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Task</h4>
                                <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-300 text-sm leading-relaxed font-medium">
                                    {selectedProblem.description}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowHint(!showHint)}
                                    className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors text-xs font-black uppercase tracking-widest"
                                >
                                    <Lightbulb size={16} /> {showHint ? 'Hide Hint' : 'Need a Hint?'}
                                </button>
                                {showHint && (
                                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-amber-200/70 text-xs italic animate-in fade-in slide-in-from-top-2">
                                        {selectedProblem.hint}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Compiler Panel */}
                        <div className="flex-1 min-h-[500px] relative">
                            <Compiler initialCode={selectedProblem.initialCode} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export default PracticeHub;
