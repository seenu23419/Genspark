
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Terminal,
  Sparkles,
  Code2,
  CheckCircle2,
  Zap,
  ListChecks,
  ArrowRight
} from 'lucide-react';
import { CURRICULUM } from '../../constants';
import { Lesson } from '../../types';
import InlineCompiler from '../../components/InlineCompiler';

interface LessonViewProps {
  lesson?: Lesson;
  onBack?: () => void;
  onStartQuiz?: () => void;
  onNextLesson?: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({
  lesson: propLesson,
  onBack: propOnBack,
  onStartQuiz: propOnStartQuiz,
}) => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  // Lookup lesson if not provided as prop
  const lesson = propLesson || (() => {
    for (const langId in CURRICULUM) {
      for (const module of CURRICULUM[langId]) {
        const found = module.lessons.find(l => l.id === lessonId);
        if (found) return found;
      }
    }
    return null;
  })();

  const langId = (() => {
    for (const lid in CURRICULUM) {
      for (const module of CURRICULUM[lid]) {
        if (module.lessons.find(l => l.id === lessonId)) return lid;
      }
    }
    return 'javascript';
  })();

  const handleBack = () => {
    if (propOnBack) propOnBack();
    else navigate(-1);
  };

  const handleStartQuiz = () => {
    if (propOnStartQuiz) propOnStartQuiz();
    else if (lesson) navigate(`/quiz/${lesson.id}`);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lessonId]);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Lesson Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-indigo-400 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft size={20} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 p-2 px-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">Exit</span>
          </button>
          <div className="h-8 w-px bg-slate-800 hidden md:block mx-2"></div>
          <div>
            <h2 className="font-bold text-white text-sm md:text-lg truncate max-w-[200px] md:max-w-md">{lesson.title}</h2>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
          <Zap size={14} className="text-indigo-400" fill="currentColor" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Lesson</span>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full space-y-16 pb-32">
        {/* Step 1: Concepts */}
        <section className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {lesson.topics && lesson.topics.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">
                <ListChecks size={16} />
                Lesson Objectives
              </div>
              <div className="flex flex-wrap gap-2">
                {lesson.topics.map((topic, idx) => (
                  <div key={idx} className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs font-bold text-slate-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
              <Sparkles size={12} fill="currentColor" />
              Explanation
            </div>
            <div className="text-xl text-slate-200 leading-relaxed font-semibold whitespace-pre-wrap">
              {lesson.content}
            </div>
          </div>

          {lesson.syntax && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Code2 size={14} /> Syntax Blueprint
              </div>
              <div className="font-mono text-indigo-400 text-lg md:text-xl font-bold bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                {lesson.syntax}
              </div>
            </div>
          )}
        </section>

        <div className="h-px bg-slate-800 w-full"></div>

        {/* Step 2: Observation */}
        {lesson.codeExample && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
              <Terminal size={12} /> Read-only Example
            </div>
            <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative">
              <div className="absolute top-6 right-8 text-[10px] font-black text-slate-600 uppercase tracking-widest select-none">Snapshot</div>
              <pre className="text-emerald-400 font-mono text-base md:text-lg leading-relaxed overflow-x-auto select-none">
                {lesson.codeExample}
              </pre>
            </div>
            <p className="text-sm text-slate-500 font-medium italic text-center">Look at the structure above carefully before you start practicing.</p>
          </section>
        )}

        {/* Step 3: Practice (Compiler) */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
            <Zap size={12} fill="currentColor" /> Live Practice Lab
          </div>

          <InlineCompiler
            language={langId}
            initialCode={lesson.fullProgram}
            context={lesson.title}
          />

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
            <h4 className="text-slate-300 font-black text-sm uppercase tracking-wide">Quick Task:</h4>
            <ul className="space-y-3">
              {lesson.practiceProblems?.slice(0, 2).map((p, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 border border-slate-700">{i + 1}</div>
                  {p.problem}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Navigation to Quiz */}
        <footer className="pt-10">
          <button
            onClick={handleStartQuiz}
            className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all shadow-2xl group active:scale-95"
          >
            I've Learned This! Start Quiz
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
          <p className="text-center text-slate-500 text-xs mt-6 font-bold uppercase tracking-widest">
            Complete the quiz to earn XP and unlock the next topic
          </p>
        </footer>
      </main>
    </div>
  );
};

export default LessonView;
