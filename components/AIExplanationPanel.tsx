import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, AlertCircle, Info, BookOpen } from 'lucide-react';
import { genSparkAIService } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIExplanationPanelProps {
  problemId: string;
  problemStatement?: string;
  currentCode?: string;
  language: string;
  errorMessage?: string;
  isVisible: boolean;
}

/**
 * AI Explanation Panel Component
 * 
 * This panel acts as a MENTOR, not a SOLVER.
 * 
 * Rules:
 * - DO NOT show full corrected code
 * - DO NOT give copy-paste answers
 * - DO NOT auto-fix anything
 * - DO explain conceptually
 * - DO ask guiding questions
 * - DO encourage independent problem-solving
 * 
 * Output style:
 * - Plain text only
 * - No code blocks with syntax highlighting
 * - No copy buttons
 * - Educational, clear tone
 */
const AIExplanationPanel: React.FC<AIExplanationPanelProps> = ({
  problemId,
  problemStatement,
  currentCode,
  language,
  errorMessage,
  isVisible
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isVisible) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context for the AI mentor
      const mentorContext = `
You are a code mentor helping a student learn programming. Your role is to:
1. Explain errors conceptually, never provide full corrected code
2. Ask guiding questions to help them think
3. Point out the line with the issue and explain WHY it's wrong
4. Explain what programming concept is violated
5. Guide them HOW to think about the fix, not the fix itself

Language: ${language}
${problemStatement ? `Problem: ${problemStatement}` : ''}
${errorMessage ? `Current Error: ${errorMessage}` : ''}
${currentCode ? `Student Code:\n${currentCode}` : ''}

Remember: Your job is teaching, not solving. Help them learn.
Output plain text only, no code blocks.
`;

      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const stream = genSparkAIService.generateChatStream(
        input + '\n\n' + mentorContext,
        false,
        history
      );

      const assistantMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date() }]);

      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          const msgIndex = updated.findIndex(m => m.id === assistantMsgId);
          if (msgIndex !== -1) {
            updated[msgIndex].content = fullText;
          }
          return updated;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm having trouble responding right now. Please try again in a moment.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border-t border-slate-800">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center gap-3">
        <BookOpen size={18} className="text-indigo-400 flex-shrink-0" />
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white">Learning Guide</h3>
          <p className="text-xs text-slate-400">Ask for help understanding the error</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 && (
          <div className="space-y-3 text-center py-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto">
              <Info size={20} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-slate-300 font-medium">Need help?</p>
              <p className="text-xs text-slate-400 mt-1">
                Ask me to explain the error, clarify a concept, or guide you through the solution.
              </p>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mt-4">
              <p className="text-xs text-indigo-200 text-left">
                💡 Tip: Tell me what you're confused about, and I'll help you think through it.
              </p>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                m.role === 'user'
                  ? 'bg-indigo-600'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              {m.role === 'user' ? (
                <User size={14} className="text-white" />
              ) : (
                <span className="text-xs font-bold text-indigo-400">AI</span>
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-lg p-3 sm:p-4 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600/20 border border-indigo-500/30 text-slate-200'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-300'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{m.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
              <Loader2 size={14} className="animate-spin text-indigo-400" />
            </div>
            <div className="max-w-[80%] p-3 sm:p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 text-sm animate-pulse">
              Thinking...
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 p-3 sm:p-4 bg-slate-950/50">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me to explain the error..."
            rows={2}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center flex-shrink-0 h-full"
            title={!input.trim() ? 'Type a message first' : isLoading ? 'Waiting for response' : 'Send message'}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIExplanationPanel;
