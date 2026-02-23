import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, RotateCcw, Check, Loader2, AlertCircle, BookOpen, Code2, Zap, X, Terminal, Bot, ChevronDown, ChevronUp, Clock } from 'lucide-react';
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
  topicTitle?: string;
  topicId?: string;
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
  testResults?: any[];
}

interface AISectionProps {
  title: string;
  content: string;
  icon: React.ReactNode;
}

const AISection: React.FC<AISectionProps> = ({ title, content, icon }) => (
  <div className="bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-2 translate-y-0 hover:translate-y-[-2px] transition-transform duration-300">
    <div className="flex items-center gap-2">
      <div className="text-indigo-600 dark:text-indigo-400">{icon}</div>
      <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">{title}</span>
    </div>
    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{content}</p>
  </div>
);

const CodingWorkspace: React.FC<CodingWorkspaceProps> = ({
  problem,
  status,
  onBack,
  onComplete,
  onNext,
  hasNextProblem,
  nextProblemTitle,
  topicTitle = 'C Language',
  topicId
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('PROBLEM');
  const [viewportHeight, setViewportHeight] = useState(window.visualViewport?.height || window.innerHeight);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  // Code state management
  const [userCode, setUserCode] = useState(() => {
    const localSaved = localStorage.getItem(`practice_code_${problem.id}`);
    if (localSaved) return localSaved;
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
    const localLang = localStorage.getItem(`practice_lang_${problem.id}`);
    const starterCodes = (problem as any).starter_codes || {};
    if (localLang && starterCodes[localLang]) return localLang;
    return Object.keys(starterCodes)[0] || 'c';
  });
  /* Removed sidebarTab state */
  const [isEditingCompleted, setIsEditingCompleted] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0);

  // centralized test case aggregation
  const allTests = useMemo(() => [
    ...(problem.testCases || []),
    ...(problem.test_cases || []),
    ...(problem.hiddenTestCases || [])
  ], [problem]);

  const visibleTests = useMemo(() =>
    allTests.filter(tc => !tc.isHidden && !tc.is_hidden),
    [allTests]
  );

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            // If we loaded progress, consider it "typed" to prevent language switches from wiping it
            setUserHasTyped(true);
          }
          if (progress.language_used) setSelectedLanguage(progress.language_used);
        }
      } catch (err) { console.error(err); }
    };
    fetchProgress();
  }, [problem.id]);

  // Debounced Autosave to LocalStorage
  useEffect(() => {
    if (!userCode.trim()) return;
    const timer = setTimeout(() => {
      localStorage.setItem(`practice_code_${problem.id}`, userCode);
      localStorage.setItem(`practice_lang_${problem.id}`, selectedLanguage);
    }, 1000);
    return () => clearTimeout(timer);
  }, [userCode, selectedLanguage, problem.id]);

  // Synchronize code when language changes, but ONLY if user hasn't typed anything yet
  useEffect(() => {
    if (!userHasTyped) {
      const starterCodes = (problem as any).starter_codes || {};
      const newStarter = starterCodes[selectedLanguage] || problem.initialCode || '';
      setUserCode(newStarter);
      setEditorSyncCode(newStarter);
    }
  }, [selectedLanguage, problem.id, userHasTyped]);

  const [isSubmission, setIsSubmission] = useState(false);

  const handleRunCode = async () => {
    console.log("[CodingWorkspace] Run Code Clicked");
    if (!userCode.trim() || isSubmitting) {
      console.warn("[CodingWorkspace] Run Code skipped: Code empty or submitting");
      return;
    }
    setIsSubmitting(true);
    setIsSubmission(false); // Run mode: Just execute, don't submit
    setExecutionResult(null);
    setAiExplanation(null);
    console.log("[CodingWorkspace] Calling Code Execution...");
    try {
      if (compilerRef.current) {
        if (visibleTests.length > 0) {
          console.log(`[CodingWorkspace] Running against ${visibleTests.length} sample tests...`);
          await compilerRef.current?.runTests(visibleTests);
        } else {
          await compilerRef.current?.runCode();
        }
        console.log("[CodingWorkspace] Code Execution Completed");
      } else {
        console.error("[CodingWorkspace] Compiler Ref is NULL");
      }
    } catch (e) { console.error("[CodingWorkspace] Code Execution Failed", e); }
    finally { setIsSubmitting(false); }
  };

  const handleSubmit = async () => {
    console.log("[CodingWorkspace] Submit Clicked");
    if (!userCode.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setIsSubmission(true); // Submit mode: Verify and complete
    setExecutionResult(null);
    setAiExplanation(null);
    try {
      if (allTests.length > 0) {
        await compilerRef.current?.runTests(allTests);
      } else {
        // Fallback for problems without test cases: regular run counts as submission check
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
    console.log('[RESULT] Received result:', { accepted: result.accepted, isSubmission: isSubmissionRef.current });
    setExecutionResult(result);
    setActiveTab('RESULT');

    // Auto-select first failing test case
    const firstFail = result.testResults?.findIndex((r: any) => !r.passed);
    setSelectedTestCaseIndex(firstFail !== undefined && firstFail !== -1 ? firstFail : 0);

    // Only save attempt if it's a submission
    if (user?._id && isSubmissionRef.current) {
      console.log('[SAVE] Saving practice attempt...', { problemId: problem.id, accepted: result.accepted });
      await supabaseDB.savePracticeAttempt(problem.id, userCodeRef.current, result.accepted, selectedLanguage, result.time || '0s');
      console.log('[SAVE] Practice attempt saved successfully');
    }

    // Only mark complete if it's a submission AND accepted
    if (result.accepted && isSubmissionRef.current) {
      console.log('[COMPLETE] Marking problem as completed');
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
    <div className="p-6 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar h-full">
      {/* 1. Header Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{problem.title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${problem.difficulty === 'easy' ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
            problem.difficulty === 'medium' ? 'text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/5' :
              'text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/5'
            }`}>
            {problem.difficulty}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
            {problem.concept || 'PRACTICE'}
          </span>
          {problem.estimatedTime && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center gap-1.5">
              <Clock size={10} /> {problem.estimatedTime}m
            </span>
          )}
        </div>
      </div>

      {/* 2. Problem Statement */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Problem Statement</h3>
        <div className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium space-y-2">
          {problem.description.split(/```[\w]*\n?([\s\S]*?)```/g).map((part: string, i: number) => {
            if (i % 2 === 1) {
              // Code block → styled box with indigo tint
              return (
                <pre key={i} className="bg-indigo-950/60 dark:bg-indigo-950/80 border border-indigo-500/30 rounded-xl px-4 py-3 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                  {part.trim()}
                </pre>
              );
            }
            // Plain text — detect heading lines
            if (!part) return null;
            const lines = part.split('\n');
            return (
              <span key={i} className="block space-y-1">
                {lines.map((line, j) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <br key={j} />;
                  // Heading: short line, no leading dash/bullet, no lowercase-only start
                  const isHeading = trimmed.length > 0 &&
                    trimmed.length < 50 &&
                    !trimmed.startsWith('-') &&
                    !trimmed.startsWith('•') &&
                    /^[A-Z]/.test(trimmed) &&
                    !trimmed.includes('. ') &&
                    j > 0 && lines[j - 1].trim() === '';
                  return isHeading ? (
                    <span key={j} className="block text-amber-400 dark:text-amber-300 font-black text-[15px] pt-2">
                      {trimmed}
                    </span>
                  ) : (
                    <span key={j} className="block text-slate-300 dark:text-slate-300 text-[13px]">
                      {line}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      </div>



    </div>
  );

  // Track visual viewport for mobile keyboard positioning
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleViewportChange = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      const fullHeight = window.innerHeight;
      setViewportHeight(vh);
      setIsKeyboardVisible(vh < fullHeight * 0.85);
    };

    window.visualViewport.addEventListener('resize', handleViewportChange);
    window.visualViewport.addEventListener('scroll', handleViewportChange);
    handleViewportChange();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
    };
  }, []);

  const symbols = ['{', '}', '(', ')', '[', ']', ';', ':', '"', "'", '<', '>', '=', '+', '-', '*', '/', '&', '|', '!', ',', '.'];

  const renderMobileAccessory = () => {
    if (activeTab !== 'CODE' || !isKeyboardVisible) return null;

    return (
      <div
        className="fixed left-0 right-0 z-[1000] bg-slate-900/95 backdrop-blur-xl border-t border-white/10 flex items-center gap-1.5 px-3 h-12 transition-all duration-300 ease-out animate-in slide-in-from-bottom flex-nowrap overflow-x-auto no-scrollbar"
        style={{
          top: `${window.visualViewport?.height || window.innerHeight}px`,
          transform: `translateY(-100%)`, // Position exactly above the bottom of the visible area (keyboard top)
        }}
      >
        <div className="flex items-center gap-1.5 py-1">
          {symbols.map(char => (
            <button
              key={char}
              onMouseDown={(e) => { e.preventDefault(); compilerRef.current?.insertText(char); }}
              className="h-9 min-w-[36px] bg-white/10 border border-white/10 rounded-lg text-white font-mono text-lg font-bold flex items-center justify-center active:bg-indigo-600 active:scale-95 transition-all touch-manipulation"
            >
              {char}
            </button>
          ))}
          <button
            onMouseDown={(e) => { e.preventDefault(); compilerRef.current?.deleteLastChar(); }}
            className="h-9 px-3 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-400 font-black text-[10px] uppercase active:scale-95 transition-all touch-manipulation"
          >
            DEL
          </button>
        </div>
      </div>
    );
  };

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
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{executionResult.accepted ? 'Accepted' : 'Failed'}</p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase">{executionResult.status.description}</p>
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

        {/* ── COMPILER / RUNTIME ERROR ── shown immediately after status */}
        {hasError && (
          <div className="rounded-xl overflow-hidden border border-rose-500/40 shadow-lg shadow-rose-500/5">
            {/* Terminal header bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-950/60 border-b border-rose-500/20">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
              </div>
              <Terminal size={12} className="text-rose-400 ml-1" />
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                {executionResult.compile_output && !executionResult.stderr ? 'Compilation Error' : 'Runtime Error'}
              </span>
            </div>
            {/* Error output */}
            <pre className="bg-[#0d0302] p-4 text-xs text-rose-300 font-mono overflow-auto whitespace-pre-wrap leading-relaxed max-h-60">
              {(executionResult.stderr || executionResult.compile_output || '').trim()}
            </pre>
          </div>
        )}

        {(aiExplanation || isGeneratingExplanation) && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">AI Diagnostics</span>
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
                    <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{aiExplanation}</p>
                    </div>
                  );
                }

                return sections;
              })() : (
                <div className="text-slate-500 dark:text-slate-400 text-xs italic">Analyzing your code...</div>
              )}
            </div>
          </div>
        )}

        {executionResult.testResults && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                {isSubmission ? 'Submission Results' : 'Test Case Breakdown'}
              </h4>
              <span className="text-[10px] font-black text-indigo-400">
                {executionResult.testResults.filter((r: any) => r.passed).length} / {executionResult.testResults.length} PASSED
              </span>
            </div>

            {isSubmission ? (
              /* Simplified Submission View */
              <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="p-8 bg-slate-900/40 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4 text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${executionResult.accepted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                    {executionResult.accepted ? <Check size={32} /> : <X size={32} />}
                  </div>
                  <div>
                    <h3 className={`text-xl font-black uppercase tracking-tight ${executionResult.accepted ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {executionResult.accepted ? 'Success!' : 'Try Again'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      {executionResult.testResults.filter((r: any) => r.passed).length} of {executionResult.testResults.length} test cases passed
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                  {executionResult.testResults.map((tr: any, i: number) => (
                    <div key={i} className={`h-10 rounded-xl flex flex-col items-center justify-center border transition-all ${tr.passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`} title={`Test Case ${i + 1}: ${tr.passed ? 'Passed' : 'Failed'}`}>
                      <span className="text-[8px] font-black opacity-50 mb-0.5">{i + 1}</span>
                      {tr.passed ? <Check size={12} /> : <X size={12} />}
                    </div>
                  ))}
                </div>

                {!executionResult.accepted && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-600 text-center font-medium italic">
                    Tip: Use 'Run Code' to see detailed input/output for sample cases.
                  </p>
                )}
              </div>
            ) : (
              /* Detailed Run Results View */
              <div className="space-y-8">
                {/* Visible Sample Results */}
                {executionResult.testResults.map((tr: any, i: number) => {
                  const currentTest = allTests[i];
                  const isHidden = tr.isHidden || currentTest?.isHidden || currentTest?.is_hidden;
                  if (isHidden) return null;

                  return (
                    <div key={i} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${tr.passed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                          {tr.passed ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-rose-500" />}
                        </div>
                        <h5 className={`text-xs font-bold uppercase tracking-widest ${tr.passed ? 'text-emerald-500' : 'text-rose-500'}`}>Sample Case {i + 1}</h5>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Input */}
                        {(tr.stdin || allTests[i]?.input || allTests[i]?.stdin) && (
                          <div className="space-y-2 col-span-full">
                            <div className="flex items-center gap-2">
                              <Terminal size={12} className="text-slate-500" />
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Input</span>
                            </div>
                            <div className="p-3 bg-slate-900/50 border border-white/5 rounded-lg font-mono text-xs text-slate-300">
                              {tr.stdin || allTests[i]?.input || allTests[i]?.stdin}
                            </div>
                          </div>
                        )}

                        {/* Expected */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Check size={12} className="text-emerald-500/50" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expected Output</span>
                          </div>
                          <div className="p-3 bg-slate-900/50 border border-emerald-500/10 rounded-lg font-mono text-xs text-emerald-400/80">
                            {tr.expected || allTests[i]?.expectedOutput || allTests[i]?.expected_output}
                          </div>
                        </div>

                        {/* Actual */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Play size={12} className={tr.passed ? "text-emerald-500/50" : "text-rose-500/50"} />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Your Output</span>
                          </div>
                          <div className={`p-3 bg-slate-900/50 border rounded-lg font-mono text-xs ${tr.passed
                            ? 'border-emerald-500/10 text-emerald-400'
                            : 'border-rose-500/10 text-rose-400'
                            }`}>
                            {tr.actual || '(Empty)'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Hidden Cases Summary */}
                {executionResult.testResults.some((tr: any) => tr.isHidden) && (
                  <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-500" />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Hidden Test Cases</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {executionResult.testResults.map((tr: any, i: number) => {
                        if (!tr.isHidden) return null;
                        return (
                          <div key={i} className={`w-6 h-6 rounded flex items-center justify-center border ${tr.passed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                            {tr.passed ? <Check size={8} className="text-emerald-500" /> : <X size={8} className="text-rose-500" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-black overflow-hidden font-sans practice-ui-root transition-colors duration-300">
      {/* HEADER */}
      <header className="h-14 shrink-0 bg-white dark:bg-black border-b border-slate-200 dark:border-white/10 flex items-center px-4 z-50 justify-between">
        <div className="flex items-center gap-1 sm:gap-4 overflow-hidden">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white transition shrink-0"><ChevronLeft size={20} /></button>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 overflow-hidden">
            <span className="hidden xl:inline hover:text-white cursor-pointer transition-colors shrink-0" onClick={() => navigate('/practice')}>Practice Hub</span>
            <ChevronRight size={10} className="hidden xl:block shrink-0" />
            <span
              className="hidden xl:inline hover:text-white cursor-pointer transition-colors shrink-0"
              onClick={() => navigate(topicId ? `/practice?topic=${topicId}` : '/practice')}
            >
              {topicTitle}
            </span>
            <ChevronRight size={10} className="hidden xl:block shrink-0" />
            <span className="text-white truncate max-w-[100px] sm:max-w-none">{problem.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* User Profile / Timer could go here */}
        </div>
      </header>

      {/* 3-COLUMN LAYOUT DESKTOP */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* LEFT: INFORMATION */}
        <div className="hidden lg:flex flex-col w-[340px] bg-white dark:bg-black border-r border-slate-200 dark:border-white/10">
          <div className="pro-panel-header border-b border-slate-100 dark:border-white/10">
            <div className="pro-tab-btn active text-indigo-600 dark:text-indigo-400"><BookOpen size={14} />Description</div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">{renderDescription()}</div>
        </div>

        {/* CENTER: IDE */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-100 dark:bg-black z-10 transition-colors duration-300">
          <div className="editor-toolbar border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d0e1a] px-3 h-9 flex items-center justify-between">
            {/* Language Selector & Reset */}
            <div className="flex items-center gap-2 sm:gap-3">
              <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="bg-transparent border-none text-indigo-400 text-[9px] font-bold uppercase tracking-wider focus:ring-0 cursor-pointer p-0 max-w-[70px] sm:max-w-none truncate">
                {Object.keys((problem as any).starter_codes || {}).map(l => <option key={l} value={l} className="bg-[#0f111a] text-white">{l.toUpperCase()}</option>)}
              </select>
              <div className="w-px h-3 bg-white/10" />
              <button onClick={handleReset} className="text-slate-500 hover:text-white transition" title="Reset Code"><RotateCcw size={12} /></button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleRunCode}
                disabled={isSubmitting}
                title="Run Code"
                className="h-6 px-2 sm:px-3 bg-[#2e3142] hover:bg-[#3e4155] text-white rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95"
              >
                {isSubmitting ? <Loader2 size={10} className="animate-spin" /> : <Play size={8} fill="currentColor" />}
                <span>Run Code</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                title="Submit Solution"
                className="h-6 px-3 sm:px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                <div className="flex items-center gap-1.5">
                  <Check size={10} className="xs:hidden" />
                  <span className="hidden xs:inline">Submit</span>
                  <span className="xs:hidden font-black">SUBMIT</span>
                </div>
              </button>
            </div>
          </div>
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* MOBILE TABS (Switch) */}
            <div className="h-14 bg-white dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5 flex shrink-0 lg:hidden px-2">
              {['PROBLEM', 'CODE', 'RESULT'].map(t => (
                <button key={t} onClick={() => setActiveTab(t as TabType)} className={`flex-1 text-[10px] font-black tracking-widest transition-all ${activeTab === t ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}>{t}</button>
              ))}
            </div>
            <div className="flex-1 flex flex-col relative overflow-hidden">
              <div className="flex-1 relative overflow-hidden">
                {(activeTab === 'CODE' || isLargeScreen) && (
                  <Compiler
                    key={problem.id}
                    language={selectedLanguage.toLowerCase()}
                    initialCode={editorSyncCode}
                    onCodeChange={(code) => {
                      setUserCode(code);
                      if (!userHasTyped && code.trim() !== editorSyncCode.trim()) {
                        setUserHasTyped(true);
                      }
                    }}
                    onRun={handleRunResult}
                    ref={compilerRef}
                    readOnly={isSubmitting}
                  />
                )}
                {(activeTab === 'PROBLEM' && !isLargeScreen) && <div className="absolute inset-0 h-full overflow-y-auto no-scrollbar bg-white dark:bg-slate-950">{renderDescription()}</div>}
                {(activeTab === 'RESULT' && !isLargeScreen) && <div className="absolute inset-0 h-full overflow-y-auto no-scrollbar bg-white dark:bg-slate-950">{renderResults()}</div>}
              </div>

              {renderMobileAccessory()}
            </div>
          </div>
        </div>

        {/* RIGHT: RESULTS & AI */}
        <div className="hidden lg:flex flex-col w-[380px] bg-white dark:bg-black border-l border-slate-200 dark:border-white/10 shrink-0 overflow-hidden transition-colors duration-300">
          <div className="pro-panel-header px-4 border-b border-slate-100 dark:border-white/10">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2"><Zap size={14} className="text-amber-500" />Execution Results</span>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">{renderResults()}</div>
        </div>
      </div>

      {/* SUCCESS MODAL REMOVED PER USER REQUEST */}
    </div>
  );
};

export default CodingWorkspace;
