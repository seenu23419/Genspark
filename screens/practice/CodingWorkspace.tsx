import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Play, RotateCcw, Check, Loader2, AlertCircle, BookOpen, Code2, Zap, X, Terminal, Bot, ChevronDown, ChevronUp, Cpu, Globe } from 'lucide-react';
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

interface CollapsibleSectionProps {
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

const AISection: React.FC<AISectionProps> = ({ title, content, icon }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-2">
          <div className="text-indigo-400">{icon}</div>
          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-3 animate-in slide-in-from-top-1 duration-200">
          <p className="text-xs text-slate-400 leading-relaxed font-medium">{content}</p>
        </div>
      )}
    </div>
  );
};

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, content, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition"
      >
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
        {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>
      {isOpen && (
        <div className="px-4 py-3 bg-slate-950 border-t border-white/5 animate-in slide-in-from-top duration-200">
          {content}
        </div>
      )}
    </div>
  );
};

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
  const [userCode, setUserCode] = useState(() => {
    const starterCodes = (problem as any).starter_codes || {};
    const availableLanguages = Object.keys(starterCodes);
    const defaultLang = availableLanguages.length > 0 ? availableLanguages[0] : 'c';
    return starterCodes[defaultLang] || problem.initialCode || '';
  });
  const [currentStatus, setCurrentStatus] = useState<StatusType>(status);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [userHasTyped, setUserHasTyped] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // Detect language from starter codes or fall back to 'c'
    const starterCodes = (problem as any).starter_codes || {};
    const availableLanguages = Object.keys(starterCodes);
    return availableLanguages.length > 0 ? availableLanguages[0] : 'c';
  });
  const [isEditingCompleted, setIsEditingCompleted] = useState(false);

  // Rate Limiting & Cooldown
  const [cooldown, setCooldown] = useState(0);
  const [runHistory, setRunHistory] = useState<number[]>([]);

  const compilerRef = useRef<CompilerRef>(null);

  // Mobile Viewport Height Handling
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      setViewportHeight(window.visualViewport?.height || window.innerHeight);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  // Initial load
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progress = await supabaseDB.getPracticeProgress(problem.id);
        if (progress) {
          if (progress.status === 'completed') {
            setCurrentStatus('COMPLETED');
            if (progress.code_snapshot) {
              setUserCode(progress.code_snapshot);
            }
          } else if (progress.status === 'attempted') {
            setCurrentStatus('IN_PROGRESS');
            if (progress.code_snapshot) {
              setUserCode(progress.code_snapshot);
            }
          }
          if (progress.language_used) {
            setSelectedLanguage(progress.language_used);
            if (!userHasTyped && !progress.code_snapshot) {
              const langKey = progress.language_used.toLowerCase();
              const starter = (problem as any).starter_codes?.[langKey] || problem.initialCode;
              setUserCode(starter);
            }
          }
        } else {
          // No progress, use starter codes or initial code
          const langKey = selectedLanguage.toLowerCase();
          const starter = (problem as any).starter_codes?.[langKey] || problem.initialCode || '';

          if (starter) {
            // Add placeholder comment if not already present
            let codeToSet = starter;
            if (!starter.includes('Write your code')) {
              codeToSet = starter.replace(
                /(\{[\s\n]*)/,
                '{\n    // Write your code here\n    '
              );
            }
            setUserCode(codeToSet);
          }
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      }
    };
    fetchProgress();
  }, [problem.id]);

  // Cooldown effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleRunCode = async () => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRuns = runHistory.filter(t => t > oneMinuteAgo);

    if (recentRuns.length >= 3) {
      alert("Rate limit reached: Max 3 runs per minute.");
      return;
    }

    if (!userCode.trim()) {
      alert("Please type some code first.");
      return;
    }

    setIsSubmitting(true);
    setRunHistory([...recentRuns, now]);
    setExecutionResult(null); // Clear previous results

    try {
      if (problem.test_cases && problem.test_cases.length > 0) {
        await (compilerRef.current as any)?.runTests(problem.test_cases);
      } else {
        await compilerRef.current?.runCode();
      }
    } catch (error) {
      console.error("Run failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateErrorExplanation = async (error: string, code: string, lang: string) => {
    setIsGeneratingExplanation(true);
    try {
      const prompt = `You are a strict programming tutor. Explain the compiler error using this structure:
LOCATION: (Which line contains the error)
WHAT: (What went wrong in one simple sentence)
CONCEPT: (Why it is wrong / language rule)
FIX: (How to fix in words ONLY. DO NOT PROVIDE CODE OR SOLUTIONS.)

Language: ${lang}
Error: ${error}

Respond EXACTLY in the format above. NO CODE BLOCKS.`;

      let fullExplanation = '';
      for await (const chunk of genSparkAIService.generateChatStream(prompt, false, [])) {
        fullExplanation += chunk;
      }
      setAiExplanation(fullExplanation || 'Unable to generate feedback.');
    } catch (error) {
      setAiExplanation('Unable to generate feedback.');
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  const parseAIExplanation = (text: string) => {
    const sections: Record<string, string> = {};
    const keys = ['LOCATION', 'WHAT', 'CONCEPT', 'FIX'];
    let currentKey = '';
    text.split('\n').forEach(line => {
      const foundKey = keys.find(k => line.startsWith(`${k}:`));
      if (foundKey) {
        currentKey = foundKey;
        sections[currentKey] = line.replace(`${currentKey}:`, '').trim();
      } else if (currentKey) {
        sections[currentKey] += ' ' + line.trim();
      }
    });
    return sections;
  };

  const handleRunResult = async (result: any) => {
    // Add the input used if possible - for Piston it might be from the problem definition
    const enrichedResult = { ...result, input: problem.sampleInput };
    setExecutionResult(enrichedResult);
    setAiExplanation(null);
    setActiveTab('RESULT');

    if (currentStatus === 'NOT_STARTED') setCurrentStatus('IN_PROGRESS');

    // CRITICAL: Save progress immediately
    try {
      if (user?._id) {
        await supabaseDB.savePracticeAttempt(problem.id, userCode, result.accepted, selectedLanguage);
      }
    } catch (err) {
      console.error("Failed to save progress:", err);
    }

    if (result.accepted) {
      setCurrentStatus('COMPLETED');
      // CRITICAL: Call onComplete to update parent state
      try {
        onComplete(problem.id);
      } catch (err) {
        console.error("Failed to mark complete:", err);
      }
      setShowSuccess(true);
    }
  };

  const handleReset = () => {
    if (confirm('Reset code to initial template?')) {
      const langKey = selectedLanguage.toLowerCase();
      const starter = (problem as any).starter_codes?.[langKey] || problem.initialCode || '';
      setUserCode(starter);
      setExecutionResult(null);
      setAiExplanation(null);
      setUserHasTyped(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // REUSABLE SECTIONS
  // ═══════════════════════════════════════════════════════════

  const renderProblemView = () => (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Problem Title and Badge */}
      <div className="space-y-4">
        <h1 className="text-3xl font-black text-white tracking-tight">{problem.title}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${problem.difficulty === 'easy' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : problem.difficulty === 'medium' ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' : 'text-rose-400 border-rose-500/20 bg-rose-500/5'}`}>
            {problem.difficulty?.toUpperCase()}
          </span>
          {problem.concept && (
            <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {problem.concept}
            </span>
          )}
          {problem.estimatedTime && (
            <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-800/50 text-slate-400 border border-white/5">
              ⏱ {problem.estimatedTime}-{problem.estimatedTime + 1} min
            </span>
          )}
        </div>
      </div>

      {/* Problem Description */}
      <div className="bg-slate-900/40 rounded-2xl p-5 md:p-6 border border-white/5 space-y-4 shadow-inner">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-indigo-400" />
          <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Objective & Details</h2>
        </div>
        <p className="text-slate-200 text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap">{problem.description}</p>
      </div>

      {/* Input/Output Format */}
      {(problem.inputFormat && problem.inputFormat !== "N/A") || (problem.outputFormat && problem.outputFormat !== "N/A") ? (
        <div className="space-y-3">
          <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider">Format Specification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {problem.inputFormat && problem.inputFormat !== "N/A" && (
              <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5 space-y-2">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Input Format</h3>
                <p className="text-xs text-slate-300 font-medium">{problem.inputFormat}</p>
              </div>
            )}
            {problem.outputFormat && problem.outputFormat !== "N/A" && (
              <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5 space-y-2">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Output Format</h3>
                <p className="text-xs text-slate-300 font-medium">{problem.outputFormat}</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Sample Test Cases - LeetCode Style */}
      {problem.test_cases && problem.test_cases.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider">Test Cases</h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full">{problem.test_cases.length} test{problem.test_cases.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-3">
            {problem.test_cases.map((testCase, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-xl overflow-hidden hover:border-indigo-500/30 transition">
                {/* Test Case Header */}
                <div className="px-5 py-3 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Example {idx + 1}</span>
                  </div>
                </div>

                {/* Test Case Content */}
                <div className="space-y-4 p-5">
                  {/* Input Section */}
                  {testCase.stdin && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Input:</span>
                      </div>
                      <div className="bg-slate-950/80 border border-amber-500/10 rounded-lg p-3 overflow-x-auto">
                        <code className="text-amber-300 font-mono text-xs block whitespace-pre-wrap break-words">{testCase.stdin}</code>
                      </div>
                    </div>
                  )}

                  {/* Output Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Output:</span>
                    </div>
                    <div className="bg-slate-950/80 border border-emerald-500/10 rounded-lg p-3 overflow-x-auto">
                      <code className="text-emerald-300 font-mono text-xs block whitespace-pre-wrap break-words">{testCase.expected_output}</code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample Input/Output (Legacy) */}
      {(problem.sampleInput && problem.sampleInput !== "N/A") || (problem.sampleOutput && problem.sampleOutput !== "N/A") ? (
        <div className="space-y-3">
          {problem.sampleInput && problem.sampleInput !== "N/A" && (
            <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
              <div className="px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">📥 Example Input</span>
              </div>
              <div className="p-4 overflow-x-auto bg-slate-950">
                <code className="text-amber-400 font-mono text-xs block whitespace-pre">{problem.sampleInput}</code>
              </div>
            </div>
          )}
          {problem.sampleOutput && problem.sampleOutput !== "N/A" && (
            <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
              <div className="px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">📤 Output</span>
              </div>
              <div className="p-4 overflow-x-auto bg-slate-950">
                <code className="text-emerald-400 font-mono text-xs block whitespace-pre">{problem.sampleOutput}</code>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Hints Section */}
      {problem.hint && (
        <CollapsibleSection
          title="💡 Hint"
          content={<p className="text-xs text-slate-300 leading-relaxed">{problem.hint}</p>}
          defaultOpen={false}
        />
      )}

      {/* Common Mistakes */}
      {problem.commonMistake && (
        <CollapsibleSection
          title="⚠️ Common Mistakes"
          content={<p className="text-xs text-slate-300 leading-relaxed">{problem.commonMistake}</p>}
          defaultOpen={false}
        />
      )}

      {/* Related Lesson */}
      {problem.relatedLesson && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Related Lesson</span>
          </div>
          <p className="text-xs text-indigo-200">{problem.relatedLesson}</p>
        </div>
      )}
    </div>
  );

  const renderCodeView = () => (
    <div className="flex-1 flex flex-col bg-[#0a0b14] relative overflow-hidden">
      {/* 1. Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumb Bar */}
        <div className="h-9 px-4 bg-[#0a0b14] border-b border-white/5 flex items-center gap-2 text-[11px] font-medium text-slate-500 overflow-x-auto no-scrollbar shrink-0">
          <span className="hover:text-slate-300 cursor-default">practice</span>
          <ChevronLeft size={10} className="rotate-180" />
          <span className="hover:text-slate-300 cursor-default">{selectedLanguage}</span>
          <ChevronLeft size={10} className="rotate-180" />
          <span className="text-slate-300 font-bold truncate">
            main.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'javascript' ? 'js' : 'c'}
          </span>
        </div>

        {/* Editor Tabs */}
        <div className="h-9 bg-[#0d0e1a] flex shrink-0">
          <div className="h-full px-4 flex items-center gap-2 bg-[#0a0b14] border-t-2 border-indigo-500 border-r border-white/5 min-w-[120px]">
            <div className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold ${selectedLanguage === 'python' ? 'bg-blue-500' : selectedLanguage === 'c' ? 'bg-indigo-500' : 'bg-amber-500'}`}>
              {selectedLanguage === 'python' ? 'P' : selectedLanguage === 'c' ? 'C' : 'J'}
            </div>
            <span className="text-[11px] font-semibold text-white truncate">
              main.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'javascript' ? 'js' : 'c'}
            </span>
            <X size={10} className="ml-auto text-slate-500 hover:text-white cursor-pointer" />
          </div>
          <div className="flex-1 border-b border-white/5"></div>
        </div>

        <div className="flex-1 overflow-hidden relative min-h-0">
          <Compiler
            language={selectedLanguage.toLowerCase()}
            initialCode={userCode}
            onCodeChange={async (code) => {
              if (currentStatus === 'COMPLETED' && !isEditingCompleted) return;
              setUserCode(code);
              if (!userHasTyped) setUserHasTyped(true);
              if (currentStatus === 'NOT_STARTED') setCurrentStatus('IN_PROGRESS');

              if (user?._id) {
                try {
                  await supabaseDB.savePracticeAttempt(problem.id, code, false, selectedLanguage);
                } catch (err) {
                  // Silent fail
                }
              }
            }}
            onRun={handleRunResult}
            readOnly={isSubmitting || (currentStatus === 'COMPLETED' && !isEditingCompleted)}
            ref={compilerRef}
          />

          {/* Anti-Copy Protection Overlay for completed code */}
          {currentStatus === 'COMPLETED' && !isEditingCompleted && (
            <div className="absolute inset-0 bg-slate-950/20 z-10 pointer-events-none" />
          )}
        </div>

        {/* Symbol Keyboard Accessory */}
        <div className="h-10 md:h-12 bg-[#0d0e1a] border-t border-white/5 flex items-center gap-1 px-2 md:px-3 overflow-x-auto shrink-0 shadow-lg">
          {['{', '}', '(', ')', ';', '"', "'", '<', '>', '/', '*', '=', '+', ':'].map(char => (
            <button
              key={char}
              onClick={() => compilerRef.current?.insertText(char)}
              className="h-7 md:h-8 min-w-[32px] md:min-w-[36px] bg-slate-800/50 border border-white/5 rounded-lg text-slate-300 font-mono text-xs md:text-sm active:bg-indigo-600 active:text-white transition"
            >
              {char}
            </button>
          ))}
          <button
            onClick={() => compilerRef.current?.deleteLastChar()}
            className="h-7 md:h-8 px-2 md:px-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 font-black text-[8px] md:text-[9px] translate-y-[1px]"
          >
            DEL
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-3 md:p-4 bg-slate-900 border-t border-white/5 flex items-center gap-2 md:gap-3">
          <button
            onClick={handleReset}
            className="h-12 w-12 md:h-14 md:w-14 bg-slate-800 text-slate-500 rounded-xl md:rounded-2xl hover:text-white transition active:scale-95 border border-white/5 flex items-center justify-center shrink-0"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={handleRunCode}
            disabled={isSubmitting}
            className="flex-1 h-12 md:h-14 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-2 md:gap-3 shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (
              <>
                <Play size={16} fill="white" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>

        {/* Status Bar (IDE style) */}
        <div className="h-6 bg-indigo-600 flex items-center justify-between px-3 text-[10px] font-bold text-white shrink-0 z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 cursor-default">
              <Globe size={11} />
              <span className="uppercase tracking-widest">Mastery IDE v2.0</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 cursor-default opacity-80">
              <Cpu size={11} />
              <span>Piston Env: {selectedLanguage.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">UTF-8</span>
            <div className="relative flex items-center group">
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setSelectedLanguage(newLang);
                  if (!userHasTyped) {
                    const langKey = newLang.toLowerCase();
                    const starter = (problem as any).starter_codes?.[langKey] || problem.initialCode;
                    if (starter) setUserCode(starter);
                  }
                }}
                className="bg-transparent border-none p-0 pr-4 text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer appearance-none"
              >
                {Object.keys((problem as any).starter_codes || {}).map(langKey => {
                  const displayMap: Record<string, string> = { 'c': 'C', 'cpp': 'C++', 'python': 'Python', 'javascript': 'JavaScript', 'java': 'Java' };
                  return <option key={langKey} value={langKey} className="bg-slate-900">{displayMap[langKey] || langKey.toUpperCase()}</option>
                })}
              </select>
              <ChevronUp size={10} className="absolute right-0 pointer-events-none opacity-60" />
            </div>
            <div className="flex items-center gap-1 px-2 border-l border-white/20">
              <Zap size={10} className="fill-white" />
              <span>AI Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResultView = () => {
    if (!executionResult) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-6 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5 rotate-12">
            <Play size={28} className="text-indigo-600" />
          </div>
          <h2 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tight">Run your code to see results here</h2>
        </div>
      );
    }

    const hasError = executionResult.stderr || (executionResult.compile_output && executionResult.status?.id !== 3);
    const parsedAI = aiExplanation ? parseAIExplanation(aiExplanation) : null;
    const hasInput = executionResult.input || problem.sampleInput;

    return (
      <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 space-y-6 animate-in slide-in-from-bottom duration-300">

        {/* 1. STATUS CARD - Always at top */}
        <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center text-center gap-3 shadow-2xl ${executionResult.accepted
          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
          : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
          }`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-inner ${executionResult.accepted
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-rose-500/10 border-rose-500/20'
            }`}>
            {executionResult.accepted ? <Check size={32} strokeWidth={4} /> : <AlertCircle size={32} strokeWidth={3} />}
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tight">
              {executionResult.accepted ? 'Accepted!' : 'Not Quite Yet'}
            </h3>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs font-bold opacity-70">
                {executionResult.accepted ? 'Your solution is correct. Great job!' : 'There was an issue with your code. Let\'s fix it.'}
              </p>
              {(executionResult as any).testResults && (
                <p className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mx-auto mt-2 ${executionResult.accepted ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                  {(executionResult as any).testResults.filter((r: any) => r.passed).length} / {(executionResult as any).testResults.length} Tests Passed
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 2. AI MENTOR FEEDBACK - Show help button or feedback */}
        {hasError && !aiExplanation && (
          <button
            onClick={() => generateErrorExplanation(executionResult.stderr || executionResult.compile_output || 'Error', userCode, selectedLanguage)}
            disabled={isGeneratingExplanation}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-colors"
          >
            {isGeneratingExplanation ? <><Loader2 size={16} className="animate-spin" /> Getting Help...</> : <><Bot size={16} /> Get AI Help</>}
          </button>
        )}

        {parsedAI && (
          <section className="space-y-3 select-none">
            <div className="flex items-center gap-2 px-3">
              <Bot size={18} className="text-indigo-400" />
              <div className="flex flex-col">
                <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest">AI Mentor</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Analysis Complete</p>
              </div>
            </div>
            {parsedAI.WHAT && <AISection title="The Issue" content={parsedAI.WHAT} icon={<AlertCircle size={14} />} />}
            {parsedAI.LOCATION && <AISection title="Where to Look" content={parsedAI.LOCATION} icon={<Terminal size={14} />} />}
            {parsedAI.CONCEPT && <AISection title="Concept to Review" content={parsedAI.CONCEPT} icon={<BookOpen size={14} />} />}
            {parsedAI.FIX && <AISection title="Next Step" content={parsedAI.FIX} icon={<Zap size={14} />} />}
          </section>
        )}

        {/* 3. YOUR OUTPUT */}
        <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-2 bg-white/5 border-b border-white/5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Your Output</span>
          </div>
          <div className="p-4 bg-slate-950 min-h-12">
            <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap break-words">
              {executionResult.stdout && executionResult.stdout.trim() ? executionResult.stdout.trim() : '(No output produced)'}
            </pre>
          </div>
        </div>

        {/* 4. EXPECTED OUTPUT - Only show when not accepted */}
        {!executionResult.accepted && problem.sampleOutput && problem.sampleOutput !== "N/A" && (
          <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
            <div className="px-4 py-2 bg-white/5 border-b border-white/5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Output</span>
            </div>
            <div className="p-4 bg-slate-950 min-h-12">
              <pre className="text-emerald-400 font-mono text-xs whitespace-pre-wrap break-words">{problem.sampleOutput}</pre>
            </div>
          </div>
        )}

        {/* 5. TEST INPUT - Only show if it exists */}
        {hasInput && (
          <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
            <div className="px-4 py-2 bg-white/5 border-b border-white/5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Test Input</span>
            </div>
            <div className="p-4 bg-slate-950 min-h-12">
              <pre className="text-amber-400 font-mono text-xs whitespace-pre-wrap break-words">
                {executionResult.input || problem.sampleInput}
              </pre>
            </div>
          </div>
        )}

        {/* 6. LEARNING FEEDBACK SECTION - New! */}
        {executionResult.accepted && problem.explanation && (
          <section className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-400 shrink-0" />
              <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest">How It Works</h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">{problem.explanation}</p>
          </section>
        )}

        {/* 7. COMMON MISTAKES SECTION - New! */}
        {problem.commonMistake && (
          <section className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-3 select-text">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-400 shrink-0" />
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-widest">Common Mistake</h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              {problem.commonMistake}
            </p>
          </section>
        )}

        {/* 8. TECHNICAL DETAILS - Collapsed by default */}
        {(executionResult.stderr || executionResult.compile_output) && (
          <CollapsibleSection
            title="System Details"
            defaultOpen={false}
            content={
              <div className="space-y-2">
                <pre className="text-rose-400/70 font-mono text-[10px] bg-rose-500/5 p-3 rounded border border-rose-500/20 overflow-x-auto whitespace-pre-wrap break-words">
                  {executionResult.stderr || executionResult.compile_output}
                </pre>
              </div>
            }
          />
        )}
      </div>
    );
  };

  return (
    <div
      className="flex flex-col bg-slate-950 overflow-hidden font-sans practice-ui-root"
      style={{ height: viewportHeight }}
    >
      {/* 1. CLEAN HEADER */}
      <header className="h-12 md:h-16 shrink-0 bg-slate-950 border-b border-white/5 flex items-center px-4 z-50">
        <button onClick={onBack} className="p-2 -ml-1 text-slate-400 hover:text-white transition">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 px-3 truncate">
          <h1 className="text-[14px] font-black text-white uppercase tracking-tight truncate italic">{problem.title}</h1>
        </div>

        {currentStatus === 'COMPLETED' && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <Check size={12} className="text-emerald-500" strokeWidth={4} />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">MASTERED</span>
          </div>
        )}
      </header>

      {/* 2. THREE TAB NAVIGATION */}
      <div className="h-10 md:h-14 bg-slate-900/50 border-b border-white/5 flex shrink-0">
        {(['PROBLEM', 'CODE', 'RESULT'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center text-[11px] font-black tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />}
          </button>
        ))}
      </div>

      {/* 3. CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'PROBLEM' && renderProblemView()}
        {activeTab === 'CODE' && renderCodeView()}
        {activeTab === 'RESULT' && renderResultView()}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/20 rounded-[3rem] p-10 flex flex-col items-center text-center gap-8 shadow-2xl">
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <Check size={56} strokeWidth={4} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white italic uppercase">Problem Solved!</h2>
              <p className="text-slate-400 font-medium italic">Mission accomplished. Progress saved.</p>
              {problem.relatedLesson && (
                <div className="pt-2 space-y-2 border-t border-slate-700">
                  <p className="text-sm text-emerald-400 font-bold">✨ Mastered {problem.relatedLesson.split('→')[1]?.trim() || problem.concept}!</p>
                  {hasNextProblem && nextProblemTitle && (
                    <p className="text-xs text-indigo-300 font-medium">🔓 Next Challenge: <span className="font-bold">{nextProblemTitle}</span></p>
                  )}
                </div>
              )}
            </div>
            <div className="w-full space-y-4">
              {hasNextProblem ? (
                <button onClick={() => { setShowSuccess(false); onNext?.(); }} className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition">🚀 Next Challenge</button>
              ) : (
                <button onClick={onBack} className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition">Return to List</button>
              )}
              <button onClick={() => { setShowSuccess(false); setActiveTab('CODE'); }} className="w-full h-14 bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition">Review Syntax</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingWorkspace;
