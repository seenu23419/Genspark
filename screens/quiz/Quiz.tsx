import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Trophy, AlertCircle, Award, Loader2, Check, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseDB } from '../../services/supabaseService';
import { CURRICULUM } from '../../constants';
import { QuizQuestion } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './quiz.css';

interface QuizProps {
  questions?: QuizQuestion[];
  onComplete?: (score: number) => void;
}

const CORRECT_MESSAGES = [
  "Correct — well done!",
  "Nice! You're on track.",
  "Exactly right."
];

const getRandomCorrectMessage = (questionIndex: number) => {
  return CORRECT_MESSAGES[questionIndex % CORRECT_MESSAGES.length];
};

const Quiz: React.FC<QuizProps> = ({ questions: propQuestions, onComplete: propOnComplete }) => {
  const { quizId } = useParams();
  const isFinalExam = quizId === 'c41';
  const { user, refreshProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Core Data Memoized
  const lessonData = useMemo(() => {
    if (propQuestions) return { lesson: null, questions: propQuestions, nextId: undefined, langId: null };

    for (const langId in CURRICULUM) {
      const languageModules = CURRICULUM[langId];
      for (let mIdx = 0; mIdx < languageModules.length; mIdx++) {
        const module = languageModules[mIdx];
        const lIdx = module.lessons.findIndex(l => l.id === quizId);
        if (lIdx !== -1) {
          const lesson = module.lessons[lIdx];
          let nextIdValue: string | undefined;
          if (lIdx < module.lessons.length - 1) {
            nextIdValue = module.lessons[lIdx + 1].id;
          } else if (mIdx < languageModules.length - 1) {
            nextIdValue = languageModules[mIdx + 1].lessons[0].id;
          }
          return { lesson, questions: lesson.quizQuestions || [], nextId: nextIdValue, langId };
        }
      }
    }
    return { lesson: null, questions: [], nextId: undefined, langId: null };
  }, [quizId, propQuestions]);

  const { questions, nextId, langId } = lessonData;

  // 2. State Hooks
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(isFinalExam ? 30 * 60 : 30);
  const [isFinished, setIsFinished] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [isSubmittingFinish, setIsSubmittingFinish] = useState(false);

  // 3. Derived State (Defined before functions that use them)
  const question = questions[currentQuestion];
  const passPercentage = 70;
  const progress = ((currentQuestion + 1) / (questions.length || 1)) * 100;

  // Ref for scrollable content area
  const contentRef = useRef<HTMLDivElement>(null);

  // 4. Utility Functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 5. Action Handlers
  const handleCheckAnswer = async () => {
    if (selectedOption === null || !question) return;

    const isCorrect = selectedOption === question.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;

    setSubmittedAnswer(selectedOption);
    setIsAnswerCorrect(isCorrect);
    setScore(newScore);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setSubmittedAnswer(null);
      setIsAnswerCorrect(null);
      if (!isFinalExam) setTimeLeft(30);
      if (contentRef.current) contentRef.current.scrollTop = 0;
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

  const handleFinishQuiz = async () => {
    // Calculate final score including the last answer if not already checked
    let finalScore = score;
    if (submittedAnswer === null && selectedOption !== null && question) {
      const isLastCorrect = selectedOption === question.correctAnswer;
      finalScore = isLastCorrect ? score + 1 : score;
    }

    const isPassed = finalScore >= (questions.length * passPercentage) / 100;

    // UI UPDATE: Instant feedback
    setIsFinished(true);
    setScore(finalScore);

    if (propOnComplete) {
      propOnComplete(finalScore);
      return;
    }

    // BACKGROUND: Sync progress and check for certificates
    if (user && quizId) {
      (async () => {
        try {
          const courseId = langId || '';
          if (!courseId) return;

          console.log("[Quiz] Syncing progress for:", quizId);
          const updates: any = {
            completedLessonIds: [quizId]
          };

          if (nextId && !user.unlockedLessonIds.includes(nextId)) {
            updates.unlockedLessonIds = [nextId];
          }

          await updateProfile({
            ...updates,
            lastLanguageId: langId,
            lastLessonId: nextId
          }, {
            type: 'challenge',
            title: `Passed Quiz: ${lessonData.lesson?.title || 'Knowledge Check'}`,
            xp: 100
          });

        } catch (err) {
          console.error('Error in background quiz sync:', err);
        }
      })();
    }
  };

  // 6. Effects
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isFinished) return;
    if (timeLeft <= 0) {
      if (isFinalExam) {
        setIsFinished(true);
      } else {
        handleCheckAnswer();
      }
      return;
    }

    // Timer only runs if answer not yet submitted (unless final exam)
    if (submittedAnswer !== null && !isFinalExam) return;

    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, submittedAnswer, isFinalExam]);

  // 7. Render Loading/Error States
  if (!question && !isFinished) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle size={48} className="text-slate-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Quiz Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">We couldn't locate the quiz content.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-bold transition-all flex items-center gap-2">
          <ArrowRight size={20} className="rotate-180" /> Go Back
        </button>
      </div>
    );
  }

  // 8. Result Screen
  if (isFinished) {

    const isPassed = score >= (questions.length * passPercentage) / 100;

    return (
      <div className="min-h-screen bg-[#0a0b14] flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="relative z-10 max-w-md w-full space-y-8 text-center animate-in fade-in duration-500">
          {isPassed && (
            <div className="flex justify-center pt-4">
              <div className="absolute w-32 h-32 bg-green-500 rounded-full blur-3xl opacity-40 animate-pulse" />
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl">
                <Trophy size={56} className="text-white fill-current" />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h1 className="text-4xl font-black text-white">{isPassed ? 'Quiz Passed! 🎉' : 'Not Quite There'}</h1>
            <p className="text-slate-400 font-medium">
              {isPassed ? 'Lesson Unlocked' : `You need ${Math.ceil(questions.length * passPercentage / 100)} correct answers to pass`}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Your Score</p>
            <p className="text-5xl font-black text-white">{Math.min(score, questions.length)} / {questions.length}</p>
            <p className="text-slate-400 text-sm mt-2">correct answers</p>
          </div>

          <div className="space-y-3">

            <button
              onClick={() => {
                if (isPassed && nextId) navigate(`/lesson/${nextId}`);
                else navigate(-1);
              }}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-blue-500/10"
            >
              {isPassed ? 'Go to Next Lesson' : 'Back to Lesson'} <ArrowRight size={20} />
            </button>

            {!isPassed && (
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setSelectedOption(null);
                  setScore(0);
                  setTimeLeft(30);
                  setSubmittedAnswer(null);
                  setIsAnswerCorrect(null);
                  setIsFinished(false);
                }}
                className="w-full py-5 border-2 border-white/20 text-white rounded-2xl font-bold hover:bg-white/5 active:scale-95"
              >
                Retry Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 9. Main Quiz UI
  return (
    <div className="min-h-screen bg-[#0a0b14] flex flex-col pb-20 sm:pb-0">
      <div className="bg-gradient-to-b from-[#1a1d2e] to-[#0a0b14] border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-6 py-8 w-full">
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-6">Knowledge Check</h1>
          <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" ref={contentRef}>
        <div className="max-w-4xl mx-auto w-full px-6 py-8 flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-8">
            <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">Question {currentQuestion + 1} of {questions.length}</p>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-sm border-2 ${timeLeft <= 10 ? 'border-red-500 text-red-400' : 'border-blue-500 text-slate-300'}`}>
              {isFinalExam ? formatTime(timeLeft) : `${timeLeft}s`}
            </div>
          </div>

          <div className="mb-8">
            <div className="quiz-question">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="text-lg sm:text-2xl font-bold text-white leading-relaxed">{children}</p>,
                  code: ({ children, inline }: any) => inline ? <code className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code> : <pre className="my-4 p-4 rounded-xl bg-black/40 border border-white/10 text-emerald-400 font-mono text-base overflow-x-auto"><code>{children}</code></pre>
                }}
              >
                {question.text}
              </ReactMarkdown>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isSubmitted = submittedAnswer !== null;
              const isCorrect = index === question.correctAnswer;

              let styles = "bg-white/5 border-2 border-white/20 hover:border-white/40";
              if (isSubmitted) {
                if (isCorrect) styles = "bg-green-500/20 border-green-500 text-green-300";
                else if (isSelected) styles = "bg-red-500/20 border-red-500 text-red-300";
              } else if (isSelected) {
                styles = "bg-blue-600/20 border-blue-500 text-white";
              }

              return (
                <button
                  key={index}
                  onClick={() => !isSubmitted && setSelectedOption(index)}
                  disabled={isSubmitted}
                  className={`w-full p-5 rounded-2xl border transition-all text-left flex items-center gap-4 ${styles}`}
                >
                  <div className={`w-8 h-8 rounded flex items-center justify-center font-bold ${isSelected || (isSubmitted && isCorrect) ? 'bg-current text-[#0a0b14]' : 'bg-white/10'}`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="font-medium flex-1">{option}</span>
                  {isSubmitted && isCorrect && <Check size={20} />}
                </button>
              );
            })}
          </div>

          {submittedAnswer !== null && question.explanation && (
            <div className={`mb-8 p-6 rounded-2xl border-l-4 ${isAnswerCorrect ? 'bg-green-500/5 border-green-500' : 'bg-blue-500/5 border-blue-500'}`}>
              <div className="flex gap-4">
                <Info className={isAnswerCorrect ? 'text-green-400' : 'text-blue-400'} />
                <div>
                  <h4 className="font-bold text-white mb-2">Why?</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{question.explanation}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-white/10">
            <button
              onClick={submittedAnswer !== null ? (currentQuestion === questions.length - 1 ? handleFinishQuiz : handleNextQuestion) : handleCheckAnswer}
              disabled={selectedOption === null || isSubmittingFinish}
              className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${selectedOption === null ? 'bg-white/5 text-slate-500' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}
            >
              {isSubmittingFinish ? <Loader2 className="animate-spin" /> : (submittedAnswer !== null ? (currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question') : 'Check Answer')}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Quiz;