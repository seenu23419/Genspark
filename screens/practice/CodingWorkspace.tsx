import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Play, RotateCcw, Check, Loader2, AlertCircle, BookOpen, Code2, Zap, X, Terminal, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import Compiler, { CompilerRef } from '../../screens/compiler/Compiler';
import { PracticeProblem } from '../../services/practiceService';
import { genSparkAIService } from '../../services/geminiService';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseDB } from '../../services/supabaseService';
import './CodingWorkspace.css';

type TabType = 'PROBLEM' | 'CODE' | 'RESULT';
type StatusType = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

interface CodingWorkspaceProps {
  problem: PracticeProblem;
  status: StatusType;
  onBack: () => void;
  onComplete: (problemId: string) => void;
  onNext?: () => void;
  hasNextProblem?: boolean;
  nextProblemTitle?: string;
}

interface ExecutionResult {
  accepted: boolean;
  stdout?: string;
  stderr?: string;
  time?: string;
  memory?: string;
  code?: string;
  language?: string;
  compile_output?: string;
  status: { id: number; description: string };
  input?: string;
}

interface AISectionProps {
  title: string;
  content: string;
  icon: React.ReactNode;
}

const AISection: React.FC<AISectionProps> = ({ title, content, icon }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 translate-y-0 hover:translate-y-[-2px] transition-transform duration-300">
    <div className="flex items-center gap-2">
      <div className="text-indigo-400">{icon}</div>
      <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{title}</span>
    </div>
    <p className="text-xs text-slate-300 leading-relaxed font-medium">{content}</p>
  </div>
);

