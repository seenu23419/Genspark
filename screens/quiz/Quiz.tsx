
import React, { useState, useEffect } from 'react';
import { Timer, ArrowRight } from 'lucide-react';
import { QuizQuestion } from '../../types';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number, xp: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const question = questions[currentQuestion];

  useEffect(() => {
    if (timeLeft <= 0) {
      handleNext();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, currentQuestion]);

  const handleNext = () => {
    const isCorrect = selectedOption === question.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;

    if (currentQuestion < questions.length - 1) {
      setScore(newScore);
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(30);
    } else {
      onComplete(newScore, newScore * 40 + 20); // Base XP + Bonus
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 flex flex-col max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge Check</h1>
          <p className="text-slate-500">Passing unlocks the next lesson!</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold ${
          timeLeft < 10 ? 'bg-red-400/10 text-red-400' : 'bg-slate-900 text-slate-300'
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
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                selectedOption === index 
                  ? 'bg-indigo-600/10 border-indigo-500 text-white' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  selectedOption === index ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
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
