import React, { useState } from 'react';
import { ArrowLeft, Share2, Star, Play, Square, SquareCheck, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelloWorldLesson = () => {
  const [activeTab, setActiveTab] = useState<'code' | 'output'>('code');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [code, setCode] = useState(`#include <stdio.h>

int main() {
    // printf() displays the string inside quotation
    printf("Hello, World!");
    return 0;
}`);
  const navigate = useNavigate();

  const handleRun = () => {
    setIsRunning(true);
    setError('');

    // Simulate execution
    setTimeout(() => {
      // Check for common errors in the code
      const hasError = checkForErrors(code);

      if (hasError) {
        setError(hasError);
        setOutput('');
      } else {
        setOutput('Hello, World!');
        setError('');
      }
      setIsRunning(false);
    }, 500);
  };

  const checkForErrors = (code: string): string | null => {
    // Check for common C errors
    if (!code.includes('#include <stdio.h>')) {
      return 'Error: Missing #include <stdio.h> - needed for printf function';
    }

    if (!code.includes('int main()')) {
      return 'Error: Missing main() function - every C program needs a main()';
    }

    if (!code.includes('printf')) {
      return 'Error: No printf() function found - needed to display output';
    }

    if (!code.includes('return 0;')) {
      return 'Error: Missing return 0; - indicates successful program completion';
    }

    if (code.includes('printf') && !code.includes('"') && !code.includes("'")) {
      return 'Error: printf statement seems to be missing quotes around text';
    }

    return null;
  };

  const handleExplainError = () => {
    if (error) {
      // In a real implementation, this would call an AI service to explain the error
      alert(`Error Explanation:

${error}

Common fixes:
1. Make sure to include all necessary headers
2. Check that your main function is properly defined
3. Ensure all statements end with semicolons
4. Verify quotes are properly closed`);
    } else {
      alert('No errors detected in your code! It should run successfully.');
    }
  };

  const handleNext = () => {
    // Navigate to next lesson or quiz
    navigate('/lesson/c3'); // or wherever the next lesson is
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-24">
      {/* Header Section - Question/Usage */}
      <div className="px-6 py-6 border-b border-slate-800 bg-slate-900">
        <h1 className="text-2xl font-bold text-white mb-2">Hello, World! Program</h1>
        <p className="text-slate-400 text-base leading-relaxed">
          A "Hello, World!" program is the simplest computer program you can write.
          It shows the message "Hello, World!" on the screen. Beginners start with it
          to learn the basic structure of a programming language.
        </p>
      </div>

      {/* Code Editor Section */}
      <div className="px-6 py-4 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-400 text-xs ml-2">hello_world.c</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === 'code'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab('output')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === 'output'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                Output
              </button>
            </div>
          </div>

          {activeTab === 'code' ? (
            <div className="p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 bg-slate-900 text-emerald-400 font-mono text-sm p-4 border-none outline-none resize-none"
                spellCheck="false"
              />
            </div>
          ) : (
            <div className="p-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-slate-400 text-xs">OUTPUT</span>
                </div>
                {error && (
                  <div className="text-red-400 text-sm leading-relaxed mb-2">
                    {error}
                  </div>
                )}
                <div className="text-emerald-400 text-sm leading-relaxed min-h-[100px]">
                  {output || <span className="text-slate-600">Run the program to see output...</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Run and Explain Error Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center gap-2 text-white font-bold shadow-lg hover:shadow-indigo-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <Square className="w-5 h-5" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Program
              </>
            )}
          </button>

          <button
            onClick={handleExplainError}
            className="py-4 px-6 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center gap-2 text-white font-bold shadow-lg hover:shadow-amber-500/50 transition-all active:scale-95"
          >
            <Bug className="w-5 h-5" />
            Explain Error
          </button>
        </div>
      </div>

      {/* Explanation Section */}
      <div className="px-6 py-4 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Explanation</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">#include &lt;stdio.h&gt;</h3>
              <p className="text-slate-300 text-base">
                This line tells the computer to include a special library called "stdio.h".
                This library has the tools we need to show text on the screen.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">int main()</h3>
              <p className="text-slate-300 text-base">
                Every C program must have a <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400 font-mono">main()</code> function.
                This is where the computer starts reading your program. Think of it as the beginning of a story.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">printf("Hello, World!")</h3>
              <p className="text-slate-300 text-base">
                The <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400 font-mono">printf()</code> function
                shows the text inside the quotes on the screen. The "f" in printf stands for "format".
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">return 0</h3>
              <p className="text-slate-300 text-base">
                This line tells the computer that the program finished successfully.
                When a program returns 0, it means "everything worked perfectly!"
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">Execution Order</h3>
              <p className="text-slate-300 text-base">
                1. Computer reads <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400 font-mono">#include</code> first<br />
                2. Finds the <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400 font-mono">main()</code> function<br />
                3. Runs <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400 font-mono">printf()</code> to show the message<br />
                4. Returns 0 to show success
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <button className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <Share2 size={20} />
        </button>

        <button className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <Star size={20} />
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/50 transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default HelloWorldLesson;