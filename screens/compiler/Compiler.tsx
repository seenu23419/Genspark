
import React, { useState } from 'react';
import { Play, RotateCcw, Copy, Share2, Terminal as TerminalIcon, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const Compiler: React.FC = () => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(`// Welcome to GenSpark IDE
// Task: Write a function to check if a number is prime

function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

console.log("isPrime(17):", isPrime(17));
console.log("isPrime(24):", isPrime(24));`);
  
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionStats, setExecutionStats] = useState<{ time: string, memory: string } | null>(null);

  const runCode = () => {
    setIsRunning(true);
    setOutput(['Compiling source...', 'Connecting to runtime...']);
    setExecutionStats(null);
    
    // High-speed simulation
    setTimeout(() => {
      setOutput(prev => [
        ...prev, 
        '> Executing...',
        'isPrime(17): true', 
        'isPrime(24): false', 
        '', 
        'Program finished.'
      ]);
      setExecutionStats({ time: '12ms', memory: '4.2 MB' });
      setIsRunning(false);
    }, 450);
  };

  const clearConsole = () => {
    setOutput([]);
    setExecutionStats(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      <header className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
              <TerminalIcon size={18} />
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight uppercase">IDE</h2>
          </div>
          
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ 20</option>
            <option value="java">Java 17</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black text-sm transition-all active:scale-95 shadow-lg ${
              isRunning 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
            {isRunning ? 'Running' : 'Run'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col bg-slate-950 relative border-r border-slate-800">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full h-full p-6 bg-transparent text-slate-300 font-mono text-sm leading-relaxed resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>

        <div className="w-full md:w-[400px] flex flex-col bg-slate-900 shadow-2xl">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Console</span>
            <button onClick={clearConsole} className="p-1.5 text-slate-500 hover:text-white"><RotateCcw size={14} /></button>
          </div>
          
          <div className="flex-1 p-5 font-mono text-xs overflow-y-auto space-y-2">
            {output.length === 0 && !isRunning ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4 opacity-40">
                <TerminalIcon size={48} />
                <p className="text-center">Run code to see output.</p>
              </div>
            ) : (
              output.map((line, i) => (
                <div key={i} className={`${line.startsWith('>') ? 'text-indigo-400' : 'text-emerald-400 opacity-90'}`}>
                  {line}
                </div>
              ))
            )}
          </div>

          {executionStats && (
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <div className="flex items-center gap-4 text-slate-500">
                  <span>TIME: <span className="text-white">{executionStats.time}</span></span>
                  <span>MEM: <span className="text-white">{executionStats.memory}</span></span>
                </div>
                <div className="flex items-center gap-1 text-emerald-500"><CheckCircle2 size={12} /> SUCCESS</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compiler;
