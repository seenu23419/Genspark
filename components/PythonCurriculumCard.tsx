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
      'from-blue-600 to-cyan-500',
      'from-indigo-600 to-blue-500',
      'from-blue-500 to-cyan-400',
      'from-slate-700 to-slate-600',
    ];
    return gradients[lessonIndex % gradients.length];
  };

  const getIconColor = (lessonIndex: number) => {
    const colors = [
      'text-blue-400',
      'text-cyan-400',
      'text-indigo-400',
      'text-slate-400',
    ];
    return colors[lessonIndex % colors.length];
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 sm:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur rounded-xl border border-white/20">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {module.title}
              </h1>
              <p className="text-blue-100 mt-1 text-sm font-medium">
                {module.lessons.length} Professional Lessons
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-3">
                <Zap className="text-cyan-300" size={20} />
                <div>
                  <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Total Duration</p>
                  <p className="text-white font-bold text-sm">
                    {module.lessons.reduce((acc, lesson) => {
                      const minutes = parseInt(lesson.duration);
                      return acc + (isNaN(minutes) ? 0 : minutes);
                    }, 0)} mins
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-3">
                <Target className="text-blue-300" size={20} />
                <div>
                  <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Quizzes</p>
                  <p className="text-white font-bold text-sm">
                    {module.lessons.reduce((acc, lesson) => acc + (lesson.quizQuestions?.length || 0), 0)} Questions
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-3">
                <Award className="text-cyan-200" size={20} />
                <div>
                  <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Difficulty</p>
                  <p className="text-white font-bold text-sm">Beginner Friendly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <BookOpen size={24} className="text-blue-500" />
          Curriculum
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {module.lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className="group card-base overflow-hidden hover:card-active"
            >
              {/* Card Header Gradient */}
              <div
                className={`h-1.5 bg-gradient-to-r ${getGradientStyle(idx)} opacity-80 group-hover:opacity-100 transition`}
              />

              {/* Card Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-2xl font-bold ${getIconColor(idx)}`}>
                    {lesson.id.replace('py', '')}
                  </span>
                  <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-slate-400 border border-white/5">
                    {lesson.duration}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">
                  {lesson.title}
                </h3>

                <p className="text-[#94a3b8] text-xs mb-4 line-clamp-2 font-medium">
                  {lesson.topics?.join(' • ') || 'Key Fundamentals'}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Target size={12} className="text-blue-500" />
                      {lesson.quizQuestions?.length || 0} Quizzes
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectLesson?.(lesson.id, lesson.title)}
                    className="p-2 bg-blue-600/10 text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Path */}
        <div className="mt-12 card-base backdrop-blur p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Award size={24} className="text-blue-500" />
            Learning Milestones
          </h3>
          <div className="space-y-3">
            {module.lessons.map((lesson, idx) => (
              <div key={lesson.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => onSelectLesson?.(lesson.id, lesson.title)}>
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getGradientStyle(
                    idx
                  )} flex items-center justify-center font-bold text-white text-xs flex-shrink-0`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate">{lesson.title}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{lesson.duration} • Interactive</p>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-10 text-center">
          <button onClick={() => window.location.href = '/lessons'} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition transform hover:scale-105 active:scale-95">
            🚀 Continue Learning Path
          </button>
        </div>
      </div>
    </div>
  );
};
