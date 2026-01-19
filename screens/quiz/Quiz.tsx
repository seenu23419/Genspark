import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Trophy, AlertCircle, Award, Loader2, Check, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseDB } from '../../services/supabaseService';
import { CURRICULUM } from '../../constants';
import { QuizQuestion } from '../../types';
import { certificateService } from '../../services/certificateService';
import { CertificateModal } from '../../components/CertificateModal';
import { CertificateDisplay } from '../../components/CertificateDisplay';
import { Certificate } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './quiz.css';

interface QuizProps {
  questions?: QuizQuestion[];
  onComplete?: (score: number) => void;
}

// Rotating correct-answer feedback messages for engagement
const CORRECT_MESSAGES = [
  "Correct — well done!",
  "Nice! You're on track.",
  "Exactly right."
];

// Helper function to get random correct message
const getRandomCorrectMessage = (questionIndex: number) => {
  return CORRECT_MESSAGES[questionIndex % CORRECT_MESSAGES.length];
};

const Quiz: React.FC<QuizProps> = ({ questions: propQuestions, onComplete: propOnComplete }) => {
  const { quizId } = useParams();
  const isFinalExam = quizId === 'c41';
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Find current lesson and questions - Memoized for performance
  const lessonData = useMemo(() => {
    if (propQuestions) return { lesson: null, questions: propQuestions, nextId: undefined };

    for (const langId in CURRICULUM) {
      const languageModules = CURRICULUM[langId];
      for (let mIdx = 0; mIdx < languageModules.length; mIdx++) {
        const module = languageModules[mIdx];
        const lIdx = module.lessons.findIndex(l => l.id === quizId);
        if (lIdx !== -1) {
          const lesson = module.lessons[lIdx];

          // Find next lesson
          let nextIdValue: string | undefined;
          if (lIdx < module.lessons.length - 1) {
            nextIdValue = module.lessons[lIdx + 1].id;
          } else if (mIdx < languageModules.length - 1) {
            nextIdValue = languageModules[mIdx + 1].lessons[0].id;
          }

          return { lesson, questions: lesson.quizQuestions || [], nextId: nextIdValue };
        }
      }
    }
    return { lesson: null, questions: [], nextId: undefined };
  }, [quizId, propQuestions]);

  const { questions, nextId } = lessonData;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(isFinalExam ? 30 * 60 : 30);
  const [isFinished, setIsFinished] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certCourseInfo, setCertCourseInfo] = useState<{ id: string, name: string } | null>(null);
  const [earnedCertificate, setEarnedCertificate] = useState<Certificate | null>(null);
  const [isSubmittingFinish, setIsSubmittingFinish] = useState(false);

  // Ref for scrollable content area
  const contentRef = useRef<HTMLDivElement>(null);

  const updateProgressMutation = useMutation({
    mutationFn: async (vars: { completedId: string, nextId?: string }) => {
      if (!user) return;
      const updates: any = {
        completedLessonIds: [...user.completedLessonIds, vars.completedId]
      };

      if (vars.nextId && !user.unlockedLessonIds.includes(vars.nextId)) {
        updates.unlockedLessonIds = [...user.unlockedLessonIds, vars.nextId];
      }

      return supabaseDB.updateOne(user._id, updates);
    },
    onSuccess: () => {
      refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['userRank'] });
    }
  });

  const handleNext = async () => {
    const isCorrect = selectedOption === question?.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;

    // Set the answer state to show feedback
    setSubmittedAnswer(selectedOption);
    setIsAnswerCorrect(isCorrect);

    if (currentQuestion < questions.length - 1) {
      // Show feedback and explanation, wait for user to click 'Next Question'
      setScore(newScore);
    } else {
      // For the last question, just set the score and show feedback
      // Don't immediately finish - let user click "Finish Quiz" to see explanation first
      setScore(newScore);
    }
  };

  const handleFinishQuiz = async () => {
    setIsSubmittingFinish(true);
    try {
      // Calculate final score
      const isCorrect = selectedOption === question?.correctAnswer;
      const finalScore = isCorrect ? score + 1 : score;
      const passPercentage = 70;
      const isQuizPassed = finalScore >= (questions.length * passPercentage) / 100;

      if (propOnComplete) {
        propOnComplete(finalScore);
        setIsFinished(true);
        setIsSubmittingFinish(false);
        return;
      }

      // 1. INSTANT UI UPDATE: Show results immediately
      setIsFinished(true);
      setIsSubmittingFinish(false);

      if (user && quizId) {
        // 2. BACKGROUND OPERATIONS: Fire and forget via setTimeout
        setTimeout(async () => {
          try {
            // Find courseId
            let courseId = '';
            for (const langId in CURRICULUM) {
              const languageModules = CURRICULUM[langId];
              const lessonExists = languageModules.some(module =>
                module.lessons.some(lesson => lesson.id === quizId)
              );
              if (lessonExists) {
                courseId = langId;
                break;
              }
            }

            // Run progress update in background
            updateProgressMutation.mutateAsync({
              completedId: quizId,
              nextId: nextId
            }).catch(e => console.error("Background progress update failed", e));

            // Generate certificate in background if passed - but don't auto-show it anymore
            // User will click "Claim Certificate" on the result screen if they passed the final lesson
            if (isQuizPassed && courseId && quizId === 'c41') {
              certificateService.generateCertificateForCourse(
                user._id,
                courseId,
                courseId.charAt(0).toUpperCase() + courseId.slice(1),
                quizId
              ).then(cert => {
                if (cert) {
                  // We store it but don't set it as 'earnedCertificate' yet
                  // so the result screen shows the score first.
                  console.log("Certificate generated in background");
                }
              }).catch(e => console.error("Background cert generation failed", e));
            }
          } catch (err) {
            console.error('Error in background quiz processing:', err);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error finishing quiz:', error);
      setIsSubmittingFinish(false);
      setIsFinished(true);
    }
  };

  // Removed automatic bypass logic to ensure all lessons (including certification) show the quiz session.
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setSubmittedAnswer(null);
      setIsAnswerCorrect(null);
      if (!isFinalExam) setTimeLeft(30);
      // Scroll content area to top
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedOption(null);
      setSubmittedAnswer(null);
      setIsAnswerCorrect(null);
      if (!isFinalExam) setTimeLeft(30);
    }
  };

  const question = questions[currentQuestion];

  useEffect(() => {
    if (isFinished) return;
    if (timeLeft <= 0) {
      if (isFinalExam) {
        setIsFinished(true);
      } else {
        handleNext();
      }
      return;
    }
    // Don't decrement timer if an answer has been submitted (except for final exam)
    if (submittedAnswer !== null && !isFinalExam) return;

    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, currentQuestion, isFinished, submittedAnswer, isFinalExam]);

  // No more auto-bypass loader
  const isBypassed = false;

  // Calculate pass status and progress - must be first, before any conditional rendering
  const passPercentage = 70; // 70% required to pass
  const isQuizPassed = score >= (questions.length * passPercentage) / 100;
  const progress = ((currentQuestion + 1) / (questions.length || 1)) * 100;

  // Helper to format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!question && !isFinished && !isBypassed) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <AlertCircle size={48} className="text-slate-700 mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Quiz Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">We couldn't locate the quiz.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 md:px-6 md:py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2 mx-auto">
          <ArrowRight size={20} className="rotate-180" /> Go Back
        </button>
      </div>
    );
  }

  if (isFinished) {
    if (earnedCertificate) {
      return (
        <div className="h-full w-full bg-[#0a0b14] p-2 sm:p-6 flex flex-col items-center justify-center animate-in fade-in duration-700">
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <div className="w-full animate-in zoom-in duration-700">
              <CertificateDisplay
                certificate={{
                  certificateId: earnedCertificate.certificate_id,
                  userName: user?.name || 'Student',
                  courseName: earnedCertificate.course_name,
                  completionDate: new Date(earnedCertificate.completion_date),
                  mentorName: earnedCertificate.mentor_name
                }}
              />
            </div>

            <button
              onClick={() => navigate(-1)}
              className="w-full max-w-sm py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm sm:text-lg transition-all flex items-center justify-center gap-2 mx-auto active:scale-95 shadow-xl shadow-indigo-600/20"
            >
              Done
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      );
    }

    const isPassed = isQuizPassed;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0a0b14] to-[#1a1d2e] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-md w-full space-y-8 text-center animate-in fade-in duration-500">
          {/* Trophy Animation - Only for Passed */}
          {isPassed && (
            <div className="flex justify-center pt-4">
              {/* Glow Effect */}
              <div className="absolute w-32 h-32 sm:w-40 sm:h-40 bg-green-500 rounded-full blur-3xl opacity-40 animate-pulse" />

              {/* Trophy Container with Bounce */}
              <div className="relative" style={{ animation: 'trophyBounce 3s ease-in-out infinite' }}>
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center">
                  {/* Outer Ring - Animated */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 opacity-90 animate-spin-slow" style={{ animation: 'spin 3s linear infinite' }} />

                  {/* Middle Ring - Secondary Animation */}
                  <div className="absolute inset-2 sm:inset-3 rounded-full bg-gradient-to-br from-green-300 to-green-500 opacity-50" style={{ animation: 'spin 6s linear infinite reverse' }} />

                  {/* Inner Gradient Circle */}
                  <div className="absolute inset-1.5 sm:inset-2 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-2xl" style={{ boxShadow: '0 0 40px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.2)' }} />

                  {/* Trophy Icon */}
                  <Trophy size={56} className="sm:size-64 text-white fill-current relative z-10" style={{ filter: 'drop-shadow(0 0 25px rgba(34, 197, 94, 0.8)) drop-shadow(0 0 15px rgba(34, 197, 94, 0.4))', textShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }} />
                </div>
              </div>
            </div>
          )}

          {/* Main Message */}
          <div className="space-y-3">
            {isPassed ? (
              <>
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Quiz Passed! 🎉</h1>
                <p className="text-slate-400 text-sm sm:text-base font-medium">Lesson Unlocked</p>
              </>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Not Quite There</h1>
                <p className="text-slate-400 text-sm sm:text-base font-medium">
                  You need {Math.ceil(questions.length * passPercentage / 100)} correct answers to pass
                </p>
              </>
            )}
          </div>

          {/* Score Display - Clear and Simple */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Your Score</p>
            <p className="text-4xl sm:text-5xl font-black text-white">
              {Math.min(score, questions.length)} / {questions.length}
            </p>
            <p className="text-slate-400 text-sm mt-2">correct answers</p>
            {isPassed && (
              <p className="text-slate-400 text-sm mt-4 border-t border-white/10 pt-4">
                You've mastered this lesson.
              </p>
            )}
          </div>

          {/* Primary CTA - Single Clear Button */}
          {isPassed && quizId === 'c41' ? (
            <button
              onClick={async () => {
                const cert = await certificateService.getCertificateForCourse(user._id, 'C Programming');
                if (cert) {
                  setEarnedCertificate(cert);
                  setCertCourseInfo({ id: 'c', name: 'C Programming' });
                } else {
                  // Try to generate one more time if not found
                  const generated = await certificateService.generateCertificateForCourse(user._id, 'c', 'C Programming', 'c41');
                  if (generated) {
                    setEarnedCertificate(generated);
                    setCertCourseInfo({ id: 'c', name: 'C Programming' });
                  }
                }
              }}
              className="w-full py-4 sm:py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-emerald-500/30 transition-all active:scale-95 shadow-lg shadow-emerald-500/10 mb-3"
            >
              <Award size={24} />
              Claim My Certificate
            </button>
          ) : null}

          <button
            onClick={() => {
              if (isPassed && nextId) {
                // Navigate to next lesson (progress was already updated in handleNext)
                navigate(`/lesson/${nextId}?quizPassed=true`);
              } else {
                navigate(-1);
              }
            }}
            className="w-full py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95 shadow-lg shadow-blue-500/10"
          >
            {isPassed ? 'Go to Next Lesson' : 'Back to Lesson'}
            <ArrowRight size={20} />
          </button>

          {/* Retry Button - Secondary, Only for Failed */}
          {!isPassed && (
            <button
              onClick={() => {
                // Reset quiz state
                setCurrentQuestion(0);
                setSelectedOption(null);
                setScore(0);
                setTimeLeft(30);
                setSubmittedAnswer(null);
                setIsAnswerCorrect(null);
                setIsFinished(false);
              }}
              className="w-full py-4 sm:py-5 border-2 border-white/20 text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-white/5 transition-all active:scale-95"
            >
              Retry Quiz
            </button>
          )}
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#0a0b14] flex flex-col pb-20 sm:pb-0">
      {/* Premium Header with Gradient */}
      <div className="bg-gradient-to-b from-[#1a1d2e] to-[#0a0b14] border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-3 sm:px-6 py-5 sm:py-8 w-full">
          {/* Title */}
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-5 sm:mb-6">Knowledge Check</h1>

          {/* Thin Progress Bar */}
          <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="progress-bar h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 shadow-lg shadow-blue-500/30"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto quiz-content-area" ref={contentRef}>
        <div className="max-w-full mx-auto w-full px-3 sm:px-6 py-5 sm:py-8 flex flex-col">
          {/* Question Counter & Timer Row */}
          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">Question {currentQuestion + 1} of {questions.length}</p>
            </div>

            {/* Circular Timer Indicator - Reduced Size, Closer to Header */}
            <div className={`timer-circle flex-shrink-0 w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center font-mono font-bold text-sm sm:text-base transition-all duration-300 relative ${timeLeft <= (isFinalExam ? 60 : 10)
              ? 'timer-warning bg-gradient-to-br from-red-500/25 to-red-600/20 border border-red-500/50 text-red-400'
              : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/20 text-slate-300'
              }`}>
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={timeLeft <= (isFinalExam ? 60 : 10) ? '#ef4444' : '#60a5fa'}
                  strokeWidth="1.5"
                  strokeDasharray={`${(timeLeft / (isFinalExam ? 1800 : 30)) * 176} 176`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <span className="relative z-10 text-xs sm:text-sm">{isFinalExam ? formatTime(timeLeft) : `${timeLeft}s`}</span>
            </div>
          </div>

          {/* Question Text with Difficulty Badge */}
          <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
            <div className="quiz-question flex-1 min-w-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="text-lg sm:text-2xl font-bold text-white leading-relaxed">{children}</p>,
                  code: ({ children, inline }: any) =>
                    inline ? (
                      <code className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                    ) : (
                      <pre className="quiz-code-block my-4 p-4 rounded-xl bg-black/40 border border-white/10 text-emerald-400 font-mono text-base overflow-x-auto ring-1 ring-white/5 shadow-inner">
                        <code>{children}</code>
                      </pre>
                    )
                }}
              >
                {question.text}
              </ReactMarkdown>
            </div>
            {/* Difficulty Badge - Minimal Design */}
            {question.difficultyLevel && (
              <div className="flex-shrink-0 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 bg-white/5 border border-white/10">
                  {question.difficultyLevel === 'Beginner' || question.difficultyLevel === 'Easy' ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      Easy
                    </>
                  ) : question.difficultyLevel === 'Intermediate' || question.difficultyLevel === 'Medium' ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                      Medium
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      Hard
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Answer Options - Full Width Cards */}
          <div className="option-gap space-y-2.5 mb-6 sm:mb-8">
            {question.options.map((option, index) => {
              const isCorrectOption = index === question.correctAnswer;
              const isSelected = selectedOption === index;
              const isSubmitted = submittedAnswer !== null;
              const isUserCorrect = isSelected && isAnswerCorrect === true;
              const isUserIncorrect = isSelected && isAnswerCorrect === false;
              const isCorrectUnselected = isCorrectOption && !isSelected && isSubmitted;

              let containerClass = 'bg-white/5 border-2 border-white/20 hover:bg-white/10 hover:border-white/30';
              let textClass = 'text-slate-300';
              let indicatorClass = 'bg-white/20 text-slate-400';

              if (isSubmitted) {
                if (isUserCorrect) {
                  containerClass = 'bg-green-500/15 border-2 border-green-500/50 cursor-default';
                  textClass = 'text-green-300 font-medium';
                  indicatorClass = 'bg-green-600 text-white';
                } else if (isUserIncorrect) {
                  containerClass = 'bg-red-500/10 border-2 border-red-500/30 cursor-default';
                  textClass = 'text-red-300';
                  indicatorClass = 'bg-red-600/80 text-white';
                } else if (isCorrectUnselected) {
                  containerClass = 'bg-green-500/15 border-2 border-green-500/50 cursor-default';
                  textClass = 'text-green-300 font-medium';
                  indicatorClass = 'bg-green-600 text-white';
                }
              } else if (isSelected) {
                containerClass = 'bg-blue-600/15 border-2 border-blue-500/60 hover:bg-blue-600/20';
                textClass = 'text-white font-medium';
                indicatorClass = 'bg-blue-600 text-white';
              }

              return (
                <button
                  key={index}
                  onClick={() => !isSubmitted && setSelectedOption(index)}
                  disabled={isSubmitted}
                  className={`quiz-option w-full p-3.5 sm:p-5 rounded-2xl border transition-all text-left active:scale-95 disabled:cursor-default flex items-center gap-3 sm:gap-4 ${containerClass}`}
                >
                  {/* Indicator Circle */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${indicatorClass}`}>
                    {isUserCorrect ? (
                      <Check size={18} className="sm:size-5" />
                    ) : isUserIncorrect ? (
                      <span className="text-base sm:text-lg">✕</span>
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>

                  {/* Option Text */}
                  <span className={`quiz-option-text font-medium text-sm sm:text-base flex-1 text-left ${textClass}`}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Answer Feedback Text & Explanation */}
          {submittedAnswer !== null && (
            <>
              {/* Short Feedback Message */}
              <div className="feedback-text mb-4 sm:mb-5">
                {isAnswerCorrect ? (
                  <p className="text-green-300 font-semibold text-sm sm:text-base">✓ {getRandomCorrectMessage(currentQuestion)}</p>
                ) : (
                  <p className="text-red-300 font-semibold text-sm sm:text-base">✗ Not quite. Let's understand why.</p>
                )}
              </div>

              {/* Explanation Card with Enhanced Styling */}
              {question?.explanation && (
                <div className={`explanation-card mb-6 sm:mb-8 p-3.5 sm:p-5 bg-blue-500/10 border-l-4 rounded-2xl backdrop-blur-sm transition-all ${isAnswerCorrect
                  ? 'border-l-green-500 border-t border-r border-b border-green-500/30 bg-gradient-to-br from-green-500/5 to-blue-500/5'
                  : 'border-l-blue-500 border-t border-r border-b border-blue-500/40 bg-gradient-to-br from-blue-500/8 to-slate-500/5'
                  }`}>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`flex-shrink-0 mt-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${isAnswerCorrect ? 'bg-green-500/30' : 'bg-blue-500/30'}`}>
                      <Info size={16} className={`sm:size-5 ${isAnswerCorrect ? 'text-green-400' : 'text-blue-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm mb-1">Why?</h4>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* CTA Button - Single Clear Action */}
          <div className="pt-4 sm:pt-6 border-t border-white/10">
            <button
              onClick={submittedAnswer !== null ? (currentQuestion === questions.length - 1 ? handleFinishQuiz : handleNextQuestion) : handleNext}
              disabled={selectedOption === null && !submittedAnswer || isSubmittingFinish}
              className={`cta-button w-full py-3.5 sm:py-5 px-4 sm:px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all active:scale-95 ${(selectedOption === null && !submittedAnswer) || isSubmittingFinish
                ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/30 shadow-lg shadow-blue-500/10'
                }`}
            >
              {isSubmittingFinish ? (
                <>
                  <Loader2 size={18} className="sm:size-5 animate-spin" />
                  Finishing...
                </>
              ) : submittedAnswer !== null
                ? currentQuestion === questions.length - 1
                  ? 'Finish Quiz'
                  : 'Next Question'
                : 'Check Answer'}
              {!isSubmittingFinish && submittedAnswer === null && <ArrowRight size={18} className="sm:size-5" />}
              {!isSubmittingFinish && submittedAnswer !== null && <ArrowRight size={18} className="sm:size-5" />}
            </button>
          </div>
        </div>
      </div>

      {user && certCourseInfo && certCourseInfo.id && (
        <CertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          userId={user._id}
          courseId={certCourseInfo.id}
          courseName={certCourseInfo.name}
        />
      )}
    </div>
  );
};

export default Quiz;