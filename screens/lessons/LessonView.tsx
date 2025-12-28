
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Terminal, 
  Sparkles, 
  Code2, 
  HelpCircle, 
  Lightbulb, 
  CheckCircle2,
  Trophy,
  Zap,
  ListChecks,
  ArrowRight
} from 'lucide-react';
import { Lesson } from '../../types';

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
  onStartQuiz: () => void;
  onNextLesson?: () => void;
  initialTab?: 'content' | 'practice';
}

const LessonView: React.FC<LessonViewProps> = ({ 
  lesson, 
  onBack, 
  onStartQuiz, 
  onNextLesson,
  initialTab = 'content' 
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'practice'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lesson.id, initialTab]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 p-2 px-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden md:block text-[10px] font-black uppercase tracking-widest pr-1">Back</span>
          </button>
          
          <div className="h-8 w-px bg-slate-800 hidden md:block mx-2"></div>

          <div className="max-w-[180px] md:max-w-none">
            <h2 className="font-bold text-white text-sm md:text-lg truncate">{lesson.title}</h2>
            <p className="text-[10px] md:text-xs text-slate-500">Step: {activeTab === 'content' ? '1. Learning' : '2. Practice Lab'}</p>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button 
            disabled={activeTab === 'practice'}
            className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${activeTab === 'content' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 cursor-not-allowed'}`}
          >
            Learn
          </button>
          <button 
            disabled={activeTab === 'content'}
            className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${activeTab === 'practice' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 cursor-not-allowed'}`}
          >
            Practice
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full space-y-10 pb-32">
        {activeTab === 'content' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {lesson.topics && lesson.topics.length > 0 && (
              <section className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">
                   <ListChecks size={16} />
                   Core Topics
                </div>
                <div className="flex flex-wrap gap-2">
                  {lesson.topics.map((topic, idx) => (
                    <div key={idx} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      {topic}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                <Sparkles size={12} fill="currentColor" />
                Lesson Content
              </div>
              <div className="text-lg text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                {lesson.content}
              </div>
            </section>

            {lesson.syntax && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <Code2 size={16} />
                  Syntax Rules
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-indigo-400 text-sm italic">
                  {lesson.syntax}
                </div>
              </section>
            )}

            {lesson.codeExample && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <Terminal size={16} />
                  Code Snapshot
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <pre className="text-emerald-400 font-mono text-sm md:text-base leading-relaxed overflow-x-auto">
                    {lesson.codeExample}
                  </pre>
                </div>
              </section>
            )}

            {/* Bottom Button for Step 1 */}
            <div className="pt-10 border-t border-slate-800">
              <button 
                onClick={onStartQuiz}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-4 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all shadow-2xl"
              >
                Complete Topics & Start Quiz
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
              <Terminal size={12} />
              Practice Lab
            </div>
            {lesson.practiceProblems && lesson.practiceProblems.length > 0 ? (
              lesson.practiceProblems.map((prob, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center font-bold text-emerald-500">{idx+1}</div>
                    <h4 className="text-white font-bold">{prob.problem}</h4>
                  </div>
                  <details className="group">
                    <summary className="text-xs font-bold text-indigo-400 cursor-pointer list-none flex items-center gap-2 hover:text-indigo-300">
                      <Lightbulb size={14} /> Reveal Solution Code
                    </summary>
                    <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap">{prob.solution}</pre>
                    </div>
                  </details>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-slate-600 bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-800">
                <p>No practice problems for this module.</p>
              </div>
            )}

            {/* Bottom Button for Step 2 */}
            <div className="pt-10 border-t border-slate-800">
              <button 
                onClick={onNextLesson}
                className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-4 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all shadow-2xl"
              >
                Finish & Go to Next Lesson
                <CheckCircle2 size={24} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LessonView;
