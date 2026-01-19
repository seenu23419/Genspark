import React, { useState, useEffect, useRef } from 'react';
import { Share2, Play, RotateCcw, Download, Maximize2, Minimize2, Copy, Check, Terminal as TerminalIcon, Code2, Cpu, Settings, X, Loader2, Info, Bot, Sparkles, Save, ChevronUp, ChevronDown } from 'lucide-react';
import { genSparkCompilerService } from '../services/compilerService';
import { supabaseDB } from '../services/supabaseService'; // Import Supabase Service
import { useAuth } from '../contexts/AuthContext';
import { genSparkAIService } from '../services/geminiService';
import { useCodeRunner } from '../hooks/useCodeRunner'; // Import the new hook
import { LANGUAGES } from '../constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MobileCodingToolbar from './compiler/MobileCodingToolbar';

interface InlineCompilerProps {
    initialCode?: string;
    language: string;
    context?: string;
    onSuccess?: () => void;
}

const InlineCompiler: React.FC<InlineCompilerProps> = ({ initialCode, language, context, onSuccess }) => {
    const { user } = useAuth();
    const [code, setCode] = useState(initialCode || genSparkCompilerService.getTemplate(language));
    const [output, setOutput] = useState<{ type: 'log' | 'info' | 'error' | 'success', text: string }[]>([]);

    // Legacy running state (for server-side languages)
    const [isServerRunning, setIsServerRunning] = useState(false);

    // Client-side runner hook
    const { runCode: runWorkerCode, status: workerStatus, statusMessage: workerMessage } = useCodeRunner();

    const [isExplaining, setIsExplaining] = useState(false);
    const [isFixing, setIsFixing] = useState(false); // State for AI Fix
    const [aiResponse, setAiResponse] = useState('');
    const [fixedCode, setFixedCode] = useState(''); // Store fixed code suggestion
    const outputRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [cursorLine, setCursorLine] = useState(0);
    const [activeTab, setActiveTab] = useState<'code' | 'output' | 'explanation' | 'fix'>('code');

    // Computed running state
    const isRunning = isServerRunning || workerStatus === 'loading' || workerStatus === 'running';

    useEffect(() => {
        if (initialCode) setCode(initialCode);
    }, [initialCode]);

    useEffect(() => {
        outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
    }, [output, aiResponse, fixedCode, workerMessage]);

    const handleToolbarInsert = (text: string) => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const newCode = code.substring(0, start) + text + code.substring(end);
        setCode(newCode);

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start + text.length, start + text.length);
            }
        }, 0);
    };

    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    const runCode = async (attempt = 1) => {
        if (attempt === 1) {
            setAiResponse('');
            setFixedCode('');
            setOutput([]);
            setActiveTab('output');
            setRetryCount(0);
        }

        // Determine execution mode
        // Python -> Client Side (Pyodide Worker) - Reliable & Offline
        // Others -> Server Side (Piston/Judge0)
        const isClientSide = language.toLowerCase() === 'python';

        if (isClientSide) {
            // Client-Side Execution Path
            setOutput([{ type: 'info', text: 'Executing Python locally...' }]);
            try {
                const result = await runWorkerCode(language, code);

                const newLogs: { type: 'log' | 'info' | 'error' | 'success', text: string }[] = [];

                if (result.output) {
                    result.output.split('\n').forEach(line => {
                        if (line.trim()) newLogs.push({ type: 'log', text: line });
                    });
                }

                if (result.error) {
                    newLogs.push({ type: 'error', text: result.error });
                } else {
                    if (newLogs.filter(l => l.type === 'log').length === 0) {
                        newLogs.push({ type: 'info', text: 'Execution finished (no output).' });
                    }
                    newLogs.push({ type: 'success', text: '✨ Execution Success (Local Runtime)' });
                    // Save snippet on success
                    await supabaseDB.saveSnippet(language, code);
                    if (onSuccess) onSuccess();
                }

                setOutput(newLogs);
            } catch (error: any) {
                setOutput([{ type: 'error', text: `Runtime Error: ${error.message}` }]);
            }
            return;
        }

        // Server-Side Execution Path with Retry
        setIsServerRunning(true);
        setOutput([{ type: 'info', text: `Compiling & Executing on Cloud Runner... (Attempt ${attempt}/${MAX_RETRIES})` }]);

        try {
            const result = await genSparkCompilerService.executeCode(language, code, user?._id);

            const newLogs: { type: 'log' | 'info' | 'error' | 'success', text: string }[] = [];

            // Process Standard Output
            if (result.stdout) {
                result.stdout.split('\n').forEach(line => {
                    if (line.trim()) newLogs.push({ type: 'log', text: line });
                });
            }

            // Process Standard Error and Compilation Output
            if (result.stderr) {
                result.stderr.split('\n').forEach(line => line.trim() && newLogs.push({ type: 'error', text: line }));
            }
            if (result.compile_output) {
                result.compile_output.split('\n').forEach(line => line.trim() && newLogs.push({ type: 'error', text: line }));
            }

            // Status Handling
            if (result.status.id === 3) { // 3 = Accepted
                if (newLogs.filter(l => l.type === 'log').length === 0) {
                    newLogs.push({ type: 'info', text: 'Execution finished (no output).' });
                }
                newLogs.push({ type: 'success', text: '✨ Execution Success' });

                // Save snippet on success
                await supabaseDB.saveSnippet(language, code);
                if (onSuccess) onSuccess();
            } else {
                newLogs.push({ type: 'error', text: `Status: ${result.status.description}` });
                if (result.message) newLogs.push({ type: 'error', text: result.message });
                
                // Add retry button if available
                if (attempt < MAX_RETRIES) {
                    newLogs.push({ 
                        type: 'info', 
                        text: `Failed. Click "Run Code" again to retry (${attempt}/${MAX_RETRIES})` 
                    });
                }
            }

            setOutput(newLogs);

        } catch (error: any) {
            console.error('Execution error:', error);
            const newLogs: { type: 'log' | 'info' | 'error' | 'success', text: string }[] = [
                { type: 'error', text: `Execution Failed: ${error.message}` }
            ];

            // Retry logic
            if (attempt < MAX_RETRIES) {
                newLogs.push({ 
                    type: 'info', 
                    text: `Retrying... (${attempt}/${MAX_RETRIES})` 
                });
                setOutput(newLogs);
                setRetryCount(attempt);
                
                // Auto-retry after delay
                setTimeout(() => {
                    runCode(attempt + 1);
                }, 1500);
                return;
            } else {
                newLogs.push({ 
                    type: 'error', 
                    text: 'All retry attempts failed. Please check your code or internet connection.' 
                });
            }

            setOutput(newLogs);
        } finally {
            setIsServerRunning(false);
        }
    };

    const explainError = async () => {
        const lastError = output.filter(l => l.type === 'error').map(l => l.text).join('\n');
        if (!lastError && output.length === 0) return;

        setIsExplaining(true);
        setAiResponse('');
        setActiveTab('explanation');

        try {
            const prompt = `
        I am a student learning ${context || 'coding'}. 
        My code in ${language} is:
\`\`\`${language}
        ${code}
        \`\`\`        
        The output/error I'm getting is:
        ${lastError || output.map(o => o.text).join('\n')}
        
        Please EXPLAIN what is happening and SUGGEST steps to improve it. 
        DO NOT provide the full corrected code. 
        Focus on helping me understand.
      `;

            const stream = genSparkAIService.generateChatStream(prompt, user?.isPro || false);
            for await (const chunk of stream) {
                setAiResponse(prev => prev + chunk);
            }
        } catch (e) {
            setAiResponse('Sorry, I could not generate an explanation right now.');
        } finally {
            setIsExplaining(false);
        }
    };

    const askAiToFix = async () => {
        const lastError = output.filter(l => l.type === 'error').map(l => l.text).join('\n');

        setIsFixing(true);
        setFixedCode('');
        setActiveTab('fix');

        try {
            // Use Client-Side Service directly (No Edge Function deployment needed)
            const result = await genSparkAIService.fixCode(language, code, lastError || "Code is not working as expected.");
            setFixedCode(result as any);
        } catch (e) {
            setFixedCode(JSON.stringify({ explanation: "Failed to connect to AI Fixer.", fixedCode: "", tips: "" }) as any);
        } finally {
            setIsFixing(false);
        }
    };

    const hasError = output.some(l => l.type === 'error');
    const hasOutput = output.length > 0;

    // Syntax highlighting function (retained from original)
    const highlightSyntax = (code: string) => {
        // ... (Keep existing simple syntax highlighter for performance)
        const colors: Record<string, string> = {
            keyword: 'text-blue-400',
            string: 'text-yellow-400',
            comment: 'text-green-400',
            number: 'text-orange-400',
            function: 'text-cyan-400',
            variable: 'text-white',
            operator: 'text-pink-400',
        };

        const keywords: Record<string, string[]> = {
            javascript: ['var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'default', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'typeof', 'instanceof', 'in', 'of', 'class', 'extends', 'import', 'export', 'default', 'async', 'await', 'yield'],
            typescript: ['var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'default', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'typeof', 'instanceof', 'in', 'of', 'class', 'extends', 'import', 'export', 'default', 'async', 'await', 'yield', 'interface', 'type', 'enum', 'namespace', 'any', 'void', 'number', 'string', 'boolean', 'undefined', 'null', 'symbol', 'bigint'],
            python: ['def', 'return', 'if', 'else', 'elif', 'for', 'while', 'break', 'continue', 'try', 'except', 'finally', 'raise', 'import', 'from', 'as', 'class', 'pass', 'lambda', 'global', 'nonlocal', 'True', 'False', 'None', 'and', 'or', 'not', 'is', 'in', 'with', 'yield', 'async', 'await'],
            cpp: ['int', 'float', 'double', 'bool', 'char', 'void', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'default', 'try', 'catch', 'throw', 'new', 'delete', 'this', 'class', 'struct', 'union', 'enum', 'typedef', 'template', 'typename', 'namespace', 'using', 'public', 'private', 'protected', 'virtual', 'override', 'final', 'static', 'const', 'volatile', 'extern', 'auto', 'register', 'explicit', 'friend', 'inline', 'mutable', 'operator', 'sizeof'],
            java: ['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while'],
        };

        const currentKeywords = keywords[language.toLowerCase()] || keywords['javascript']; // Fallback

        const tokens = [];
        let currentToken = '';
        let i = 0;

        while (i < code.length) {
            const char = code[i];

            // Basic comments
            if (char === '/' && code[i + 1] === '/') {
                let comment = '';
                while (i < code.length && code[i] !== '\n') {
                    comment += code[i++];
                }
                tokens.push({ text: comment, type: 'comment' });
                continue;
            } else if (char === '#' && (language === 'python')) {
                let comment = '';
                while (i < code.length && code[i] !== '\n') {
                    comment += code[i++];
                }
                tokens.push({ text: comment, type: 'comment' });
                continue;
            }

            // Strings
            if (char === '"' || char === "'") {
                const quote = char;
                let string = quote;
                i++;
                while (i < code.length && code[i] !== quote) {
                    if (code[i] === '\\') string += code[i++];
                    string += code[i++];
                }
                if (i < code.length) string += code[i++];
                tokens.push({ text: string, type: 'string' });
                continue;
            }

            if (/\s/.test(char)) {
                let whitespace = '';
                while (i < code.length && /\s/.test(code[i])) whitespace += code[i++];
                tokens.push({ text: whitespace, type: 'whitespace' });
                continue;
            }

            if (/[0-9]/.test(char)) {
                let number = '';
                while (i < code.length && /[0-9.]/.test(code[i])) number += code[i++];
                tokens.push({ text: number, type: 'number' });
                continue;
            }

            if ('+-*/=<>!&|%~^(){}[],.;'.includes(char)) {
                tokens.push({ text: char, type: 'operator' });
                i++;
                continue;
            }

            currentToken += char;
            i++;

            if (i >= code.length || /\s|[^a-zA-Z0-9_]/.test(code[i])) {
                if (currentToken) {
                    if (currentKeywords.includes(currentToken)) tokens.push({ text: currentToken, type: 'keyword' });
                    else tokens.push({ text: currentToken, type: 'variable' });
                    currentToken = '';
                }
            }
        }

        return tokens.map((token, index) => {
            if (token.type === 'whitespace') return <span key={index}>{token.text}</span>;
            return <span key={index} className={colors[token.type] || 'text-slate-300'}>{token.text}</span>;
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // ... (Preserve indentation logic)
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const newValue = code.substring(0, start) + '  ' + code.substring(end);
            setCode(newValue);
            setTimeout(() => { if (textareaRef.current) textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2; }, 0);
            // update cursor line after tab insertion
            setTimeout(() => updateCursorPosition(), 0);
        }
    };

    const updateCursorPosition = () => {
        const el = textareaRef.current;
        if (!el) return;
        const pos = el.selectionStart || 0;
        const before = code.substring(0, pos);
        const line = before.split('\n').length - 1;
        setCursorLine(line);
    };

    const scrollCodeEditor = (direction: 'up' | 'down') => {
        const codeContainer = document.querySelector('.code-editor-container');
        if (!codeContainer) return;
        const scrollAmount = 100;
        if (direction === 'up') {
            codeContainer.scrollTop = Math.max(0, codeContainer.scrollTop - scrollAmount);
        } else {
            codeContainer.scrollTop += scrollAmount;
        }
    };

    return (
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600/10 rounded-lg flex items-center justify-center text-indigo-400">
                        <TerminalIcon size={18} />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                        {language} Runtime
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scrollCodeEditor('up')}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        title="Scroll up"
                    >
                        <ChevronUp size={16} />
                    </button>
                    <button
                        onClick={() => scrollCodeEditor('down')}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        title="Scroll down"
                    >
                        <ChevronDown size={16} />
                    </button>
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

            <div className="flex flex-col h-[400px] md:h-[450px]">
                {/* Downloading Progress Bar */}
                {workerStatus === 'loading' && (
                    <div className="h-1 w-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-indigo-500 animate-progress origin-left w-full"></div>
                    </div>
                )}
                {workerMessage && (
                    <div className="px-4 py-1 text-[10px] text-indigo-400 bg-indigo-900/20 text-center font-mono animate-pulse">
                        STATUS: {workerMessage}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-800 bg-slate-900/50 shrink-0">
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`flex-1 py-2 text-center text-xs font-bold transition-colors ${activeTab === 'code' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Code
                    </button>
                    <button
                        onClick={() => setActiveTab('output')}
                        className={`flex-1 py-2 text-center text-xs font-bold transition-colors ${activeTab === 'output' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Output
                        {output.length > 0 && <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>}
                    </button>
                    {/* Dynamic Tabs */}
                    {activeTab === 'explanation' && (
                        <button onClick={() => setActiveTab('explanation')} className="flex-1 py-2 text-center text-xs font-bold text-white bg-pink-600/20 border-b-2 border-pink-500 hover:bg-pink-600/30 transition-all">📝 Explanation</button>
                    )}
                    {activeTab === 'fix' && (
                        <button onClick={() => setActiveTab('fix')} className="flex-1 py-2 text-center text-xs font-bold text-white bg-blue-600/20 border-b-2 border-blue-500 hover:bg-blue-600/30 transition-all">✨ AI Fix</button>
                    )}
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Tab Content */}
                    {activeTab === 'code' && (
                        <div className="flex-1 relative group bg-slate-950/50">
                            <div className="relative flex-1 flex h-full code-editor-container overflow-hidden">
                                <div className="w-10 flex-shrink-0 bg-slate-950/30 text-slate-700 text-sm font-mono text-right py-6 select-none overflow-hidden border-r border-slate-900">
                                    {code.split('\n').map((_, i) => (
                                        <div key={i} className="h-6 leading-relaxed px-2">{i + 1}</div>
                                    ))}
                                </div>
                                <div className="relative flex-1 h-full">
                                    <textarea
                                        ref={textareaRef}
                                        value={code}
                                        onKeyDown={(e) => { handleKeyDown(e); setTimeout(() => updateCursorPosition(), 0); }}
                                        onKeyUp={() => updateCursorPosition()}
                                        onClick={() => updateCursorPosition()}
                                        onSelect={() => updateCursorPosition()}
                                        onChange={(e) => { setCode(e.target.value); setTimeout(() => updateCursorPosition(), 0); }}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                        className="absolute inset-0 w-full h-full p-6 bg-transparent text-slate-300 font-mono text-sm leading-relaxed resize-none focus:outline-none caret-white z-10 text-transparent selection:bg-indigo-500/20"
                                        style={{ color: 'transparent', caretColor: '#ffffff' }}
                                        spellCheck={false}
                                    />
                                    <pre className="absolute inset-0 w-full h-full p-6 font-mono text-sm leading-relaxed overflow-hidden whitespace-pre-wrap break-words pointer-events-none text-slate-300 code-editor-pre">
                                        {(() => {
                                            const lines = code.split('\n');
                                            return lines.map((ln, idx) => (
                                                <div key={idx} className={`${idx === cursorLine ? 'bg-slate-900/20 rounded-sm -mx-6 px-6' : ''}`}>
                                                    {highlightSyntax(ln)}
                                                    {idx < lines.length - 1 ? '\n' : ''}
                                                </div>
                                            ));
                                        })()}
                                    </pre>
                                </div>
                            </div>
                            <MobileCodingToolbar visible={isFocused} onInsert={handleToolbarInsert} onTab={() => handleToolbarInsert('  ')} />
                        </div>
                    )}

                    {activeTab === 'output' && (
                        <div className="w-full flex flex-col bg-slate-950 border-t border-slate-800 flex-1 overflow-hidden">
                            {isRunning && output.length === 0 && (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 size={32} className="animate-spin text-indigo-500" />
                                        <p className="text-slate-400 text-sm">Executing code...</p>
                                    </div>
                                </div>
                            )}
                            {(output.length > 0 || !isRunning) && (
                                <div className="flex-1 p-5 font-mono text-xs overflow-y-auto space-y-2 select-none" ref={outputRef}>
                                    {output.length === 0 && !isRunning ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-40">
                                            <Info size={32} className="mb-2" />
                                            <p>Output will appear here...</p>
                                        </div>
                                    ) : (
                                        output.map((line, i) => (
                                            <div key={i} className={`
                                                ${line.type === 'log' ? 'text-emerald-400' : ''}
                                                ${line.type === 'info' ? 'text-indigo-400 italic' : ''}
                                                ${line.type === 'error' ? 'text-red-400 font-bold' : ''}
                                                ${line.type === 'success' ? 'text-green-300 font-bold border-t border-green-900/30 pt-2 mt-2' : ''}
                                                break-words whitespace-pre-wrap
                                            `}>
                                                {line.text}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'explanation' && (
                        <div className="w-full h-full bg-slate-950 p-6 overflow-y-auto text-slate-300 text-sm leading-relaxed">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        if (!inline && match) {
                                            return (
                                                <div className="relative my-4 rounded-xl overflow-hidden border border-white/6 bg-[#0f1016]">
                                                    <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-white/6 text-[11px] font-mono text-slate-300 uppercase">{match[1]}</div>
                                                    <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, padding: '1rem', background: '#0f1016', fontSize: '0.875rem', borderRadius: 8 }} {...props}>
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                </div>
                                            );
                                        }

                                        return (
                                            <code className="bg-white/6 px-1 py-0.5 rounded text-indigo-200 font-mono text-sm" {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    h1: ({ node, ...props }) => <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 mb-3" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-4 mb-2" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-3 mb-2" {...props} />,
                                }}
                            >
                                {aiResponse || "Analyzing..."}
                            </ReactMarkdown>
                        </div>
                    )}

                    {activeTab === 'fix' && (
                        <div className="w-full h-full bg-slate-950 p-6 overflow-y-auto">
                            {isFixing ? (
                                <div className="flex flex-col items-center justify-center h-full text-blue-400 gap-3">
                                    <Loader2 className="animate-spin w-8 h-8" />
                                    <p className="text-xs uppercase tracking-widest font-bold">Diagnosing Code...</p>
                                </div>
                            ) : fixedCode ? (
                                <div className="space-y-6">
                                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
                                        <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                                            <Info size={16} /> Diagnosis
                                        </h4>
                                        <p className="text-slate-300 text-sm">{(fixedCode as any).explanation}</p>
                                    </div>

                                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                                        <div className="bg-slate-800/50 px-4 py-2 flex items-center justify-between">
                                            <span className="text-xs text-slate-400 font-mono">FIXED CODE</span>
                                            <button
                                                onClick={() => {
                                                    setCode((fixedCode as any).fixedCode);
                                                    setActiveTab('code');
                                                }}
                                                className="text-xs bg-blue-600 px-3 py-1 rounded text-white hover:bg-blue-500"
                                            >
                                                Apply Fix
                                            </button>
                                        </div>
                                        <pre className="p-4 text-emerald-300 font-mono text-sm overflow-x-auto">
                                            {(fixedCode as any).fixedCode}
                                        </pre>
                                    </div>

                                    <div className="text-slate-500 text-xs italic text-center">
                                        Tip: {(fixedCode as any).tips}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-red-400">Failed to load fix.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {(hasOutput || hasError) && (
                    <div className="p-3 bg-slate-900/50 border-t border-slate-800 flex gap-2">
                        <button
                            onClick={explainError}
                            disabled={isExplaining || isFixing}
                            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            {isExplaining ? <Loader2 size={14} className="animate-spin" /> : <Bot size={16} />}
                            Explain Error
                        </button>

                        {hasError && (
                            <button
                                onClick={askAiToFix}
                                disabled={isFixing || isExplaining}
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20`}
                            >
                                {isFixing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={16} />}
                                Ask AI to Fix
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InlineCompiler;