const CodingWorkspace: React.FC<CodingWorkspaceProps> = ({
  problem,
  status,
  onBack,
  onComplete,
  onNext,
  hasNextProblem,
  nextProblemTitle
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('PROBLEM');
  // Code state management
  const [userCode, setUserCode] = useState(() => {
    const starterCodes = (problem as any).starter_codes || {};
    const defaultLang = Object.keys(starterCodes)[0] || 'c';
    return starterCodes[defaultLang] || problem.initialCode || '';
  });
  // Separate state for binding to the editor to prevent re-render loops/cursor jumps
  const [editorSyncCode, setEditorSyncCode] = useState(userCode);

  const [currentStatus, setCurrentStatus] = useState<StatusType>(status);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [userHasTyped, setUserHasTyped] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const starterCodes = (problem as any).starter_codes || {};
    return Object.keys(starterCodes)[0] || 'c';
  });
  /* Removed sidebarTab state */
  const [isEditingCompleted, setIsEditingCompleted] = useState(false);

  const compilerRef = useRef<CompilerRef>(null);

  // KEYBOARD SHORTCUT: CTRL+ENTER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userCode]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progress = await supabaseDB.getPracticeProgress(problem.id);
        if (progress) {
          setCurrentStatus(progress.status === 'completed' ? 'COMPLETED' : 'IN_PROGRESS');
          if (progress.code_snapshot) {
            setUserCode(progress.code_snapshot);
            setEditorSyncCode(progress.code_snapshot);
          }
          if (progress.language_used) setSelectedLanguage(progress.language_used);
        }
      } catch (err) { console.error(err); }
    };
    fetchProgress();
  }, [problem.id]);

  const [isSubmission, setIsSubmission] = useState(false);

  const handleRunCode = async () => {
    if (!userCode.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setIsSubmission(false); // Run mode: Just execute, don't submit
    setExecutionResult(null);
    setAiExplanation(null);
    try {
      await compilerRef.current?.runCode();
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const handleSubmit = async () => {
    if (!userCode.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setIsSubmission(true); // Submit mode: Verify and complete
    setExecutionResult(null);
    setAiExplanation(null);
    try {
      if (problem.test_cases && problem.test_cases.length > 0) {
        await compilerRef.current?.runTests(problem.test_cases);
      } else {
        // Fallback for problems without test cases: regular run counts as submission check
        // Ideally all validation problems should have test cases.
        await compilerRef.current?.runCode();
      }
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const generateAIHelp = async (error: string) => {
    console.log('[AI Mentor] Button clicked, error:', error);
    if (isGeneratingExplanation) {
      console.log('[AI Mentor] Already generating, skipping');
      return;
    }
    setIsGeneratingExplanation(true);
    setAiExplanation(''); // Start with empty to show loading
    console.log('[AI Mentor] Starting generation...');
    try {
      const prompt = `Analyze this programming error: "${error}". 
      Explain exactly three things using these EXACT prefixes:
      LOCATION: Where is it?
      CONCEPT: Why did it happen?
      FIX: How to fix (Logic only, no code)?
      
      Keep it very concise.`;

      let full = '';
      let hasReceivedData = false;

      console.log('[AI Mentor] Calling genSparkAIService.generateChatStream...');
      try {
        let lastUpdate = 0;
        for await (const chunk of genSparkAIService.generateChatStream(prompt, false, [])) {
          hasReceivedData = true;
          full += chunk;

          // Throttle updates to prevent UI freezing (update every 100ms)
          const now = Date.now();
          if (now - lastUpdate > 100) {
            setAiExplanation(full);
            lastUpdate = now;
          }
        }
        // Ensure final state is set
        setAiExplanation(full);
        console.log('[AI Mentor] Stream complete, hasReceivedData:', hasReceivedData);
      } catch (streamError: any) {
        console.error('[AI Mentor] Stream error:', streamError);
        throw streamError;
      }

      // If no data received, show error
      if (!hasReceivedData || !full.trim()) {
        throw new Error('No response from AI');
      }
      setAiExplanation(full);
      console.log('[AI Mentor] Response received:', full.substring(0, 200));
    } catch (e: any) {
      console.error('[AI Mentor Error]', e);
      const errorMessage = e?.message || 'Unknown error';

      // Provide helpful error messages based on the error type
      if (errorMessage.includes('API') || errorMessage.includes('key')) {
        setAiExplanation("LOCATION: API Configuration\nCONCEPT: AI service connection failed. Please check your API keys in .env.local\nFIX: Verify VITE_GEMINI_API_KEY or VITE_OPENAI_API_KEY is set correctly and restart the server.");
      } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        setAiExplanation("LOCATION: API Quota\nCONCEPT: API usage limit reached\nFIX: Wait a moment and try again, or check your API quota.");
      } else {
        setAiExplanation("LOCATION: AI Mentor\nCONCEPT: Temporary connection issue\nFIX: Please try clicking 'Ask AI Mentor' again in a moment.");
      }
    }
    finally { setIsGeneratingExplanation(false); }
  };

  // Ref to track userCode without triggering re-renders in callbacks
  const userCodeRef = useRef(userCode);
  useEffect(() => { userCodeRef.current = userCode; }, [userCode]);

  // Ref to track submission state in callback
  const isSubmissionRef = useRef(isSubmission);
  useEffect(() => { isSubmissionRef.current = isSubmission; }, [isSubmission]);

  // Stable callback for completion
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const handleRunResult = useCallback(async (result: any) => {
    setExecutionResult(result);
    setActiveTab('RESULT');

    // Only save attempt if it's a submission
    if (user?._id && isSubmissionRef.current) {
      await supabaseDB.savePracticeAttempt(problem.id, userCodeRef.current, result.accepted, selectedLanguage);
    }

    // Only mark complete if it's a submission AND accepted
    if (result.accepted && isSubmissionRef.current) {
      setCurrentStatus('COMPLETED');
      onCompleteRef.current(problem.id);
      setShowSuccess(true);
    } else if (result.stderr || result.compile_output) {
      // Auto-trigger AI for errors on all platforms
      generateAIHelp(result.stderr || result.compile_output || "Unknown Error");
    }
  }, [user?._id, problem.id, selectedLanguage]); // generateAIHelp is stable (defined outside? no, inside. Need to fix that too)

  // generateAIHelp depends on state, let's stabilize it or just leave it since it's not passed to Compiler
  // Compiler receives onRun={handleRunResult}
  // So handleRunResult MUST be stable.

  const handleReset = () => {
    if (confirm('Reset code to initial template?')) {
      const starter = (problem as any).starter_codes?.[selectedLanguage] || problem.initialCode || '';
      setUserCode(starter);
      setEditorSyncCode(starter);
      setExecutionResult(null);
      setAiExplanation(null);
      setUserHasTyped(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // SUB-RENDERS
  // ═══════════════════════════════════════════════════════════

  /* MERGED EXAMPLES INTO DESCRIPTION */
  const renderDescription = () => (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-white tracking-tight">{problem.title}</h2>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${problem.difficulty === 'easy' ? 'text-emerald-400 border-emerald-500/20' : 'text-rose-400 border-rose-500/20'}`}>{problem.difficulty}</span>
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase text-slate-500 border border-white/5">{problem.concept || 'C LANGUAGE'}</span>
        </div>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{problem.description}</p>

      {/* INPUT FORMAT */}
      {problem.inputFormat && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-indigo-400 uppercase">Input Format</h4>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs text-slate-400 italic">{problem.inputFormat}</div>
        </div>
      )}

      {/* EXAMPLES SECTION (Merged from previous tab) */}
      {problem.test_cases && problem.test_cases.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-white/5">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Terminal size={14} className="text-indigo-400" />
            Examples
          </h3>
          {problem.test_cases.map((tc, i) => (
            <div key={i} className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-500 uppercase">Example {i + 1}</h4>
              <div className="bg-slate-950 border border-white/5 rounded-xl overflow-hidden font-mono text-xs">
                {tc.stdin && <div className="p-4 border-b border-white/5"><div className="text-amber-500 mb-1 opacity-50 text-[9px]">INPUT</div><div className="text-amber-400">{tc.stdin}</div></div>}
                <div className="p-4"><div className="text-emerald-500 mb-1 opacity-50 text-[9px]">EXPECTED</div><div className="text-emerald-400">{tc.expected_output}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderResults = () => {
    if (!executionResult) return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30 group">
        <Terminal size={48} className="text-slate-700 mb-4 group-hover:scale-110 transition-transform" />
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Execute code to see output</p>
      </div>
    );

    const hasError = executionResult.stderr || (executionResult.compile_output && !executionResult.accepted);

    return (
      <div className="p-6 space-y-6 animate-in slide-in-from-bottom-2 duration-300">
        <div className={`ai-status-card ${hasError ? 'ai-error-card' : ''} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${executionResult.accepted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {executionResult.accepted ? <Check size={20} /> : <AlertCircle size={20} />}
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-tight">{executionResult.accepted ? 'Accepted' : 'Failed'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{executionResult.status.description}</p>
            </div>
          </div>
          {!executionResult.accepted && !aiExplanation && !isGeneratingExplanation && (
            <button onClick={() => generateAIHelp(executionResult.stderr || executionResult.compile_output || "Logic Error")} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase transition-colors">Ask AI Mentor</button>
          )}
          {isGeneratingExplanation && (
            <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-bold">
              <Loader2 size={14} className="animate-spin" />
              <span>AI Mentor analyzing...</span>
            </div>
          )}
        </div>

        {(aiExplanation || isGeneratingExplanation) && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-indigo-400" />
              <span className="text-[10px] font-black text-white uppercase">AI Diagnostics</span>
              {isGeneratingExplanation && <Loader2 size={12} className="animate-spin text-indigo-400" />}
            </div>
            <div className="grid gap-3">
              {aiExplanation ? (() => {
                const patterns = ['LOCATION:', 'CONCEPT:', 'FIX:'];
                const sections = patterns.map(p => {
                  const regex = new RegExp(`${p}\\s*([^]*?)(?=${patterns.join('|')}|$)`, 'i');
                  const match = aiExplanation.match(regex);
                  if (!match || !match[1].trim()) return null;
                  return <AISection key={p} title={p.replace(':', '')} content={match[1].trim()} icon={<Zap size={12} />} />;
                }).filter(Boolean);

                // If no sections matched, show raw response as fallback
                if (sections.length === 0) {
                  return (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{aiExplanation}</p>
                    </div>
                  );
                }

                return sections;
              })() : (
                <div className="text-slate-400 text-xs italic">Analyzing your code...</div>
              )}
            </div>
          </div>
        )}

        {(executionResult as any).testResults && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-600 uppercase">Test Case Breakdown</h4>
            <div className="grid grid-cols-2 gap-2">
              {(() => {
                const testResults = (executionResult as any).testResults;
                console.log('[Test Results]', testResults);
                return testResults.map((tr: any, i: number) => (
                  <div key={i} className={`p-3 rounded-lg border flex items-center justify-between ${tr.passed ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                    <span className="text-[10px] font-bold text-slate-400">Case {i + 1}</span>
                    {tr.passed ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-rose-500" />}
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-slate-600 uppercase">Standard Output</h4>
          <pre className="bg-slate-950 p-4 rounded-xl border border-white/5 text-xs text-slate-300 font-mono overflow-auto max-h-40">{executionResult.stdout || '(Empty)'}</pre>
        </div>

        {hasError && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-rose-500 uppercase opacity-50">Compiler Registry</h4>
            <pre className="bg-rose-500/[0.03] p-4 rounded-xl border border-rose-500/10 text-xs text-rose-400/80 font-mono overflow-auto">{executionResult.stderr || executionResult.compile_output}</pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#000000] overflow-hidden font-sans practice-ui-root">
      {/* HEADER */}
      <header className="h-14 shrink-0 bg-[#000000] border-b border-white/5 flex items-center px-4 z-50">
        <button onClick={onBack} className="p-2 -ml-1 text-slate-500 hover:text-white transition"><ChevronLeft size={24} /></button>
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20"><Code2 size={16} className="text-indigo-400" /></div>
          <h1 className="text-sm font-black text-white uppercase tracking-tight italic">{problem.title}</h1>
        </div>
      </header>

      {/* 3-COLUMN LAYOUT DESKTOP */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* LEFT: INFORMATION */}
        <div className="hidden lg:flex flex-col w-[340px] bg-[#000000] border-r border-white/5">
          <div className="pro-panel-header">
            <div className="pro-tab-btn active"><BookOpen size={14} />Description</div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">{renderDescription()}</div>
        </div>

        {/* CENTER: IDE */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0d0e1a] z-10">
          <div className="editor-toolbar">
            <div className="flex items-center gap-4">
              <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="bg-transparent border-none text-indigo-400 text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer">
                {Object.keys((problem as any).starter_codes || {}).map(l => <option key={l} value={l} className="bg-slate-900">{l.toUpperCase()}</option>)}
              </select>
              <div className="w-px h-4 bg-white/10" />
              <button onClick={handleReset} className="btn-icon-pro" title="Reset Code"><RotateCcw size={16} /></button>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden xl:block kbd-hint mr-2 opacity-50 italic">Ctrl + Enter</span>
              <button onClick={handleRunCode} disabled={isSubmitting} className="btn-run-pro">
                {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Play size={10} fill="currentColor" />}
                Run Code
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="btn-submit-pro">Submit</button>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden">
            {/* Mobile layout fallback switch */}
            <div className="h-14 bg-slate-900/50 flex shrink-0 lg:hidden">
              {['PROBLEM', 'CODE', 'RESULT'].map(t => (
                <button key={t} onClick={() => setActiveTab(t as TabType)} className={`flex-1 text-[10px] font-black tracking-widest ${activeTab === t ? 'text-indigo-400' : 'text-slate-600'}`}>{t}</button>
              ))}
            </div>
            <div className="absolute inset-0 top-14 lg:top-0 h-[calc(100%-56px)] lg:h-full">
              {(activeTab === 'CODE' || window.innerWidth >= 1024) && (
                <Compiler
                  key={problem.id}
                  language={selectedLanguage.toLowerCase()}
                  initialCode={editorSyncCode}
                  onCodeChange={setUserCode}
                  onRun={handleRunResult}
                  ref={compilerRef}
                  readOnly={isSubmitting}
                />
              )}
              {(activeTab === 'PROBLEM' && window.innerWidth < 1024) && <div className="h-full overflow-y-auto no-scrollbar bg-slate-950">{renderDescription()}</div>}
              {(activeTab === 'RESULT' && window.innerWidth < 1024) && <div className="h-full overflow-y-auto no-scrollbar bg-slate-950">{renderResults()}</div>}
            </div>

            {/* MOBILE KEYBOARD ACCESSORY & DEL BUTTON */}
            <div className="lg:hidden absolute bottom-0 left-0 right-0 h-12 bg-[#0d0e1a] border-t border-white/5 flex items-center gap-1.5 px-3 overflow-x-auto no-scrollbar z-20">
              {['{', '}', '(', ')', ';', '"', "'", '<', '>', '/', '*', '=', '+', ':'].map(char => (
                <button
                  key={char}
                  onClick={() => compilerRef.current?.insertText(char)}
                  className="h-8 min-w-[36px] bg-slate-800/50 border border-white/5 rounded-lg text-slate-300 font-mono text-sm active:bg-indigo-600 transition"
                >
                  {char}
                </button>
              ))}
              <button
                onClick={() => compilerRef.current?.deleteLastChar()}
                className="h-8 px-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 font-black text-[9px] uppercase active:scale-95 transition"
              >
                DEL
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: RESULTS & AI */}
        <div className="hidden lg:flex flex-col w-[380px] bg-[#000000] border-l border-white/5 shrink-0 overflow-hidden">
          <div className="pro-panel-header px-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Zap size={14} />Execution Results</span>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">{renderResults()}</div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-[#000000]/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-700">
          <div className="w-full max-w-sm bg-[#0d0e1a] border border-emerald-500/20 rounded-[3rem] p-10 flex flex-col items-center text-center gap-8 shadow-2xl">
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30 scale-110"><Check size={56} strokeWidth={4} /></div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Mission Accomplished!</h2>
              <p className="text-slate-500 font-medium italic text-sm">Your solution is accurate and optimized.</p>
            </div>
            <div className="w-full space-y-4">
              {hasNextProblem ? (
                <button onClick={() => { setShowSuccess(false); onNext?.(); }} className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition shadow-xl shadow-indigo-600/20">Next Challenge</button>
              ) : (
                <button onClick={onBack} className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Return to Home</button>
              )}
              <button onClick={() => setShowSuccess(false)} className="w-full h-14 bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:text-white transition">Review Syntax</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingWorkspace;
