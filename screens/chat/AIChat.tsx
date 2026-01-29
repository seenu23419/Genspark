
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
      <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-200">

         {/* Sidebar - App Themed Style */}
         <aside className={`
            ${isMobile ? 'absolute inset-y-0 left-0 z-50 w-[260px]' : 'relative w-[260px]'} 
            bg-slate-900 flex flex-col transition-all duration-300 ease-in-out shrink-0 border-r border-slate-800
            ${!isSidebarOpen && !isMobile ? '-ml-[260px]' : ''}
            ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
         `}>
            {/* New Chat Button & Close Helper */}
            <div className="p-3 flex items-center gap-2">
               <button
                  onClick={handleNewChat}
                  className="flex-1 flex items-center justify-between px-3 py-3 rounded-lg hover:bg-slate-800 text-white text-sm transition-colors group border border-slate-800/50 hover:border-slate-700"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Plus size={16} className="text-white" />
                     </div>
                     <span className="font-medium">New Chat</span>
                  </div>
                  <SquarePen size={18} className="text-slate-400 group-hover:text-white transition-colors" />
               </button>

               {/* Mobile Close Button (or Desktop Collapse) */}
               <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-3 rounded-lg border border-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Close Sidebar"
               >
                  <PanelLeft size={20} />
               </button>
            </div>

            {/* Recent Chats List */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
               <h3 className="text-[11px] font-bold text-slate-500 px-3 py-2 uppercase tracking-wider">Recent</h3>

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
                           : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
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
            <div className="p-3 mt-auto border-t border-slate-800">
               {user?.isPro && (
                  <div className="mb-2 p-3 bg-gradient-to-br from-indigo-950/30 to-slate-900 rounded-xl border border-indigo-500/20">
                     <div className="flex items-center gap-2 text-xs font-bold text-yellow-500 mb-1">
                        <Crown size={12} fill="currentColor" />
                        GENSPARK PRO
                     </div>
                     <p className="text-[10px] text-slate-400">Unlimited high-reasoning tokens active.</p>
                  </div>
               )}
               <button
                  onClick={() => { }}  // Add user profile handler
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left group">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-slate-800 group-hover:ring-slate-700 transition-all">
                     {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="text-sm font-medium text-white truncate">{user?.name || 'User'}</div>
                     <div className="text-[10px] text-slate-400 truncate">Free Plan</div>
                  </div>
                  <Settings size={16} className="text-slate-500 group-hover:text-white transition-colors" />
               </button>
            </div>
         </aside>

         {/* Main Content */}
         <div className="flex-1 flex flex-col h-full min-w-0 relative">

            {/* Header */}
            <header className="flex items-center justify-between px-3 md:px-4 h-14 sticky top-0 z-30 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/50 shrink-0">
               <div className="flex items-center gap-1 md:gap-2">
                  {/* Toggle Sidebar - Visible on Desktop/Mobile */}
                  <button
                     onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                     className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                     title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                  >
                     <PanelLeft className={`w-4.5 h-4.5 md:w-5 md:h-5 ${isSidebarOpen ? "text-indigo-400" : ""}`} />
                  </button>

                  <button onClick={onBack} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900">
                     <ArrowLeft className="w-4.5 h-4.5 md:w-5 md:h-5" />
                  </button>
                  <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg text-base md:text-lg font-bold text-white hover:bg-slate-900 cursor-pointer transition-colors group">
                     4.0 <ChevronDown size={14} className="text-slate-500 group-hover:text-white" />
                  </div>
               </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
               <div className="max-w-3xl mx-auto px-4 py-8">
                  {messages.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center pt-10 md:pt-20 text-center animate-in fade-in duration-500">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/10 ring-1 ring-white/10">
                           <Bot className="w-7 h-7 md:w-8 md:h-8 text-indigo-400" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">How can I help you?</h2>
                        <p className="text-slate-400 mb-8 max-w-sm md:max-w-md px-4 text-sm md:text-base">I can check your code, explain complex topics, or help you brainstorm new ideas.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-2">
                           {[
                              "Code a custom React hook",
                              "Explain quantum entanglement",
                              "Refactor this Python script",
                              "Design a scalable system"
                           ].map((suggestion, idx) => (
                              <button
                                 key={suggestion}
                                 onClick={() => handleSend(suggestion)}
                                 className="p-3.5 md:p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 hover:border-slate-700 text-left text-xs md:text-sm transition-all hover:translate-y-[-2px] active:scale-[0.98]"
                                 style={{ animationDelay: `${idx * 100}ms` }}
                              >
                                 <span className="font-medium text-slate-300">{suggestion}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {messages.map((m, i) => (
                     <div
                        key={m.id}
                        className={`py-4 md:py-6 flex gap-3 md:gap-6 group ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                     >
                        <div className="shrink-0 pt-1">
                           <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center overflow-hidden ${m.role === 'user' ? 'bg-indigo-600' : 'bg-transparent border border-slate-700'} shadow-sm shadow-indigo-500/10`}>
                              {m.role === 'user' ? (
                                 <span className="text-white text-xs font-bold">U</span>
                              ) : (
                                 <Bot className="w-4 h-4 md:w-[18px] md:h-[18px] text-indigo-400" />
                              )}
                           </div>
                        </div>
                        <div className={`flex-1 space-y-1.5 md:space-y-2 overflow-hidden ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                           <div className="font-bold text-xs md:text-sm text-slate-100 flex items-center gap-2 justify-inherit px-1">
                              {m.role === 'user' ? 'You' : 'GenSpark AI'}
                           </div>
                           <div className={`markdown-content prose prose-invert max-w-none text-sm md:text-[15px] leading-relaxed inline-block ${m.role === 'user' ? 'bg-indigo-600/10 border border-indigo-500/20 p-3.5 md:p-4 rounded-2xl rounded-tr-none' : ''}`}>
                              {m.content ? (
                                 <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                       code({ node, inline, className, children, ...props }: any) {
                                          const match = /language-(\w+)/.exec(className || '');
                                          if (!inline && match) {
                                             return (
                                                <div className="relative my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-left">
                                                   <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-white/6 text-[11px] font-mono text-slate-300 uppercase">{match[1]}</div>
                                                   <div className="absolute top-3 left-3 z-10">
                                                      <button onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))} className="flex items-center gap-1 px-2 py-0.5 bg-slate-800/60 rounded-md text-slate-200 text-xs">
                                                         <Copy size={12} />
                                                      </button>
                                                   </div>
                                                   <SyntaxHighlighter
                                                      style={vscDarkPlus}
                                                      language={match[1]}
                                                      PreTag="div"
                                                      {...props}
                                                      customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '13px' }}
                                                   >
                                                      {String(children).replace(/\n$/, '')}
                                                   </SyntaxHighlighter>
                                                </div>
                                             );
                                          }

                                          return <code className="bg-slate-800 rounded px-1.5 py-0.5 text-indigo-300 font-mono text-sm" {...props}>{children}</code>;
                                       },
                                       h1: ({ node, ...props }) => <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 mb-3" {...props} />,
                                       h2: ({ node, ...props }) => <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-4 mb-2" {...props} />,
                                       h3: ({ node, ...props }) => <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-3 mb-2" {...props} />,
                                    }}
                                 >
                                    {m.content}
                                 </ReactMarkdown>
                              ) : (
                                 isLoading && i === messages.length - 1 && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                       <Loader2 className="animate-spin" size={16} />
                                       <span className="animate-pulse">Thinking...</span>
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
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pb-6 px-4">
               <div className="max-w-3xl mx-auto relative">

                  {/* Preview Area */}
                  {previewUrl && (
                     <div className="mb-3 flex items-center gap-3 p-2 bg-slate-900 rounded-xl border border-slate-800 w-fit animate-in slide-in-from-bottom-2">
                        <img src={previewUrl} className="w-12 h-12 rounded bg-black object-cover" alt="Preview" />
                        <button onClick={() => { setAttachment(null); setPreviewUrl(null); }} className="p-1 hover:bg-slate-800 rounded-full text-slate-400">
                           <X size={14} />
                        </button>
                     </div>
                  )}

                  {/* Input Box */}
                  <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
                     <textarea
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Message GenSpark..."
                        className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-500 resize-none max-h-[200px] px-2 py-1 text-[15px]"
                     />
                     <div className="flex items-center justify-between mt-2 px-1">
                        <div className="flex items-center gap-1">
                           <button onClick={() => handleFileUpload('image')} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                              <ImageIcon size={18} />
                           </button>
                           <button
                              onClick={() => { }}  // Add voice input handler when ready
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                              <Mic size={18} />
                           </button>
                        </div>
                        <button
                           onClick={() => handleSend()}
                           disabled={(!input.trim() && !attachment) || isLoading}
                           className={`p-1.5 rounded-lg transition-all ${(input.trim() || attachment) && !isLoading ? 'bg-indigo-600 text-white' : 'text-slate-700'
                              }`}
                        >
                           <Send size={18} />
                        </button>
                     </div>
                  </div>
                  <p className="text-center mt-3 text-[11px] text-slate-500">
                     GenSpark AI can make mistakes. Check important info.
                  </p>
               </div>
            </div>
         </div>

         <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      </div>
   );
};

export default AIChat;
