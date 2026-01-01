
import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Copy, Terminal as TerminalIcon, CheckCircle2, Loader2, Info } from 'lucide-react';
import { genSparkCompilerService, LANGUAGE_MAPPING } from '../../services/compilerService';

const Compiler: React.FC = () => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(genSparkCompilerService.getTemplate('javascript'));
  const [output, setOutput] = useState<{ type: 'log' | 'info' | 'error', text: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionStats, setExecutionStats] = useState<{ time: string, memory: string } | null>(null);

  // Cache code per language so user doesn't lose work when switching
  const [codeCache, setCodeCache] = useState<Record<string, string>>({});

  // 1. When language changes: Save previous code, Load new code
  const handleLanguageChange = (newLang: string) => {
    setCodeCache(prev => ({ ...prev, [language]: code }));

    // Load existing or template
    const storedCode = codeCache[newLang] || genSparkCompilerService.getTemplate(newLang);
    setCode(storedCode);
    setLanguage(newLang);

    setOutput([]);
    setExecutionStats(null);
  };

  // 2. Handle Tab Indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;

      // Insert 2 spaces
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newValue);

      // Move cursor
      setTimeout(() => {
        if (e.currentTarget) {
          e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput([{ type: 'info', text: 'Compiling source...' }]);
    setExecutionStats(null);

    try {
      const result = await genSparkCompilerService.executeCode(language, code);

      const newLogs: { type: 'log' | 'info' | 'error', text: string }[] = [];

      if (result.compile_output) {
        newLogs.push({ type: 'error', text: result.compile_output });
      }

      if (result.stdout) {
        result.stdout.split('\n').forEach(line => {
          if (line.trim()) newLogs.push({ type: 'log', text: line });
        });
      }

      if (result.stderr) {
        result.stderr.split('\n').forEach(line => {
          if (line.trim()) newLogs.push({ type: 'error', text: line });
        });
      }

      if (result.message) {
        newLogs.push({ type: 'info', text: `Message: ${result.message}` });
      }

      if (newLogs.length === 0) {
        newLogs.push({ type: 'info', text: 'Program finished with no output.' });
      }

      setOutput(newLogs);

      if (result.status.id === 3) { // 3: Accepted
        setExecutionStats({
          time: result.time || '0ms',
          memory: result.memory ? `${(result.memory / 1024).toFixed(1)} MB` : '0 MB'
        });
      }
    } catch (error: any) {
      setOutput([{ type: 'error', text: `Execution failed: ${error.message}` }]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearConsole = () => {
    setOutput([]);
    setExecutionStats(null);
  };

  // Helper to get formatted language name
  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      'cpp': 'C++',
      'csharp': 'C#',
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'sql': 'SQL',
      'php': 'PHP',
      'r': 'R Language'
    };
    return labels[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      <header className="px-4 md:px-6 py-2 md:py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
              <TerminalIcon className="w-4 h-4 md:w-[18px] md:h-[18px]" />
            </div>
            <h2 className="text-[10px] md:text-sm font-bold text-white tracking-tight uppercase hidden xs:block">IDE</h2>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-[10px] md:text-xs font-bold rounded-lg px-2 md:px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer hover:bg-slate-750 transition-colors"
            >
              {Object.keys(LANGUAGE_MAPPING).sort().map(lang => (
                <option key={lang} value={lang}>
                  {getLanguageLabel(lang)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setCode(genSparkCompilerService.getTemplate(language))}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset Code"
          >
            <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-1.5 md:py-2 rounded-xl font-black text-[11px] md:text-sm transition-all active:scale-95 shadow-lg ${isRunning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
          >
            {isRunning ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" />}
            {isRunning ? 'Running' : 'Run'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-slate-950 relative md:border-r border-slate-800 min-h-[50%] md:min-h-0">
          <div className="absolute top-3 right-3 z-10 opacity-50 hover:opacity-100 transition-opacity">
            <button onClick={() => navigator.clipboard.writeText(code)} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white transition-all active:scale-90"><Copy size={14} /></button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 w-full h-full p-4 md:p-6 bg-transparent text-slate-300 font-mono text-xs md:text-sm leading-relaxed resize-none focus:outline-none caret-indigo-500"
            spellCheck={false}
            placeholder="Write your code here..."
          />
        </div>

        {/* Console Area */}
        <div className="w-full md:w-[350px] lg:w-[400px] flex flex-col bg-[#0d0e1a] shadow-2xl relative border-t md:border-t-0 border-slate-800 max-h-[40%] md:max-h-none">
          <div className="px-4 py-2 md:py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/40 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Console</span>
              {isRunning && <Loader2 size={10} className="animate-spin text-indigo-500" />}
            </div>
            <button onClick={clearConsole} className="p-1 px-2 text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1.5 transition-all">
              CLEAR <RotateCcw size={10} />
            </button>
          </div>

          <div className="flex-1 p-4 md:p-5 font-mono text-[10px] md:text-xs overflow-y-auto space-y-1.5 md:space-y-2 scroll-smooth">
            {output.length === 0 && !isRunning ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-3 opacity-30 py-8">
                <TerminalIcon className="w-8 h-8 md:w-12 md:h-12" />
                <p className="text-center text-[10px] uppercase tracking-widest font-bold">Ready to execute</p>
              </div>
            ) : (
              output.map((line, i) => (
                <div key={i} className={`
                  ${line.type === 'log' ? 'text-emerald-400 opacity-90' : ''}
                  ${line.type === 'info' ? 'text-indigo-400 italic font-bold' : ''}
                  ${line.type === 'error' ? 'text-red-400 bg-red-400/5 px-2 py-1 rounded border border-red-400/10 mb-1' : ''}
                  break-words whitespace-pre-wrap
                `}>
                  {line.type === 'info' && '➜ '}
                  {line.text}
                </div>
              ))
            )}
          </div>

          {executionStats && (
            <div className="p-3 md:p-4 bg-slate-950 border-t border-slate-800 animate-in slide-in-from-bottom-2 shrink-0">
              <div className="flex items-center justify-between text-[9px] md:text-[10px] font-bold">
                <div className="flex items-center gap-3 md:gap-4 text-slate-500">
                  <span className="flex items-center gap-1 uppercase tracking-tighter">TIME: <span className="text-white">{executionStats.time}s</span></span>
                  <span className="flex items-center gap-1 uppercase tracking-tighter">MEM: <span className="text-white">{executionStats.memory}</span></span>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 font-black"><CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3" /> ACCEPTED</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compiler;
