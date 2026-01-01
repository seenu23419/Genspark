
import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Terminal as TerminalIcon, Loader2, Info, Bot, X } from 'lucide-react';
import { genSparkCompilerService } from '../services/compilerService';
import { genSparkAIService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface InlineCompilerProps {
    initialCode?: string;
    language: string;
    context?: string;
}

const InlineCompiler: React.FC<InlineCompilerProps> = ({ initialCode, language, context }) => {
    const [code, setCode] = useState(initialCode || genSparkCompilerService.getTemplate(language));
    const [output, setOutput] = useState<{ type: 'log' | 'info' | 'error', text: string }[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isExplaining, setIsExplaining] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const outputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialCode) setCode(initialCode);
    }, [initialCode]);

    useEffect(() => {
        outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
    }, [output, aiResponse]);

    const runCode = async () => {
        setIsRunning(true);
        setAiResponse('');
        setOutput([{ type: 'info', text: 'Compiling...' }]);

        try {
            const result = await genSparkCompilerService.executeCode(language, code);
            const newLogs: { type: 'log' | 'info' | 'error', text: string }[] = [];

            if (result.compile_output) newLogs.push({ type: 'error', text: result.compile_output });
            if (result.stdout) result.stdout.split('\n').forEach(line => line.trim() && newLogs.push({ type: 'log', text: line }));
            if (result.stderr) result.stderr.split('\n').forEach(line => line.trim() && newLogs.push({ type: 'error', text: line }));

            if (newLogs.length === 0) newLogs.push({ type: 'info', text: 'Execution finished (no output).' });
            setOutput(newLogs);
        } catch (error: any) {
            setOutput([{ type: 'error', text: `Failed: ${error.message}` }]);
        } finally {
            setIsRunning(false);
        }
    };

    const explainError = async () => {
        const lastError = output.filter(l => l.type === 'error').map(l => l.text).join('\n');
        if (!lastError && !aiResponse) return;

        setIsExplaining(true);
        setAiResponse('');

        try {
            const prompt = `
        I am a student learning ${context || 'coding'}. 
        My code in ${language} is:
        \`\`\`${language}
        ${code}
        \`\`\`
        
        The error I'm getting is:
        ${lastError || 'I need help with this logic.'}
        
        Please EXPLAIN what is wrong and SUGGEST steps to fix it. 
        DO NOT provide the full corrected code. 
        Focus on helping me understand.
      `;

            const stream = genSparkAIService.generateChatStream(prompt, false);
            for await (const chunk of stream) {
                setAiResponse(prev => prev + chunk);
            }
        } catch (e) {
            setAiResponse('Sorry, I could not generate an explanation right now.');
        } finally {
            setIsExplaining(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const newValue = code.substring(0, start) + '  ' + code.substring(end);
            setCode(newValue);
            setTimeout(() => {
                if (e.currentTarget) e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
            }, 0);
        }
    };

    const hasError = output.some(l => l.type === 'error');

    return (
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600/10 rounded-lg flex items-center justify-center text-indigo-400">
                        <TerminalIcon size={18} />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">Try It Yourself</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCode(initialCode || genSparkCompilerService.getTemplate(language))}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                    >
                        <RotateCcw size={16} />
                    </button>
                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                        {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                        {isRunning ? 'Running' : 'Run Code'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row h-[400px] md:h-[450px]">
                {/* Editor */}
                <div className="flex-1 relative group">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full h-full p-6 bg-slate-950/50 text-slate-300 font-mono text-sm leading-relaxed resize-none focus:outline-none caret-indigo-500"
                        spellCheck={false}
                    />
                </div>

                {/* Output */}
                <div className="w-full md:w-[350px] flex flex-col bg-slate-950 border-t md:border-t-0 md:border-l border-slate-800">
                    <div className="flex-1 p-5 font-mono text-xs overflow-y-auto space-y-2 select-none" ref={outputRef}>
                        {output.length === 0 && !isRunning && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-40">
                                <p>Output will appear here...</p>
                            </div>
                        )}
                        {output.map((line, i) => (
                            <div key={i} className={`
                ${line.type === 'log' ? 'text-emerald-400' : ''}
                ${line.type === 'info' ? 'text-indigo-400 italic' : ''}
                ${line.type === 'error' ? 'text-red-400 font-bold' : ''}
                break-words whitespace-pre-wrap
              `}>
                                {line.text}
                            </div>
                        ))}

                        {aiResponse && (
                            <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl animate-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase mb-2">
                                    <Bot size={14} /> AI Perspective
                                </div>
                                <div className="prose prose-invert prose-xs text-slate-300 pointer-events-none select-none">
                                    <ReactMarkdown>{aiResponse}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {isExplaining && (
                            <div className="flex items-center gap-2 text-slate-500 text-[10px] animate-pulse">
                                <Loader2 size={12} className="animate-spin" /> AI Tutor is thinking...
                            </div>
                        )}
                    </div>

                    {/* AI Trigger */}
                    <div className="p-4 bg-slate-900/50 border-t border-slate-800">
                        <button
                            onClick={explainError}
                            disabled={(!hasError && !aiResponse) || isExplaining}
                            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${hasError || aiResponse
                                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white'
                                    : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            {isExplaining ? <Loader2 size={14} className="animate-spin" /> : <Bot size={16} />}
                            {aiResponse ? 'Ask more' : 'Explain Error'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InlineCompiler;
