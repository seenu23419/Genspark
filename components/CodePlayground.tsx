import React, { useState } from 'react';
import { Play, Copy, RotateCcw, ChevronDown, Lightbulb, AlertCircle } from 'lucide-react';

interface CodePlaygroundProps {
  code: string;
  title: string;
  description: string;
  expectedOutput?: string;
  language?: string;
}

const CodePlayground: React.FC<CodePlaygroundProps> = ({
  code,
  title,
  description,
  expectedOutput,
  language = 'python',
}) => {
  const [editorCode, setEditorCode] = useState(code);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      // Call central server executor
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code: editorCode })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Execution failed');
      }

      const result = await response.json();
      // Prefer stdout, but include compile_output or stderr if present
      setOutput(result.stdout || result.compile_output || result.stderr || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setEditorCode(code);
    setOutput('');
    setError('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorCode);
  };

  return (
    <div className="my-8 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur border border-slate-600/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-800/30 transition"
      >
        <div className="text-left">
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-3">
            <span className="text-2xl">💻</span>
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <ChevronDown
          size={24}
          className={`transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''} text-slate-400`}
        />
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-slate-600/50 p-6 space-y-4">
          {/* Code Editor */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <span>✏️</span>
              Edit & Run Code
            </label>
            <div className="relative bg-slate-900/80 rounded-lg border border-slate-600 overflow-hidden">
              <textarea
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                className="w-full p-4 bg-transparent text-green-400 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-48"
                placeholder="Write your Python code here..."
                spellCheck="false"
              />
              
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition text-slate-300 hover:text-white"
                  title="Copy code"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition text-slate-300 hover:text-white"
                  title="Reset to original"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Run Button */}
          <div className="flex gap-3">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              <Play size={18} />
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <Lightbulb size={18} />
              Hint
            </button>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-200 text-sm">
                💡 <strong>Hint:</strong> Try modifying the code and clicking "Run Code" to see the output change.
              </p>
            </div>
          )}

          {/* Output */}
          {output && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 text-green-400">
                <span>✓</span>
                Output
              </label>
              <div className="p-4 bg-slate-900/80 rounded-lg border border-green-500/50 max-h-48 overflow-y-auto">
                <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap break-words">
                  {output}
                </pre>
              </div>
              {expectedOutput && (
                <div className="text-xs text-slate-400">
                  Expected: <code className="text-green-400">{expectedOutput}</code>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 text-red-400">
                <AlertCircle size={16} />
                Error
              </label>
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg max-h-48 overflow-y-auto">
                <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap break-words">
                  {error}
                </pre>
              </div>
            </div>
          )}

          {/* Challenge Info */}
          <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <p className="text-blue-200 text-sm">
              📚 <strong>What to try:</strong> Make changes to the code and click "Run Code" to see how it works. This helps you understand the concept better!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodePlayground;
