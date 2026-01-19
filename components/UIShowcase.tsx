import React from 'react';
import { Sparkles, Palette, Layout, Zap } from 'lucide-react';

export const UIShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <Sparkles className="text-purple-400" size={32} />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Python Course UI
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl">
            Beautiful, modern, and responsive React components for teaching Python with visual excellence.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Feature 1 */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-2xl p-8 hover:border-blue-500/50 transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Palette className="text-blue-400" size={24} />
              </div>
              <h3 className="text-2xl font-bold">Beautiful Gradients</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Eye-catching gradient backgrounds, glassmorphism effects, and smooth transitions create a premium learning experience.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ Blue-Purple-Pink color palette</li>
              <li>✓ Gradient text and backgrounds</li>
              <li>✓ Backdrop blur effects</li>
              <li>✓ Smooth hover animations</li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-2xl p-8 hover:border-purple-500/50 transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Layout className="text-purple-400" size={24} />
              </div>
              <h3 className="text-2xl font-bold">Responsive Layout</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Fully responsive design that adapts beautifully to all screen sizes from mobile to desktop.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ Mobile-first design</li>
              <li>✓ Tablet optimization</li>
              <li>✓ Desktop fullscreen</li>
              <li>✓ Touch-friendly interactions</li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-2xl p-8 hover:border-green-500/50 transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Zap className="text-green-400" size={24} />
              </div>
              <h3 className="text-2xl font-bold">Interactive Features</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Engaging interactive elements including expandable quizzes, code copy buttons, and progress tracking.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ Expandable quiz sections</li>
              <li>✓ Answer validation</li>
              <li>✓ Copy-to-clipboard</li>
              <li>✓ Progress tracking</li>
            </ul>
          </div>

          {/* Feature 4 */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-2xl p-8 hover:border-pink-500/50 transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-pink-500/20 rounded-lg">
                <Sparkles className="text-pink-400" size={24} />
              </div>
              <h3 className="text-2xl font-bold">Rich Typography</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Clear hierarchy, readable fonts, and smart spacing make content easy to follow and understand.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ Large, clear headings</li>
              <li>✓ Optimized line height</li>
              <li>✓ Color-coded syntax</li>
              <li>✓ Accessible contrast</li>
            </ul>
          </div>
        </div>

        {/* Components Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="text-4xl">🎨</span>
            Core Components
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: 'PythonCourseView',
                description: 'Main component with course browser, lesson selection, and progress tracking.',
                features: ['Course overview', 'Lesson cards', 'Progress bar', 'Back navigation']
              },
              {
                name: 'PythonLessonView',
                description: 'Individual lesson display with content, quizzes, and code examples.',
                features: ['Rich content', 'Interactive quizzes', 'Code blocks', 'Explanations']
              },
              {
                name: 'PythonCurriculumCard',
                description: 'Module cards displaying all lessons with beautiful gradient styling.',
                features: ['Lesson cards', 'Topic tags', 'Duration info', 'Statistics']
              },
              {
                name: 'CodeBlock',
                description: 'Syntax-highlighted code with copy button and language badge.',
                features: ['Syntax highlighting', 'Copy button', 'Dark theme', 'Language badge']
              }
            ].map((comp, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-2">{comp.name}</h3>
                <p className="text-slate-300 text-sm mb-4">{comp.description}</p>
                <div className="flex flex-wrap gap-2">
                  {comp.features.map((feature, fIdx) => (
                    <span
                      key={fIdx}
                      className="text-xs bg-slate-700/50 px-2 py-1 rounded text-slate-300 border border-slate-600"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="text-4xl">🎨</span>
            Color Palette
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Blue', class: 'bg-blue-600' },
              { name: 'Purple', class: 'bg-purple-600' },
              { name: 'Pink', class: 'bg-pink-600' },
              { name: 'Green', class: 'bg-green-600' },
              { name: 'Cyan', class: 'bg-cyan-600' },
              { name: 'Orange', class: 'bg-orange-600' },
              { name: 'Yellow', class: 'bg-yellow-600' },
              { name: 'Red', class: 'bg-red-600' },
              { name: 'Slate', class: 'bg-slate-600' },
              { name: 'Emerald', class: 'bg-emerald-600' },
            ].map((color, idx) => (
              <div key={idx} className="text-center">
                <div className={`${color.class} h-24 rounded-lg mb-2 shadow-lg`} />
                <p className="text-sm text-slate-300 font-semibold">{color.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Example */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
          <pre className="bg-slate-900 p-6 rounded-lg overflow-x-auto">
            <code className="text-green-400 font-mono text-sm">
{`import { PythonCourseView } from './components/PythonCourseView';

export default function App() {
  return (
    <div className="min-h-screen">
      <PythonCourseView />
    </div>
  );
}`}
            </code>
          </pre>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/10 border border-blue-500/50 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-blue-400 mb-1">5</p>
            <p className="text-sm text-slate-300">Components</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/10 border border-purple-500/50 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-purple-400 mb-1">3</p>
            <p className="text-sm text-slate-300">Lessons</p>
          </div>
          <div className="bg-gradient-to-br from-pink-600/20 to-pink-600/10 border border-pink-500/50 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-pink-400 mb-1">15</p>
            <p className="text-sm text-slate-300">Quizzes</p>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-green-600/10 border border-green-500/50 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-green-400 mb-1">100%</p>
            <p className="text-sm text-slate-300">Responsive</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-slate-700">
          <p className="text-slate-400 mb-4">
            Beautifully designed components for modern Python education
          </p>
          <p className="text-xs text-slate-500">
            Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
};
