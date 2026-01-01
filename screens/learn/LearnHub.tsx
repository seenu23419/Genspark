
import React, { useState } from 'react';
import { Search, Filter, ChevronRight, BookOpen, GraduationCap, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LANGUAGES } from '../../constants';
import { Language } from '../../types';

const LearnHub: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLanguages = LANGUAGES.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8 md:space-y-10 pb-24">
            <header className="space-y-1 md:space-y-2 px-1">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2 md:gap-3">
                    <GraduationCap className="text-indigo-500 w-8 h-8 md:w-9 md:h-9" />
                    Learning Paths
                </h1>
                <p className="text-slate-500 font-medium text-base md:text-lg">Structured roadmaps from Beginner to Advanced</p>
            </header>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 px-1">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search language or topic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 md:py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white transition-all shadow-lg text-sm md:text-base"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredLanguages.map((lang) => (
                    <div
                        key={lang.id}
                        onClick={() => navigate(`/lessons/${lang.id}`)}
                        className="group relative bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all cursor-pointer overflow-hidden shadow-xl"
                    >
                        {/* Background Decoration */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>

                        <div className="flex justify-between items-start mb-8">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center p-3 shadow-inner">
                                <img
                                    src={lang.icon}
                                    alt={lang.name}
                                    className="w-full h-full object-contain filter group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all"
                                />
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {lang.level}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                    <Trophy size={10} /> 5 Levels
                                </span>
                            </div>
                        </div>

                        <h3 className="text-xl md:text-2xl font-black text-white mb-2 group-hover:text-indigo-400 transition-colors">{lang.name}</h3>
                        <p className="text-slate-500 text-sm mb-6 md:mb-8 leading-relaxed">
                            Master {lang.name} from core syntax to advanced architectural patterns.
                        </p>

                        <div className="space-y-4">
                            {/* Roadmap Preview */}
                            <div className="flex items-center gap-1">
                                <div className="h-1.5 flex-1 bg-indigo-500 rounded-full"></div>
                                <div className="h-1.5 flex-1 bg-slate-800 rounded-full"></div>
                                <div className="h-1.5 flex-1 bg-slate-800 rounded-full"></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                                <span>Beginner</span>
                                <span>Inter</span>
                                <span>Advanced</span>
                            </div>
                        </div>

                        <button className="mt-6 md:mt-8 w-full py-3 md:py-4 bg-slate-800 text-slate-200 rounded-2xl font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                            Continue Path <ChevronRight size={18} />
                        </button>
                    </div>
                ))}

                {/* DSA & Web placeholders for structure demonstration */}
                {!searchQuery && (
                    <>
                        <div className="group relative bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer shadow-xl">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center p-3 mb-6 md:mb-8">
                                <BookOpen size={32} className="text-purple-400" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-white mb-2">DSA Mastery</h3>
                            <p className="text-slate-500 text-sm mb-6 md:mb-8">Algorithms & Data Structures path.</p>
                            <div className="px-4 py-2 bg-slate-800 rounded-xl text-[9px] md:text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Unlocks at Level 5</div>
                        </div>
                        <div className="group relative bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer shadow-xl">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center p-3 mb-6 md:mb-8">
                                <GraduationCap size={32} className="text-emerald-400" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-white mb-2">Web Architecture</h3>
                            <p className="text-slate-500 text-sm mb-6 md:mb-8">Full-stack systems and performance.</p>
                            <div className="px-4 py-2 bg-slate-800 rounded-xl text-[9px] md:text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Unlocks at Level 8</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LearnHub;
