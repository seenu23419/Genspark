import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Terminal,
  Sparkles,
  Zap,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trophy,
  Activity,
  Clock,
  Play,
  LucideIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useCurriculum } from '../../contexts/useCurriculum';
import { Lesson } from '../../types';
import { offlineService } from '../../services/offlineService';
import ConfettiReward from '../../components/feedback/ConfettiReward';
import './lessons.css';

interface LessonViewProps {
  lesson?: Lesson;
  onBack?: () => void;
  onStartQuiz?: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({
  lesson: propLesson,
  onBack: propOnBack,
  onStartQuiz: propOnStartQuiz,
}) => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { getLesson, loading } = useCurriculum();
  const [codeSuccess, setCodeSuccess] = useState(false);
  const [contentScrolled, setContentScrolled] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Find Lesson Logic using Context
  const { lesson, langId } = useMemo(() => {
    if (propLesson) return { lesson: propLesson, langId: 'c' }; // Default to c if prop
    const result = getLesson(lessonId || '');
    if (result.lesson) return result;

    // Check offline cache if not found in context
    if (lessonId) {
      const cached = offlineService.getLesson(lessonId);
      if (cached) return { lesson: cached, langId: 'java' };
    }
    return { lesson: null, langId: null };
  }, [lessonId, propLesson, getLesson]);

  // Cache Lesson offline
  useEffect(() => {
    if (lesson && lessonId) {
      offlineService.saveLesson(lessonId, lesson);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setContentScrolled(false); // Reset scroll state for new lesson
      setQuizCompleted(false);
    }
  }, [lessonId, lesson]);

