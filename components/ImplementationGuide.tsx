import React from 'react';
import { AlertCircle, CheckCircle, Zap } from 'lucide-react';

/**
 * Implementation Guide Component
 * Shows how to integrate the Python Course UI
 */
export const ImplementationGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">🚀 Implementation Guide</h1>
          <p className="text-xl text-slate-300">
            Complete steps to integrate the beautiful Python course UI into your app
          </p>
        </div>

        {/* Prerequisites */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <CheckCircle className="text-green-400" size={32} />
            Prerequisites
          </h2>
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-2xl">✓</span>
              <div>
                <p className="font-semibold">React 18+</p>
                <p className="text-slate-400 text-sm">Your app uses React</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-2xl">✓</span>
              <div>
                <p className="font-semibold">TypeScript (Recommended)</p>
                <p className="text-slate-400 text-sm">Components are written in TypeScript</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-2xl">✓</span>
              <div>
                <p className="font-semibold">Tailwind CSS</p>
                <p className="text-slate-400 text-sm">All styling uses Tailwind classes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Installation Steps */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Zap className="text-yellow-400" size={32} />
            Installation Steps
          </h2>

          {/* Step 1 */}
          <div className="mb-8 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Install Dependencies</h3>
                <p className="text-slate-300 mb-4">
                  Install lucide-react for icons used in components:
                </p>
                <div className="bg-slate-900 p-4 rounded-lg mb-4">
                  <code className="text-green-400 font-mono text-sm">npm install lucide-react</code>
                </div>
                <p className="text-slate-400 text-sm">
                  Already have it? You can skip this step.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-8 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Copy Component Files</h3>
                <p className="text-slate-300 mb-4">
                  Copy these files from <code className="bg-slate-800 px-2 py-1 rounded">components/</code> folder:
                </p>
                <div className="bg-slate-900 p-4 rounded-lg space-y-2 mb-4">
                  <code className="text-blue-400 font-mono text-sm block">PythonCourseView.tsx</code>
                  <code className="text-blue-400 font-mono text-sm block">PythonLessonView.tsx</code>
                  <code className="text-blue-400 font-mono text-sm block">PythonCurriculumCard.tsx</code>
                  <code className="text-blue-400 font-mono text-sm block">CodeBlock.tsx</code>
                </div>
                <p className="text-slate-400 text-sm">
                  All files already exist in your workspace ✓
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-8 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-600 to-orange-600 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Import in Your App</h3>
                <p className="text-slate-300 mb-4">
                  Add import to your main App component or router:
                </p>
                <div className="bg-slate-900 p-4 rounded-lg mb-4 overflow-x-auto">
                  <code className="text-green-400 font-mono text-sm">
                    {'import { PythonCourseView } from \'./components/PythonCourseView\';'}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="mb-8 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Add Route</h3>
                <p className="text-slate-300 mb-4">
                  If using React Router, add a route:
                </p>
                <div className="bg-slate-900 p-4 rounded-lg mb-4 overflow-x-auto">
                  <code className="text-green-400 font-mono text-sm">{`<Route path="/python-course" element={<PythonCourseView />} />`}</code>
                </div>
                <p className="text-slate-400 text-sm">
                  Or use conditional rendering in your component.
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="mb-8 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Link from Navigation</h3>
                <p className="text-slate-300 mb-4">
                  Add a link in your navigation menu:
                </p>
                <div className="bg-slate-900 p-4 rounded-lg mb-4 overflow-x-auto">
                  <code className="text-green-400 font-mono text-sm">{`<Link to="/python-course">Learn Python</Link>`}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                6
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Test & Deploy</h3>
                <p className="text-slate-300 mb-4">
                  Run your app and test the Python course:
                </p>
                <div className="bg-slate-900 p-4 rounded-lg mb-4 overflow-x-auto">
                  <code className="text-green-400 font-mono text-sm">npm start</code>
                </div>
                <p className="text-slate-400 text-sm">
                  Navigate to the course and verify everything works!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Test */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">🧪 Quick Test</h2>
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6">
            <p className="text-slate-300 mb-4">Test if everything is working:</p>
            <ol className="space-y-3 text-slate-300">
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">1.</span>
                Navigate to <code className="bg-slate-800 px-2 py-1 rounded text-sm">/python-course</code>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">2.</span>
                You should see the course overview with 3 lessons
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">3.</span>
                Click "View Lesson" on any lesson card
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">4.</span>
                Verify content, quizzes, and code blocks render correctly
              </li>
            </ol>
          </div>
        </section>

        {/* Customization */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <AlertCircle className="text-yellow-400" size={32} />
            Customization
          </h2>

          <div className="space-y-6">
            {/* Colors */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Change Colors</h3>
              <p className="text-slate-300 mb-3">
                Edit gradient classes in component files:
              </p>
              <div className="bg-slate-900 p-4 rounded-lg mb-3 overflow-x-auto">
                <code className="text-blue-400 font-mono text-sm">
                  {`from-blue-600 to-purple-600`}
                </code>
              </div>
              <p className="text-slate-400 text-sm">
                Replace with any Tailwind gradient colors
              </p>
            </div>

            {/* Content */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Update Content</h3>
              <p className="text-slate-300 mb-3">
                Edit curriculum in <code className="bg-slate-800 px-2 py-1 rounded text-sm">pythonCurriculumLevel1.ts</code>
              </p>
              <div className="text-slate-400 text-sm space-y-2">
                <p>• Update lesson titles</p>
                <p>• Modify content text</p>
                <p>• Change quiz questions</p>
                <p>• Update code examples</p>
              </div>
            </div>

            {/* Spacing */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Adjust Spacing</h3>
              <p className="text-slate-300 mb-3">
                Modify padding and margins using Tailwind scale:
              </p>
              <div className="text-slate-400 text-sm space-y-1">
                <p>px-4 → px-6 (increase padding)</p>
                <p>py-8 → py-12 (increase vertical)</p>
                <p>gap-4 → gap-6 (increase gaps)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">🔧 Troubleshooting</h2>

          <div className="space-y-4">
            {[
              {
                problem: 'Icons not showing',
                solution: 'Install lucide-react: npm install lucide-react'
              },
              {
                problem: 'Styling looks broken',
                solution: 'Ensure Tailwind CSS is properly configured in your project'
              },
              {
                problem: 'Component not rendering',
                solution: 'Check import path and ensure component file exists'
              },
              {
                problem: 'Curriculum not loading',
                solution: 'Verify PYTHON_CURRICULUM is exported from constants.tsx'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-xl p-4"
              >
                <p className="font-bold text-red-400 mb-2">❌ {item.problem}</p>
                <p className="text-slate-300">✅ {item.solution}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">🎉 You're All Set!</h2>
          <p className="text-xl text-slate-300 mb-6">
            Your Python course is now live with beautiful, modern UI
          </p>
          <div className="space-y-3 text-slate-300">
            <p>✨ 3 lessons ready to use</p>
            <p>📚 15 interactive quizzes</p>
            <p>💻 Code examples with syntax highlighting</p>
            <p>📱 Fully responsive design</p>
          </div>
        </section>
      </div>
    </div>
  );
};
