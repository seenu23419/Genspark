import React, { useState } from 'react';
import { Lesson, QuizQuestion } from '../types';
import { ChevronDown, Check, X, Copy, CheckCircle } from 'lucide-react';

interface PythonLessonViewProps {
  lesson: Lesson;
  onComplete?: () => void;
}

export const PythonLessonView: React.FC<PythonLessonViewProps> = ({ lesson, onComplete }) => {
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAnswerSelect = (quizId: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [quizId]: answerIndex
    }));
  };

  const toggleExplanation = (quizId: number) => {
    setShowExplanations(prev => ({
      ...prev,
      [quizId]: !prev[quizId]
    }));
  };

  const isAnswerCorrect = (quizId: number, answerIndex: number, correctAnswer: number) => {
    return answerIndex === correctAnswer;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 pt-8 pb-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold bg-white/20 backdrop-blur px-3 py-1 rounded-full">
              {lesson.duration}
            </span>
            <span className="text-xs font-semibold bg-yellow-400/20 backdrop-blur px-3 py-1 rounded-full text-yellow-200">
              {lesson.topics?.length || 0} Topics
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            {lesson.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {lesson.topics?.map((topic, idx) => (
              <span
                key={idx}
                className="text-sm bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/20 transition"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
        {/* Lesson Content */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-2xl p-8 mb-8">
            <div className="prose prose-invert max-w-none">
              {lesson.content.split('\n\n').map((paragraph, idx) => {
                // Handle bold headers
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  const headerText = paragraph.replace(/\*\*/g, '');
                  if (paragraph.includes('---')) return null;
                  
                  if (paragraph.includes('Step')) {
                    return (
                      <h3
                        key={idx}
                        className="text-2xl font-bold mt-8 mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                      >
                        {headerText}
                      </h3>
                    );
                  }
                  
                  return (
                    <h2
                      key={idx}
                      className="text-2xl font-bold mt-8 mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                    >
                      {headerText}
                    </h2>
                  );
                }

                // Handle bullet points
                if (paragraph.startsWith('•')) {
                  const lines = paragraph.split('\n');
                  return (
                    <ul key={idx} className="space-y-2 mb-4 ml-4">
                      {lines.map((line, lineIdx) => (
                        <li
                          key={lineIdx}
                          className="text-slate-300 flex gap-3 before:content-['▸'] before:text-blue-400 before:font-bold"
                        >
                          <span>{line.replace('• ', '').replace('•', '')}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }

                // Handle numbered lists
                if (paragraph.match(/^\d+\./)) {
                  const lines = paragraph.split('\n');
                  return (
                    <ol key={idx} className="space-y-3 mb-4 ml-4 list-decimal">
                      {lines.map((line, lineIdx) => (
                        <li
                          key={lineIdx}
                          className="text-slate-300"
                        >
                          {line.replace(/^\d+\.\s*/, '')}
                        </li>
                      ))}
                    </ol>
                  );
                }

                // Regular paragraph
                if (paragraph.trim()) {
                  return (
                    <p key={idx} className="text-slate-300 leading-relaxed mb-4 text-lg">
                      {paragraph}
                    </p>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* Mini Program */}
          {lesson.fullProgram && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-3xl">💻</span>
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Mini Program
                </span>
              </h3>
              <div className="relative bg-slate-900/80 rounded-xl p-6 border border-slate-600">
                <button
                  onClick={() => copyToClipboard(lesson.fullProgram!)}
                  className="absolute top-4 right-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition text-sm font-semibold"
                >
                  {copiedCode ? (
                    <>
                      <CheckCircle size={16} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Copy
                    </>
                  )}
                </button>
                <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                  <code>{lesson.fullProgram}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Quizzes Section */}
        {lesson.quizQuestions && lesson.quizQuestions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="text-4xl">📝</span>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Test Your Knowledge
              </span>
            </h2>

            <div className="space-y-4">
              {lesson.quizQuestions.map((quiz, idx) => {
                const hasSelected = selectedAnswers[quiz.id] !== undefined;
                const selectedAnswer = selectedAnswers[quiz.id];
                const isCorrect = hasSelected && isAnswerCorrect(quiz.id, selectedAnswer, quiz.correctAnswer);

                return (
                  <div
                    key={quiz.id}
                    className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl overflow-hidden hover:border-slate-500/50 transition"
                  >
                    {/* Quiz Header */}
                    <button
                      onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
                      className="w-full p-6 flex items-start justify-between hover:bg-slate-800/30 transition"
                    >
                      <div className="flex-1 text-left">
                        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                          <span className="bg-gradient-to-br from-blue-500 to-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          {quiz.text}
                        </h4>
                        {hasSelected && (
                          <div className={`text-sm font-semibold flex items-center gap-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? (
                              <>
                                <Check size={16} /> Correct!
                              </>
                            ) : (
                              <>
                                <X size={16} /> Incorrect
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronDown
                        size={24}
                        className={`transition-transform flex-shrink-0 ${
                          expandedQuiz === quiz.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Quiz Content */}
                    {expandedQuiz === quiz.id && (
                      <div className="bg-slate-900/40 border-t border-slate-600/50 p-6 space-y-4">
                        {/* Options */}
                        <div className="space-y-3 mb-6">
                          {quiz.options.map((option, optIdx) => {
                            const isSelected = selectedAnswer === optIdx;
                            const isCorrectOption = optIdx === quiz.correctAnswer;
                            const showCorrect = hasSelected && isCorrectOption;
                            const showIncorrect = hasSelected && isSelected && !isCorrect;

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleAnswerSelect(quiz.id, optIdx)}
                                className={`w-full p-4 text-left rounded-lg border-2 transition font-semibold ${
                                  showCorrect
                                    ? 'bg-green-500/20 border-green-500 text-green-200'
                                    : showIncorrect
                                    ? 'bg-red-500/20 border-red-500 text-red-200'
                                    : isSelected
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                                    : 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:border-slate-500'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                      showCorrect
                                        ? 'bg-green-500 border-green-500'
                                        : showIncorrect
                                        ? 'bg-red-500 border-red-500'
                                        : isSelected
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'border-slate-500'
                                    }`}
                                  >
                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                  </div>
                                  <span>{option}</span>
                                  {showCorrect && <Check className="ml-auto" size={20} />}
                                  {showIncorrect && <X className="ml-auto" size={20} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        <button
                          onClick={() => toggleExplanation(quiz.id)}
                          className="w-full p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-lg hover:from-purple-600/30 hover:to-pink-600/30 transition font-semibold text-purple-200 flex items-center justify-between"
                        >
                          <span>📚 Show Explanation</span>
                          <ChevronDown
                            size={20}
                            className={`transition-transform ${showExplanations[quiz.id] ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {showExplanations[quiz.id] && quiz.explanation && (
                          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/50">
                            <p className="text-slate-200 leading-relaxed">
                              <span className="font-bold text-yellow-300 block mb-2">💡 Explanation:</span>
                              {quiz.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Complete Button */}
        <div className="flex justify-center">
          <button
            onClick={onComplete}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg transition transform hover:scale-105"
          >
            ✓ Mark Lesson Complete
          </button>
        </div>
      </div>
    </div>
  );
};