  // Detect quiz completion from URL params or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const quizPassed = params.get('quizPassed');
    if (quizPassed === 'true') {
      setQuizCompleted(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      const storedCompletion = localStorage.getItem(`quiz-${lesson?.id}`);
      if (storedCompletion === 'completed') {
        setQuizCompleted(true);
      }
    }
  }, [lesson?.id]);

  // Detect when user scrolls to end of content using Intersection Observer
  useEffect(() => {
    const contentEnd = document.getElementById('content-end-marker');

    if (!contentEnd) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !contentScrolled) {
          setContentScrolled(true);
        }
      },
      { threshold: 0.3, rootMargin: '100px' }
    );

    observer.observe(contentEnd);
    return () => observer.disconnect();
  }, [contentScrolled]);

  const handleBack = () => {
    if (propOnBack) propOnBack();
    else if (langId) navigate(`/track/${langId}`);
    else navigate('/');
  };

  const handleStartQuiz = () => {
    if (propOnStartQuiz) propOnStartQuiz();
    else if (lesson) navigate(`/quiz/${lesson.id}`);
  };

  const handleNextLesson = () => {
    if (lesson) {
      const currentId = lesson.id;
      const nextId = currentId.replace(/\d+$/, (match: string) => {
        const num = parseInt(match) + 1;
        return num.toString();
      });
      navigate(`/lesson/${nextId}`);
    }
  };

  // Loading State
  const isGlobalLoading = Object.values(loading).some(v => v);
  if (!lesson && isGlobalLoading) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">Loading Lesson Content</h2>
        <p className="text-slate-500 text-sm">Preparing interactive workspace...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <AlertCircle size={48} className="text-slate-700 mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Lesson Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">We couldn't locate the lesson content. It might still be loading or missing.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 md:px-6 md:py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold transition-colors text-sm md:text-base">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b14] flex flex-col text-slate-200 selection:bg-indigo-500/30">

      {/* Header - Material Design 56dp */}
      <header className="sticky top-0 z-30 bg-[#0a0b14]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 md:px-6 h-14">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 group shrink-0 h-12 w-12 justify-center"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
          </button>

          <h1 className="text-sm md:text-base font-bold text-white truncate flex-1 px-2">
            {lesson.title}
          </h1>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg shrink-0">
            <BookOpen size={16} className="text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300 uppercase">Lesson</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8 md:space-y-10 pb-48 md:pb-56">

        {/* Lesson Metadata - readable text sizes */}
        <div className="space-y-4 md:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Clock size={16} />
              <span className="text-xs font-semibold uppercase">{lesson.duration}</span>
            </div>

            {lesson.difficultyLevel && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Activity size={16} />
                <span className="text-xs font-semibold uppercase">{lesson.difficultyLevel}</span>
              </div>
            )}

            {lesson.topics?.slice(0, 2).map((topic, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-white/5 text-slate-400 text-xs font-semibold">
                {topic}
              </span>
            ))}
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
            {lesson.title}
          </h1>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Markdown Content - Optimized for mobile scanning with better spacing and bullet points */}
        <article className="prose prose-invert prose-sm max-w-none 
          prose-headings:font-black prose-headings:tracking-tight prose-headings:text-white
          prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-sm md:prose-p:text-base
          prose-code:text-indigo-300 prose-strong:text-white prose-strong:font-bold
          prose-h1:text-2xl md:prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-5
          prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
          prose-ul:my-3 prose-li:my-1.5 prose-li:text-sm md:prose-li:text-base
          prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-500/5 prose-blockquote:italic prose-blockquote:my-4
          [&_pre]:!p-3 sm:[&_pre]:!p-4 md:[&_pre]:!p-5 [&_pre]:!my-5
          [&_code]:text-[12px] sm:[&_code]:text-xs md:[&_code]:text-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const content = String(children).replace(/\n$/, '');

                // Check if this is a keyword list
                const isKeywordList = !inline && !match &&
                  content.split('\n').length >= 10 &&
                  content.split(/\s+/).every(word => /^[a-z_]+$/.test(word));

                if (!inline && isKeywordList) {
                  const keywords = content.split(/\s+/).filter(w => w.trim());
                  return (
                    <div className="keyword-grid selection-none">
                      {keywords.map((keyword, idx) => (
                        <div key={idx} className="keyword-chip">
                          {keyword}
                        </div>
                      ))}
                    </div>
                  );
                }

                // Output Box rendering (blocks with 'text' language)
                if (!inline && match && match[1] === 'text') {
                  return (
                    <div className="lesson-output-box selection-none">
                      <div className="lesson-output-header">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-slate-800" />
                          <div className="w-2 h-2 rounded-full bg-slate-800" />
                          <div className="w-2 h-2 rounded-full bg-slate-800" />
                        </div>
                        <div className="lesson-output-label">Console Output</div>
                      </div>
                      <pre className="selection-none">{content}</pre>
                    </div>
                  );
                }

                // Standard code block rendering - Read-only version
                if (!inline && match) {
                  return (
                    <div className="lesson-example-program selection-none">
                      <div className="lesson-code-header">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-700" />
                          <div className="w-2 h-2 rounded-full bg-slate-700" />
                          <div className="w-2 h-2 rounded-full bg-slate-700" />
                        </div>
                        <div className="lesson-code-label">{match[1].toUpperCase()} EXAMPLE</div>
                        <div className="lesson-read-only-badge">Read Only</div>
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        showLineNumbers={true}
                        customStyle={{
                          margin: 0,
                          padding: '1.5rem',
                          background: '#0f1016',
                          fontSize: '0.9rem',
                          borderBottomLeftRadius: 12,
                          borderBottomRightRadius: 12,
                          userSelect: 'none',
                          cursor: 'default'
                        }}
                        {...props}
                      >
                        {content}
                      </SyntaxHighlighter>
                    </div>
                  );
                }

                return (
                  <code className="lesson-inline-code" {...props}>
                    {children}
                  </code>
                );
              },
              h1: ({ node, ...props }) => <h1 className="lesson-section" {...props}><div className="text-3xl sm:text-4xl font-black text-white mt-12 mb-6">{props.children}</div></h1>,
              h2: ({ node, ...props }) => <h2 className="lesson-section" {...props}><div className="text-2xl sm:text-3xl font-black text-white mt-10 mb-5 pb-3 border-b border-indigo-500/20">{props.children}</div></h2>,
              h3: ({ node, ...props }) => <h3 className="lesson-section" {...props}><div className="text-lg sm:text-xl font-bold text-white mt-6 mb-4">{props.children}</div></h3>,
              p: ({ node, ...props }) => <p className="lesson-paragraph" {...props} />,
              ul: ({ node, ...props }) => <ul className="lesson-valid-list" {...props} />,
              ol: ({ node, ...props }) => <ol className="lesson-ordered-list" {...props} />,
              li: ({ node, ...props }) => <li className="leading-relaxed text-slate-300" {...props} />,
              blockquote: ({ node, ...props }) => <blockquote className="lesson-blockquote" {...props} />,
              hr: () => <div className="lesson-divider" />,
            }}
          >
            {lesson.content}
          </ReactMarkdown>
        </article>

        {/* Completion Marker - Triggers button reveal when scrolled to */}
        <div id="content-end-marker" className="h-4" />

        {/* Completion Milestone - Subtle indicator now */}
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 mt-12 text-center select-none">
          {quizCompleted ? (
            <div className="text-emerald-400">
              <CheckCircle2 className="mx-auto mb-3" size={32} />
              <h4 className="font-black text-white text-lg mb-1">Lesson Mastered</h4>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">You've aced the quiz. Moving on to the next topic!</p>
            </div>
          ) : (
            <>
              <BookOpen className="mx-auto text-indigo-400/50 mb-3" size={32} />
              <h4 className="font-black text-white text-lg mb-1">Knowledge Acquired</h4>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">You've completed the reading. Ready to test your understanding?</p>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8">
          {quizCompleted ? (
            <button
              onClick={handleNextLesson}
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 animate-in fade-in zoom-in-95"
            >
              <span>Go to Next Lesson</span>
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleStartQuiz}
              className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {lesson.id === 'c36' ? (
                <>
                  <Trophy size={20} />
                  <span>Claim Certificate</span>
                </>
              ) : (
                <>
                  <span>Start Knowledge Quiz</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          )}
        </div>
      </main>

      <ConfettiReward trigger={codeSuccess} />
    </div>
  );
};

export default LessonView;
