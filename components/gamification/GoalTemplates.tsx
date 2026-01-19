import React from 'react';
import { Zap, BookOpen, Code, Brain, Trophy, Target } from 'lucide-react';

export interface GoalTemplate {
  title: string;
  target: number;
  unit: string;
  icon: string;
  color: string;
  description: string;
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    title: 'Complete Beginner Course',
    target: 20,
    unit: 'lessons',
    icon: 'target',
    color: 'from-blue-500 to-cyan-500',
    description: 'Finish all lessons in a language'
  },
  {
    title: 'Daily Practice Streak',
    target: 30,
    unit: 'days',
    icon: 'zap',
    color: 'from-yellow-500 to-orange-500',
    description: 'Code for 30 days straight'
  },
  {
    title: 'Solve 50 Problems',
    target: 50,
    unit: 'problems',
    icon: 'clock',
    color: 'from-purple-500 to-pink-500',
    description: 'Complete coding challenges'
  },
  {
    title: 'Master Data Structures',
    target: 15,
    unit: 'lessons',
    icon: 'target',
    color: 'from-green-500 to-emerald-500',
    description: 'Learn all about data structures'
  },
  {
    title: 'Code 100 Hours',
    target: 100,
    unit: 'hours',
    icon: 'clock',
    color: 'from-red-500 to-rose-500',
    description: 'Total coding practice time'
  },
  {
    title: 'Complete 5 Projects',
    target: 5,
    unit: 'projects',
    icon: 'zap',
    color: 'from-indigo-500 to-purple-500',
    description: 'Build real-world applications'
  }
];

interface GoalTemplatesProps {
  onSelectTemplate: (template: GoalTemplate) => void;
}

const GoalTemplatesComponent: React.FC<GoalTemplatesProps> = ({ onSelectTemplate }) => {
  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case 'target':
        return <Target size={20} />;
      case 'zap':
        return <Zap size={20} />;
      case 'clock':
        return <BookOpen size={20} />;
      default:
        return <Trophy size={20} />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
        <Trophy size={20} className="text-indigo-400" />
        Goal Templates
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {GOAL_TEMPLATES.map((template, idx) => (
          <button
            key={idx}
            onClick={() => onSelectTemplate(template)}
            className={`text-left p-4 rounded-xl border border-slate-700 hover:border-indigo-500/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all group`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${template.color} text-white`}>
                {getIconComponent(template.icon)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                  {template.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{template.description}</p>
                <p className="text-xs text-indigo-400 font-bold mt-2">
                  {template.target} {template.unit}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GoalTemplatesComponent;
