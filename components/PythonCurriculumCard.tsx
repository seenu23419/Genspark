import React, { useState } from 'react';
import { LessonModule } from '../types';
import { ChevronRight, BookOpen, Zap, Target, Award } from 'lucide-react';

interface PythonCurriculumCardProps {
  module: LessonModule;
  onSelectLesson?: (lessonId: string, lessonTitle: string) => void;
}

export const PythonCurriculumCard: React.FC<PythonCurriculumCardProps> = ({
  module,
  onSelectLesson,
}) => {
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const getGradientStyle = (lessonIndex: number) => {
    const gradients = [
      'from-blue-600 to-purple-600',
      'from-purple-600 to-pink-600',
      'from-pink-600 to-orange-600',
      'from-cyan-600 to-blue-600',
    ];
    return gradients[lessonIndex % gradients.length];
  };

  const getIconColor = (lessonIndex: number) => {
    const colors = [
      'text-blue-400',
      'text-purple-400',
      'text-pink-400',
      'text-cyan-400',
    ];
    return colors[lessonIndex % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-4 sm:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/20 backdrop-blur rounded-2xl">
              <BookOpen size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white">
                {module.title}
              </h1>
              <p className="text-indigo-100 mt-2 text-lg">
                {module.lessons.length} Comprehensive Lessons
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <Zap className="text-yellow-300" size={24} />
                <div>
                  <p className="text-indigo-100 text-sm">Total Duration</p>
                  <p className="text-white font-bold">
                    {module.lessons.reduce((acc, lesson) => {
                      const minutes = parseInt(lesson.duration);
                      return acc + (isNaN(minutes) ? 0 : minutes);
                    }, 0)} mins
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <Target className="text-green-300" size={24} />
                <div>
                  <p className="text-indigo-100 text-sm">Quizzes</p>
                  <p className="text-white font-bold">
                    {module.lessons.reduce((acc, lesson) => acc + (lesson.quizQuestions?.length || 0), 0)} Questions
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <Award className="text-purple-300" size={24} />
                <div>
                  <p className="text-indigo-100 text-sm">Difficulty</p>
                  <p className="text-white font-bold">Beginner Friendly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <span className="text-4xl">📚</span>
          Lessons
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {module.lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className="group bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-2xl overflow-hidden hover:border-slate-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              {/* Card Header Gradient */}
              <div
                className={`h-24 bg-gradient-to-r ${getGradientStyle(idx)} opacity-80 group-hover:opacity-100 transition relative overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-2 right-2 text-6xl">
                    {['🐍', '📖', '🎯', '⚡'][idx % 4]}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 -mt-12 relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span
                      className={`text-4xl font-bold ${getIconColor(idx)} mb-2 inline-block`}
                    >
                      {lesson.id.replace('py', '')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-slate-700/50 px-3 py-1 rounded-full text-sm font-semibold text-slate-200 border border-slate-600">
                      {lesson.duration}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                  {lesson.title}
                </h3>

                <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                  {lesson.topics?.slice(0, 2).join(' • ') || 'Key Topics'}
                  {lesson.topics && lesson.topics.length > 2 && ' ...'}
                </p>

                {/* Topics */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {lesson.topics?.slice(0, 3).map((topic, topicIdx) => (
                    <span
                      key={topicIdx}
                      className="text-xs bg-gradient-to-r from-slate-700/50 to-slate-600/50 px-2.5 py-1 rounded-md text-slate-300 border border-slate-600/50"
                    >
                      {topic}
                    </span>
                  ))}
                  {lesson.topics && lesson.topics.length > 3 && (
                    <span className="text-xs bg-slate-700/50 px-2.5 py-1 rounded-md text-slate-400">
                      +{lesson.topics.length - 3} more
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-600/50">
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="text-lg">❓</span>
                      {lesson.quizQuestions?.length || 0} Quizzes
                    </span>
                    {/* fullProgram indicator removed — interactive playground moved into lesson view */}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id);
                    onSelectLesson?.(lesson.id, lesson.title);
                  }}
                  className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-slate-700/50 to-slate-600/50 hover:from-slate-600 hover:to-slate-500 border border-slate-600/50 hover:border-slate-500 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 group/btn"
                >
                  View Lesson
                  <ChevronRight
                    size={20}
                    className="group-hover/btn:translate-x-1 transition"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Path */}
        <div className="mt-16 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">🎓</span>
            Learning Path
          </h3>
          <div className="space-y-4">
            {module.lessons.map((lesson, idx) => (
              <div key={lesson.id} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-r ${getGradientStyle(
                    idx
                  )} flex items-center justify-center font-bold text-white flex-shrink-0`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{lesson.title}</h4>
                  <p className="text-sm text-slate-400">{lesson.duration}</p>
                </div>
                <div className="text-sm text-slate-400">
                  {lesson.quizQuestions?.length || 0} Q
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-6">
            Ready to master Python? Start with Lesson 1.1 and progress through the curriculum.
          </p>
          <button onClick={() => window.location.href = '/lessons'} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition transform hover:scale-105">
            🚀 Start Learning
          </button>
        </div>
      </div>
    </div>
  );
};
