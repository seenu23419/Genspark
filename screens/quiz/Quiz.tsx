import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Timer, ArrowRight, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseDB } from '../../services/supabaseService';
import { CURRICULUM } from '../../constants';
import { QuizQuestion } from '../../types';

interface QuizProps {
  questions?: QuizQuestion[];
  onComplete?: (score: number, xp: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ questions: propQuestions, onComplete: propOnComplete }) => {
  const { quizId } = useParams();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Find current lesson and questions
  const lessonData = (() => {
    for (const langId in CURRICULUM) {
      const languageModules = CURRICULUM[langId];
      for (let mIdx = 0; mIdx < languageModules.length; mIdx++) {
        const module = languageModules[mIdx];
        const lIdx = module.lessons.findIndex(l => l.id === quizId);
        if (lIdx !== -1) {
          const lesson = module.lessons[lIdx];

          // Find next lesson
          let nextId: string | undefined;
          if (lIdx < module.lessons.length - 1) {
            nextId = module.lessons[lIdx + 1].id;
          } else if (mIdx < languageModules.length - 1) {
            nextId = languageModules[mIdx + 1].lessons[0].id;
          }

          return { lesson, questions: lesson.quizQuestions, nextId };
        }
      }
    }
    return { lesson: null, questions: [], nextId: undefined };
  })();

  const { questions, nextId } = lessonData;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFinished, setIsFinished] = useState(false);

  const updateProgressMutation = useMutation({
    mutationFn: async (vars: { xp: number, completedId: string, nextId?: string }) => {
      if (!user) return;
      const updates: any = {
        xp: user.xp + vars.xp,
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

  const question = questions[currentQuestion];

  useEffect(() => {
    if (isFinished) return;
    if (timeLeft <= 0) {
      handleNext();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, currentQuestion, isFinished]);

  const handleNext = async () => {
    const isCorrect = selectedOption === question?.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;

    if (currentQuestion < questions.length - 1) {
      setScore(newScore);
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(30);
    } else {
      setScore(newScore);
      setIsFinished(true);
      const earnedXP = newScore * 40 + 20;

      if (propOnComplete) {
        propOnComplete(newScore, earnedXP);
      } else if (user && quizId) {
        await updateProgressMutation.mutateAsync({
          xp: earnedXP,
          completedId: quizId,
          nextId: nextId
        });
      }
    }
  };

  if (!question && !isFinished) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Quiz Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-indigo-400 hover:text-white transition-colors flex items-center gap-2">
          <ArrowRight size={20} className="rotate-180" /> Go Back
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 md:p-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/40">
          <Trophy size={48} className="text-white" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white">Genius Status!</h1>
          <p className="text-slate-400 text-lg">You scored {score} out of {questions.length}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">XP Earned</p>
            <p className="text-3xl font-black text-indigo-400">+{score * 40 + 20}</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">Accuracy</p>
            <p className="text-3xl font-black text-emerald-400">{Math.round((score / questions.length) * 100)}%</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (nextId) navigate(`/lesson/${nextId}`);
            else navigate(-1);
          }}
          className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-3"
        >
          {nextId ? 'Next Lesson' : 'Back to Lessons'}
          <ArrowRight size={24} />
        </button>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 flex flex-col max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge Check</h1>
          <p className="text-slate-500">Passing unlocks the next lesson!</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold ${timeLeft < 10 ? 'bg-red-400/10 text-red-400' : 'bg-slate-900 text-slate-300'
          }`}>
          <Timer size={18} />
          {timeLeft}s
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-900 rounded-full mb-10 overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex-1 space-y-8">
        <div className="space-y-4">
          <span className="text-indigo-400 font-bold text-sm uppercase tracking-widest">Question {currentQuestion + 1} of {questions.length}</span>
          <h2 className="text-2xl font-bold text-white leading-tight">
            {question.text}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${selectedOption === index
                ? 'bg-indigo-600/10 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${selectedOption === index ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-medium text-lg">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={selectedOption === null}
        className="mt-10 w-full py-4 bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:bg-indigo-500 active:scale-95 shadow-xl shadow-indigo-500/10"
      >
        {currentQuestion === questions.length - 1 ? 'Verify Answers' : 'Next Question'}
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default Quiz;
