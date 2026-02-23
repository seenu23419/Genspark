
import React, { useState, useRef, useEffect } from 'react';
import {
   Send, Bot, Trash2, Sparkles, Loader2,
   Plus, X, Crown, Mic, ArrowLeft,
   Image as ImageIcon, FileText, Camera, Copy,
   PanelLeft, SquarePen, MoreHorizontal, Settings, ChevronDown, Check, User as UserIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { genSparkAIService, MediaPart } from '../../services/geminiService';
import { supabaseDB } from '../../services/supabaseService';
import { ChatMessage, User, ChatSession } from '../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';

interface AIChatProps {
   user?: User | null;
   onBack: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ user: propUser, onBack }) => {
   const { user: authUser } = useAuth();
   const user = propUser || authUser;
   const queryClient = useQueryClient();
   const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
   const [messages, setMessages] = useState<ChatMessage[]>([]);
   const [input, setInput] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [attachment, setAttachment] = useState<MediaPart | null>(null);
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const [isMobile, setIsMobile] = useState(false);

   const scrollRef = useRef<HTMLDivElement>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   // --- Queries ---

   // Fetch Sessions
   const { data: sessions = [] } = useQuery({
      queryKey: ['chatSessions', user?._id],
      queryFn: () => user?._id ? supabaseDB.getChatSessions(user._id) : Promise.resolve([]),
      enabled: !!user?._id
   });

   // Fetch Messages for current session
   const { data: serverMessages } = useQuery({
      queryKey: ['chatMessages', currentSessionId],
      queryFn: () => currentSessionId ? supabaseDB.getChatMessages(currentSessionId) : Promise.resolve([]),
      enabled: !!currentSessionId
   });

   useEffect(() => {
      // SYNC: Only update from server if NOT currently streaming/loading
      // This prevents the assistant placeholder or stream from being overwritten
      if (serverMessages && !isLoading) {
         const uiMessages: ChatMessage[] = serverMessages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at),
            status: 'read'
         }));
         setMessages(uiMessages);
      } else if (!currentSessionId && !isLoading) {
         setMessages([]);
      }
   }, [serverMessages, currentSessionId, isLoading]);


   // --- Mutations ---

   const createSessionMutation = useMutation({
      mutationFn: (title: string) => supabaseDB.createChatSession(user!._id, title),
      onSuccess: (newSession) => {
         if (newSession) {
            queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
            setCurrentSessionId(newSession.id);
         }
      }
   });

   const addMessageMutation = useMutation({
      mutationFn: (vars: { sessionId: string, role: 'user' | 'assistant', content: string }) =>
         supabaseDB.addChatMessage(vars.sessionId, vars.role, vars.content)
   });

   const deleteSessionMutation = useMutation({
      mutationFn: (sessionId: string) => supabaseDB.deleteChatSession(sessionId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      }
   });


   // --- Effects ---

   // Responsive check
   useEffect(() => {
      const checkMobile = () => {
         const mobile = window.innerWidth < 768;
         setIsMobile(mobile);
         if (mobile) setIsSidebarOpen(false);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
   }, []);

   // Auto-scroll to bottom
   useEffect(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages, isLoading, previewUrl]);

   const handleNewChat = () => {
      setCurrentSessionId(null);
      setMessages([]);
      if (isMobile) setIsSidebarOpen(false);
   };

   const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this chat?')) {
         await deleteSessionMutation.mutateAsync(sessionId);
         if (currentSessionId === sessionId) {
            setCurrentSessionId(null);
            setMessages([]);
         }
      }
   };

   const loadSession = (sessionId: string) => {
      setCurrentSessionId(sessionId);
      if (isMobile) setIsSidebarOpen(false);
   };

   const handleSend = async (overrideText?: string) => {
      const textToSend = overrideText || input;
      if ((!textToSend.trim() && !attachment) || isLoading) return;
      if (!user?._id) {
         alert("Please login to save chats.");
         return;
      }

      let sessionId = currentSessionId;

      setIsLoading(true);
      setInput(''); // Clear input early

      try {
         // 1. Create session if needed
         if (!sessionId) {
            const newSession = await createSessionMutation.mutateAsync(textToSend);
            if (!newSession) throw new Error("Failed to create session");
            sessionId = newSession.id;
            // Optimistically set ID so subsequent re-renders know we are in a session
            // (Note: waiting for setState might be slow, so we use local variable `sessionId` below)
         }

         const userMessageId = Date.now().toString(); // temp ID
         const userMsg: ChatMessage = {
            id: userMessageId,
            role: 'user',
            content: textToSend,
            timestamp: new Date(),
            status: 'sent'
         };

         // 2. Optimistic Update (User)
         setMessages(prev => [...prev, userMsg]);

         // 3. Save User Message
         await addMessageMutation.mutateAsync({
            sessionId: sessionId!,
            role: 'user',
            content: textToSend
         });


         // 4. Setup Assistant Placeholder
         const assistantMessageId = (Date.now() + 1).toString();
         const assistantMsg: ChatMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date()
         };
         setMessages(prev => [...prev, assistantMsg]);

         // 5. Generate AI Response
         const history = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
         }));

         const currentAttachment = attachment;
         setAttachment(null);
         setPreviewUrl(null);

         const stream = genSparkAIService.generateChatStream(
            textToSend,
            user?.isPro || false,
            history,
            currentAttachment || undefined
         );

         let fullText = '';

         for await (const chunk of stream) {
            fullText += chunk;
            setMessages(prev => {
               const updated = [...prev];
               if (updated.length > 0) {
                  updated[updated.length - 1].content = fullText;
               }
               return updated;
            });
         }

         // 6. Save Assistant Message
         await addMessageMutation.mutateAsync({
            sessionId: sessionId!,
            role: 'assistant',
            content: fullText
         });

         // Refresh messages query so the next idle sync is accurate
         queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] });
         // Refresh sessions list to update "Recent" order or snippet
         queryClient.invalidateQueries({ queryKey: ['chatSessions'] });

      } catch (error: any) {
         console.error("AIChat Error:", error);
         const errorContent = error.message || "Sorry, I encountered an error. Please check your internet connection or try again.";
         setMessages(prev => {
            const updated = [...prev];
            if (updated.length > 0 && updated[updated.length - 1].role === 'assistant' && updated[updated.length - 1].content === '') {
               updated[updated.length - 1].content = errorContent;
            } else {
               updated.push({
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: errorContent,
                  timestamp: new Date()
               });
            }
            return updated;
         });
      } finally {
         setIsLoading(false);
      }
   };

   const handleFileUpload = (type: 'image' | 'file') => {
      if (fileInputRef.current) {
         fileInputRef.current.accept = type === 'image' ? "image/*" : "text/*,application/pdf";
         fileInputRef.current.click();
      }
   };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
         const result = reader.result as string;
         setAttachment({
            mimeType: file.type,
            data: result.split(',')[1]
         });
         setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
   };

   return (
      <div className="flex h-screen bg-black overflow-hidden font-sans text-white transition-colors duration-300">

         {/* Sidebar - App Themed Style */}
         <aside className={`
            ${isMobile ? 'absolute inset-y-0 left-0 z-50 w-[280px]' : 'relative w-[280px]'} 
            bg-slate-950/80 backdrop-blur-3xl flex flex-col transition-all duration-300 ease-in-out shrink-0 border-r border-white/5
            ${!isSidebarOpen && !isMobile ? '-ml-[280px]' : ''}
            ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
         `}>
            {/* New Chat Button & Close Helper */}
            <div className="p-4 flex items-center gap-3">
               <button
                  onClick={handleNewChat}
                  className="flex-1 flex items-center justify-between px-4 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-all group shadow-xl shadow-indigo-600/20 active:scale-95"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                        <Plus size={18} className="text-white" />
                     </div>
                     <span className="font-black uppercase italic tracking-wider">New Chat</span>
                  </div>
                  <SquarePen size={20} className="text-white/70 group-hover:text-white transition-colors" />
               </button>

               {/* Mobile Close Button (or Desktop Collapse) */}
               {isMobile && (
                  <button
                     onClick={() => setIsSidebarOpen(false)}
                     className="p-4 rounded-2xl border border-white/10 bg-slate-900 text-slate-400 hover:text-white transition-colors"
                  >
                     <PanelLeft size={22} />
                  </button>
               )}
            </div>

            {/* Recent Chats List */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
               <h3 className="text-[11px] font-bold text-slate-700 dark:text-slate-500 px-3 py-2 uppercase tracking-wider">Recent</h3>

               {sessions.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                     <p className="text-xs text-slate-500">No chat history yet.</p>
                  </div>
               ) : (
                  sessions.map((session: any) => (
                     <div
                        key={session.id}
                        className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${currentSessionId === session.id
                           ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                           : 'text-slate-600 dark:text-slate-300 hover:bg-slate-800/50 hover:text-white dark:hover:text-white'
                           }`}
                        onClick={() => loadSession(session.id)}
                     >
                        <span className="truncate flex-1 pr-2">{session.title}</span>

                        {/* Delete Button (visible on group hover or active) */}
                        <button
                           onClick={(e) => handleDeleteSession(e, session.id)}
                           className={`p-1 rounded hover:bg-red-500/20 hover:text-red-400 text-slate-500 transition-all opacity-0 group-hover:opacity-100 ${currentSessionId === session.id ? 'opacity-100' : ''
                              }`}
                           title="Delete chat"
                        >
                           <Trash2 size={13} />
                        </button>
                     </div>
                  ))
               )}
            </div>

            {/* User Profile / Pro Badge */}
            <div className="p-3 mt-auto border-t border-slate-200 dark:border-slate-800">
               {user?.isPro && (
                  <div className="mb-2 p-3 bg-gradient-to-br from-indigo-50 dark:from-indigo-950/30 to-white dark:to-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
                     <div className="flex items-center gap-2 text-xs font-black text-amber-600 dark:text-yellow-500 mb-1 uppercase tracking-wider">
                        <Crown size={12} fill="currentColor" />
                        GENSPARK PRO
                     </div>
                     <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Unlimited high-reasoning tokens active.</p>
                  </div>
               )}
               <button
                  onClick={() => { }}  // Add user profile handler
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-slate-200 dark:group-hover:ring-slate-700 transition-all">
                     {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</div>
                     <div className="text-[10px] font-black text-slate-600 dark:text-slate-500 truncate uppercase tracking-widest">{user?.isPro ? 'Pro Member' : 'Free Plan'}</div>
                  </div>
                  <Settings size={16} className="text-slate-500 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
               </button>
            </div>
         </aside>

         {/* Main Content */}
         <div className="flex-1 flex flex-col h-full min-w-0 relative">

            {/* Header */}
            <header className="flex items-center justify-between px-4 h-16 md:h-20 sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 shrink-0">
               <div className="flex items-center gap-2 md:gap-4">
                  {/* Toggle Sidebar - Visible on Desktop/Mobile */}
                  <button
                     onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                     className="p-2.5 text-slate-400 hover:text-white rounded-2xl hover:bg-white/5 transition-all"
                     title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                  >
                     <PanelLeft className={`w-5 h-5 md:w-6 md:h-6 ${isSidebarOpen ? "text-indigo-400" : ""}`} />
                  </button>

                  <button onClick={onBack} className="p-2.5 text-slate-400 hover:text-white rounded-2xl hover:bg-white/5 transition-all">
                     <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl text-lg md:text-xl font-black text-white hover:bg-white/5 cursor-pointer transition-colors group uppercase italic">
                     GPT 4.0 <ChevronDown size={16} className="text-slate-500 group-hover:text-white transition-all" />
                  </div>
               </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-black">
               <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                  {messages.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl border border-white/10 ring-1 ring-white/5">
                           <Bot className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase italic tracking-tighter">How can I help you?</h2>
                        <p className="text-slate-400 mb-12 max-w-sm md:max-w-lg px-4 text-sm md:text-lg font-bold uppercase tracking-widest opacity-60">I can check your code, explain complex topics, or help you brainstorm new ideas.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-2">
                           {[
                              "Code a custom React hook",
                              "Explain quantum entanglement",
                              "Refactor this Python script",
                              "Design a scalable system"
                           ].map((suggestion, idx) => (
                              <button
                                 key={suggestion}
                                 onClick={() => handleSend(suggestion)}
                                 className="p-5 md:p-6 rounded-[1.5rem] border border-white/5 bg-slate-900/40 hover:bg-slate-900/80 hover:border-indigo-500/50 text-left transition-all hover:-translate-y-1 active:scale-[0.98] shadow-2xl"
                                 style={{ animationDelay: `${idx * 100}ms` }}
                              >
                                 <span className="font-black text-slate-300 text-[10px] md:text-xs uppercase tracking-[0.2em]">{suggestion}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {messages.map((m, i) => (
                     <div
                        key={m.id}
                        className={`py-6 md:py-10 flex gap-4 md:gap-8 group ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                     >
                        <div className="shrink-0 pt-1">
                           <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-2xl border ${m.role === 'user' ? 'bg-indigo-600 border-indigo-400/20' : 'bg-slate-900 border-white/10'}`}>
                              {m.role === 'user' ? (
                                 <UserIcon size={18} className="text-white" />
                              ) : (
                                 <Bot size={18} className="text-indigo-400" />
                              )}
                           </div>
                        </div>
                        <div className={`flex-1 space-y-3 md:space-y-4 overflow-hidden ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                           <div className="font-black text-[10px] md:text-xs text-slate-500 flex items-center gap-2 justify-inherit px-1 uppercase tracking-[0.2em] italic">
                              {m.role === 'user' ? 'Protocol: User' : 'Genesis Engine'}
                           </div>
                           <div className={`markdown-content prose prose-invert max-w-none text-sm md:text-base leading-relaxed inline-block ${m.role === 'user' ? 'bg-indigo-600/10 border border-indigo-500/20 p-5 md:p-6 rounded-[2rem] rounded-tr-none text-indigo-50 shadow-2xl' : 'p-2'}`}>
                              {m.content ? (
                                 <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                       code({ node, inline, className, children, ...props }: any) {
                                          const match = /language-(\w+)/.exec(className || '');
                                          if (!inline && match) {
                                             return (
                                                <div className="relative my-6 rounded-3xl overflow-hidden border border-white/5 bg-slate-950 text-left shadow-2xl">
                                                   <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-white/5 text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest">{match[1]}</div>
                                                   <div className="absolute top-4 left-4 z-10">
                                                      <button onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))} className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-white/5 rounded-xl text-slate-300 text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 hover:text-white hover:border-indigo-500/30">
                                                         <Copy size={12} />
                                                         Copy
                                                      </button>
                                                   </div>
                                                   <SyntaxHighlighter
                                                      style={vscDarkPlus}
                                                      language={match[1]}
                                                      PreTag="div"
                                                      {...props}
                                                      customStyle={{ margin: 0, padding: '3.5rem 1.5rem 1.5rem 1.5rem', background: 'transparent', fontSize: '13px' }}
                                                   >
                                                      {String(children).replace(/\n$/, '')}
                                                   </SyntaxHighlighter>
                                                </div>
                                             );
                                          }

                                          return <code className="bg-slate-900 border border-white/5 rounded-lg px-2 py-0.5 text-indigo-300 font-mono text-xs md:text-sm" {...props}>{children}</code>;
                                       },
                                       h1: ({ node, ...props }) => <h1 className="text-3xl md:text-5xl font-black text-white mt-8 mb-4 tracking-tighter uppercase italic" {...props} />,
                                       h2: ({ node, ...props }) => <h2 className="text-2xl md:text-4xl font-black text-white mt-8 mb-3 tracking-tighter uppercase italic" {...props} />,
                                       h3: ({ node, ...props }) => <h3 className="text-xl md:text-3xl font-black text-white mt-6 mb-2 tracking-tighter uppercase italic" {...props} />,
                                    }}
                                 >
                                    {m.content}
                                 </ReactMarkdown>
                              ) : (
                                 isLoading && i === messages.length - 1 && (
                                    <div className="flex items-center gap-3 text-indigo-400 py-2">
                                       <Loader2 className="animate-spin" size={20} />
                                       <span className="animate-pulse font-black uppercase text-[10px] tracking-[0.3em] italic">Synthesizing...</span>
                                    </div>
                                 )
                              )}
                           </div>
                        </div>
                     </div>
                  ))}
                  <div ref={scrollRef} className="h-32" />
               </div>
            </div>

            {/* Input Wrapper */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent pb-8 px-2 md:px-4">
               <div className="max-w-3xl mx-auto relative">

                  {/* Preview Area */}
                  {previewUrl && (
                     <div className="mb-4 flex items-center gap-4 p-3 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 w-fit animate-in slide-in-from-bottom-2 shadow-2xl">
                        <img src={previewUrl} className="w-16 h-16 rounded-xl bg-black object-cover border border-white/5" alt="Preview" />
                        <button onClick={() => { setAttachment(null); setPreviewUrl(null); }} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all">
                           <X size={16} />
                        </button>
                     </div>
                  )}

                  {/* Input Box */}
                  <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 shadow-2xl focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                     <textarea
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Type a message..."
                        className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-600 resize-none max-h-[300px] px-3 py-2 text-base md:text-lg font-medium"
                     />
                     <div className="flex items-center justify-between mt-3 px-2">
                        <div className="flex items-center gap-2">
                           <button onClick={() => handleFileUpload('image')} className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                              <ImageIcon size={22} />
                           </button>
                           <button
                              onClick={() => { }}  // Add voice input handler when ready
                              className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                              <Mic size={22} />
                           </button>
                        </div>
                        <button
                           onClick={() => handleSend()}
                           disabled={(!input.trim() && !attachment) || isLoading}
                           className={`p-3 rounded-2xl transition-all ${(input.trim() || attachment) && !isLoading ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 scale-100' : 'text-slate-700 bg-slate-800/50'
                              }`}
                        >
                           <Send size={20} className={isLoading ? 'animate-pulse' : ''} />
                        </button>
                     </div>
                  </div>
                  <p className="text-center mt-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                     Quantum Neural Network Active • GenSpark Alpha
                  </p>
               </div>
            </div>
         </div>

         <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      </div>
   );
};

export default AIChat;
