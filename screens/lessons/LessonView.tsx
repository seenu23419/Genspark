import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
    Play,
    LucideIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useCurriculum } from '../../contexts/CurriculumContext';
import { useAuth } from '../../contexts/AuthContext';
import { Lesson } from '../../types';
import { offlineService } from '../../services/offlineService';
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
    const { getLesson, loading, fetchLanguageCurriculum } = useCurriculum();
    const { user, updateProfile, refreshProfile } = useAuth();
    const [codeSuccess, setCodeSuccess] = useState(false);
    const [contentScrolled, setContentScrolled] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

    useEffect(() => {
        // Sync with global theme class
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const { lesson, langId, nextLessonId } = useMemo(() => {
        if (propLesson) return { lesson: propLesson, langId: 'c', nextLessonId: null };
        const result = getLesson(lessonId || '');

        // Diagnostic log: Track quiz presence in retrieved lesson
        if (result.lesson) {
            console.log(`[LessonView] Loaded ${result.lesson.id} (${result.lesson.title}) | Quizzes: ${result.lesson.quizQuestions?.length || 0} | Source: CurriculumContext`);
        } else if (lessonId) {
            const cached = offlineService.getLesson(lessonId);
            if (cached) {
                console.log(`[LessonView] Loaded ${cached.id} from Offline Cache | Quizzes: ${cached.quizQuestions?.length || 0}`);
                return { lesson: cached, langId: 'java', nextLessonId: null };
            }
        }

        if (result.lesson) return result;
        return { lesson: null, langId: null, nextLessonId: null };
    }, [lessonId, propLesson, getLesson]);

    const isCompletedInProfile = useMemo(() => {
        if (!user || !lesson) return false;
        const isDone = user.completedLessonIds?.includes(lesson.id);
        if (isDone) console.log(`[LessonView] Lesson ${lesson.id} is marked as COMPLETED in profile`);
        return isDone;
    }, [user, lesson]);

    // Cache Lesson offline and fetch curriculum if missing
    useEffect(() => {
        if (lessonId) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setContentScrolled(false);
            setQuizCompleted(false);

            // Auto-fetch curriculum for the language if we don't have it yet
            // This ensures direct links/refreshes still get merged quizzes
            if (langId && !propLesson) {
                fetchLanguageCurriculum(langId);
            }
        }
        if (lesson && lessonId) {
            offlineService.saveLesson(lessonId, lesson);
        }
    }, [lessonId, lesson, langId, fetchLanguageCurriculum, propLesson]);

    // Detect quiz completion from profile or localStorage
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hasQuizPassedParam = params.get('quizPassed') === 'true';

        // If we just arrived from a passed quiz, show confetti but don't mark THIS lesson as done
        if (hasQuizPassedParam) {
            setCodeSuccess(true);
            // Clean up URL to prevent confetti on refresh
            window.history.replaceState({}, '', window.location.pathname);
        }

        if (isCompletedInProfile) {
            setQuizCompleted(true);
        } else {
            const storedCompletion = localStorage.getItem(`quiz-${lesson?.id}`);
            if (storedCompletion === 'completed') {
                setQuizCompleted(true);
            }
        }
    }, [lesson?.id, isCompletedInProfile]);

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

    const startTimeRef = useRef<number>(Date.now());

    const handleBack = () => {
        if (propOnBack) propOnBack();
        else if (langId) navigate(`/track/${langId}`);
        else navigate('/');
    };

    const handleStartQuiz = () => {
        if (propOnStartQuiz) propOnStartQuiz();
        else if (lesson) navigate(`/quiz/${lesson.id}`);
    };

    const handleCompleteWithoutQuiz = async () => {
        if (!lesson || !user) return;
        setIsFinishing(true);
        try {
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const currentCompleted = user.completedLessonIds || [];
            if (!currentCompleted.includes(lesson.id)) {
                await updateProfile({
                    completedLessonIds: [...currentCompleted, lesson.id],
                    lastLanguageId: langId,
                    lastLessonId: nextLessonId
                }, {
                    type: 'lesson',
                    title: `Completed Lesson: ${lesson.title}`,
                    xp: 50,
                    timeSpent
                });
                setQuizCompleted(true);
                setCodeSuccess(true);
            }
        } catch (error) {
            console.error("Failed to complete lesson:", error);
        } finally {
            setIsFinishing(false);
        }
    };

    const handleNextLesson = () => {
        if (nextLessonId) {
            navigate(`/lesson/${nextLessonId}`);
        } else if (langId) {
            // Fallback if no next lesson in this track
            navigate(`/track/${langId}`);
        }
    };

    // Loading State
    const isGlobalLoading = Object.values(loading).some(v => v);
    if (!lesson && isGlobalLoading) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-black flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                <h2 className="text-xl font-bold text-white mb-2">Loading Lesson Content</h2>
                <p className="text-slate-500 text-sm">Preparing interactive workspace...</p>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-black flex flex-col items-center justify-center p-4 sm:p-6 text-center transition-colors duration-300">
                <AlertCircle size={48} className="text-slate-700 mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Lesson Not Found</h2>
                <p className="text-slate-500 text-sm mb-6">We couldn't locate the lesson content. It might still be loading or missing.</p>
                <button onClick={() => navigate(-1)} className="px-4 py-2 md:px-6 md:py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold transition-colors text-sm md:text-base">
                    Go Back
                </button>
            </div>
        );
    }

    const hasQuiz = lesson.quizQuestions && lesson.quizQuestions.length > 0;

    return (
        <div
            className="min-h-screen bg-slate-100 dark:bg-black flex flex-col text-slate-700 dark:text-slate-200 selection:bg-indigo-500/30 transition-colors duration-300 overflow-x-hidden"
            style={{ touchAction: 'pan-y' }}
        >

            {/* Header - Material Design 56dp */}
            <header className="sticky top-0 z-30 bg-slate-100/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-300 dark:border-white/5 px-4 py-3 md:px-6 h-14 transition-colors duration-300">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
                    <button
                        onClick={handleBack}
                        className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 group shrink-0 h-12 w-12 justify-center"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
                    </button>

                    <h1 className="text-sm md:text-base font-bold text-slate-700 dark:text-white truncate flex-1 px-2">
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
                <div className="space-y-4 md:space-y-5">
                    <div className="flex flex-wrap gap-2">


                        {lesson.difficultyLevel && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                <Activity size={16} />
                                <span className="text-xs font-semibold uppercase">{lesson.difficultyLevel}</span>
                            </div>
                        )}

                        {lesson.topics?.slice(0, 2).map((topic, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                                {topic}
                            </span>
                        ))}
                    </div>

                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Markdown Content - Optimized for mobile scanning with better spacing and bullet points */}
                <article className="lesson-content prose dark:prose-invert prose-sm max-w-none
          prose prose-slate dark:prose-invert max-w-none
          prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-700 dark:prose-headings:text-white
          prose-p:text-slate-500 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-sm md:prose-p:text-base
          prose-code:text-indigo-600 dark:prose-code:text-indigo-300 prose-strong:text-slate-700 dark:prose-strong:text-white prose-strong:font-bold
          prose-h1:text-2xl md:prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-5
          prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
          prose-ul:my-3 prose-li:my-1.5 prose-li:text-sm md:prose-li:text-base
          prose-blockquote:border-indigo-500 prose-blockquote:bg-slate-200/50 dark:prose-blockquote:bg-indigo-500/5 prose-blockquote:italic prose-blockquote:my-4
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

                                // Check if this is a multi-line block without a tag (usually Syntax)
                                if (!inline && !match && content.includes('\n')) {
                                    return (
                                        <div className="lesson-example-program selection-none">
                                            <div className="lesson-code-header">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                                                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                                                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                                                </div>
                                                <div className="lesson-code-label">SYNTAX</div>
                                            </div>
                                            <pre className="p-6 bg-slate-50 dark:bg-[#0f1016] text-indigo-900 dark:text-indigo-300 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre border-t border-slate-200 dark:border-transparent">
                                                {content}
                                            </pre>
                                        </div>
                                    );
                                }

                                // Standard code block rendering
                                if (!inline && match) {
                                    // Heuristic: Better detection for SYNTAX vs EXAMPLE
                                    const isSyntax =
                                        (content.includes('<') && content.includes('>')) ||
                                        content.includes('condition') ||
                                        content.includes('statement') ||
                                        content.includes('expression') ||
                                        content.includes('variable_name') ||
                                        (!content.includes(';') && !content.includes('#include') && !content.includes('main'));

                                    const label = isSyntax ? 'SYNTAX' : 'EXAMPLE';

                                    return (
                                        <div className="lesson-example-program selection-none">
                                            <div className="lesson-code-header">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                                                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                                                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                                                </div>
                                                <div className="lesson-code-label">{label}</div>
                                            </div>
                                            <SyntaxHighlighter
                                                style={isDarkMode ? vscDarkPlus : oneLight}
                                                language={match[1]}
                                                PreTag="div"
                                                showLineNumbers={!isSyntax} // Hide line numbers for pure syntax templates
                                                customStyle={{
                                                    margin: 0,
                                                    padding: '1.5rem',
                                                    background: isDarkMode ? '#0f1016' : '#f8fafc', // bg-slate-50
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

                                const dataTypes = [
                                    'int', 'float', 'double', 'char', 'short', 'long',
                                    'signed', 'unsigned', 'void', 'struct', 'union',
                                    'enum', 'typedef', 'size_t', 'bool',
                                    'long long', 'unsigned int', 'signed int',
                                    'unsigned char', 'signed char', 'unsigned short',
                                    'signed short', 'unsigned long', 'signed long',
                                    'long double', 'unsigned long long', 'signed long long'
                                ];

                                const isDataType = inline && dataTypes.includes(content.trim().toLowerCase());

                                return (
                                    <code className={isDataType ? "lesson-data-type" : "lesson-inline-code"} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            h1: ({ node, ...props }) => <h1 className="lesson-section" {...props}><div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-12 mb-6">{props.children}</div></h1>,
                            h2: ({ node, ...props }) => (
                                <h2 className="lesson-section" {...props}>
                                    <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-12 mb-6 pb-4 border-b-2 border-indigo-500/30 tracking-tight leading-tight">
                                        {props.children}
                                    </div>
                                </h2>
                            ),
                            h3: ({ node, ...props }) => (
                                <h3 className="lesson-header-h3" {...props}>
                                    <div className="text-xl sm:text-2xl font-extrabold text-purple-600 dark:text-purple-300 mt-8 mb-4">
                                        {props.children}
                                    </div>
                                </h3>
                            ),
                            p: ({ node, ...props }) => <p className="lesson-paragraph" {...props} />,
                            ul: ({ node, ...props }) => <ul className="lesson-valid-list" {...props} />,
                            ol: ({ node, ...props }) => <ol className="lesson-ordered-list" {...props} />,
                            li: ({ node, ...props }) => <li className="leading-relaxed text-slate-600 dark:text-slate-300" {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <div className="my-8 flex gap-4 bg-indigo-50/50 dark:bg-indigo-500/10 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-400/30 shadow-sm">
                                    <div className="shrink-0 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-sm shadow-indigo-500/50" />
                                    <blockquote className="text-slate-700 dark:text-slate-300 italic leading-relaxed" {...props} />
                                </div>
                            ),
                            hr: () => <div className="lesson-divider" />,
                            table: ({ node, ...props }: any) => (
                                <div className="overflow-x-auto my-6 border border-slate-200 dark:border-slate-700 rounded-xl scrollbar-hide bg-white/50 dark:bg-white/5">
                                    <table className="min-w-full text-left text-xs sm:text-sm" {...props} />
                                </div>
                            ),
                            thead: ({ node, ...props }: any) => <thead className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold" {...props} />,
                            tbody: ({ node, ...props }: any) => <tbody className="divide-y divide-slate-200 dark:divide-slate-700" {...props} />,
                            tr: ({ node, ...props }: any) => <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-white/5" {...props} />,
                            th: ({ node, ...props }: any) => <th className="px-3 py-3 sm:px-6 sm:py-4 font-semibold whitespace-normal sm:whitespace-nowrap align-bottom border-b border-r last:border-r-0 border-slate-200 dark:border-slate-700" {...props} />,
                            td: ({ node, ...props }: any) => <td className="px-3 py-3 sm:px-6 sm:py-4 align-top text-slate-700 dark:text-slate-200 min-w-[80px] border-r last:border-r-0 border-slate-200 dark:border-slate-700" {...props} />,
                        }}
                    >
                        {lesson.content}
                    </ReactMarkdown>
                </article>

                {/* Completion Marker - Triggers button reveal when scrolled to */}
                <div id="content-end-marker" className="h-4" />

                {/* Completion Milestone - Subtle indicator now */}
                <div className="bg-slate-200/50 border border-slate-300 dark:bg-indigo-500/5 dark:border-indigo-400/30 rounded-3xl p-6 mt-12 text-center select-none">
                    {quizCompleted ? (
                        <div className="text-emerald-400">
                            <CheckCircle2 className="mx-auto mb-3" size={32} />
                            <h4 className="font-black text-white text-lg mb-1">Lesson Mastered</h4>
                            <p className="text-slate-400 text-sm max-w-sm mx-auto">
                                {hasQuiz ? "You've aced the quiz. Moving on to the next topic!" : "You've completed this lesson. Well done!"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <BookOpen className="mx-auto text-indigo-400/50 mb-3" size={32} />
                            <h4 className="font-black text-slate-900 dark:text-white text-lg mb-1">Knowledge Acquired</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                                {hasQuiz ? "You've completed the reading. Ready to test your understanding?" : "You've reached the end of the lesson. Ready to proceed?"}
                            </p>
                        </>
                    )}
                </div>

                {/* Action Button */}
                <div className="mt-8">
                    {quizCompleted ? (
                        <button
                            onClick={handleNextLesson}
                            style={{ touchAction: 'manipulation' }}
                            className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/30 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3"
                        >
                            <span>Go to Next Lesson</span>
                            <ArrowRight size={20} />
                        </button>
                    ) : hasQuiz ? (
                        <button
                            onClick={handleStartQuiz}
                            style={{ touchAction: 'manipulation' }}
                            className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3"
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
                    ) : (
                        <button
                            onClick={handleCompleteWithoutQuiz}
                            disabled={isFinishing}
                            style={{ touchAction: 'manipulation' }}
                            className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3"
                        >
                            {isFinishing ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Finishing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Finish Lesson</span>
                                    <CheckCircle2 size={20} />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </main>

        </div>
    );
};

export default LessonView;
