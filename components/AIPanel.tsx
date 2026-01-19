
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, Loader2, User } from 'lucide-react';
import { genSparkAIService } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIPanelProps {
    context?: string;
    /**
     * If true, AI acts as a mentor and won't provide code solutions
     * If false, AI can provide general assistance
     */
    mentorMode?: boolean;
}

const AIPanel: React.FC<AIPanelProps> = ({ context, mentorMode = false }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

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
            const history = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            // Add mentor mode context if enabled
            const systemPrompt = mentorMode
              ? `You are a coding mentor. Help users learn by explaining concepts, not by providing solutions. 
                 Never give full code. Ask guiding questions. Encourage independent thinking.
                 Output plain text only, no markdown or code blocks.`
              : '';

            const stream = genSparkAIService.generateChatStream(
                (systemPrompt ? systemPrompt + '\n\n' : '') + input + (context ? `\n\nContext: I am currently on the ${context} screen.` : ''),
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
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I hit a snag. Try again?', timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
                {messages.length === 0 && (
                    <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-center space-y-3">
                        <Bot size={32} className="mx-auto text-indigo-400" />
                        <p className="text-sm text-slate-300">
                            {context
                                ? `I'm here to help with your work on the ${context}. Ask me to explain concepts, check code, or give hints!`
                                : "I'm your GenSpark AI tutor. How can I help you learn today?"}
                        </p>
                    </div>
                )}

                {messages.map((m) => (
                    <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
                            {m.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-indigo-400" />}
                        </div>
                        <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap break-words ${m.role === 'user' ? 'bg-indigo-600/10 border border-indigo-500/20 text-slate-200' : 'bg-slate-800/50 border border-slate-700/50 text-slate-300'}`}>
                            {/* Plain text output - no markdown processing, no copy buttons, no syntax highlighting */}
                            {m.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                            <Loader2 size={14} className="animate-spin text-indigo-400" />
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-400 text-xs animate-pulse">
                            GenSpark is thinking...
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Ask anything..."
                        rows={1}
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${input.trim() && !isLoading ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="text-[10px] text-center text-slate-600 mt-2">AI can make mistakes. Verify important info.</p>
            </div>
        </div>
    );
};

export default AIPanel;
