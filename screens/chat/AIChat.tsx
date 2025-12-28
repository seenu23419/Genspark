
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, Trash2, Sparkles, Loader2, 
  Plus, X, Crown, Mic, ArrowLeft,
  Image as ImageIcon, FileText, Camera, Copy,
  PanelLeft, SquarePen, MoreHorizontal, Settings, ChevronDown
} from 'lucide-react';
import { genSparkAIService, MediaPart } from '../../services/geminiService';
import { ChatMessage, User } from '../../types';

interface AIChatProps {
  user?: User | null;
  onBack: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ user, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<MediaPart | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  // Default to false so the user sees "only logo page" initially
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if ((!textToSend.trim() && !attachment) || isLoading) return;

    setShowMenu(false);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
      status: 'read'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);

    const history = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    try {
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (type: 'image' | 'file') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? "image/*" : "text/*,application/pdf";
      fileInputRef.current.click();
      setShowMenu(false);
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

  const HistoryItem = ({ title }: { title: string }) => (
    <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white truncate transition-colors relative group">
      {title}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-gradient-to-l from-slate-800 to-transparent pl-4">
         <MoreHorizontal size={16} className="text-slate-400 hover:text-white" />
      </div>
    </button>
  );

  return (
    <div className="flex h-full bg-[#0a0b14] overflow-hidden font-sans relative text-slate-200">
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
         <div 
           className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
           onClick={() => setIsSidebarOpen(false)}
         />
       )}

      {/* Sidebar History Panel */}
      <aside className={`
          ${isMobile ? 'absolute inset-y-0 left-0 z-50 w-[260px]' : 'relative w-[260px]'} 
          bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out shrink-0
          ${!isSidebarOpen && !isMobile ? '-ml-[260px]' : ''}
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
       `}>
          <div className="p-3">
             <button 
                onClick={() => {
                    setMessages([]);
                    if(isMobile) setIsSidebarOpen(false);
                }} 
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-200 text-sm transition-colors group"
             >
                <div className="flex items-center gap-2">
                    <Plus size={16} />
                    <span>New chat</span>
                </div>
                <SquarePen size={16} className="text-slate-500 group-hover:text-white" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-slate-800">
             <div className="mb-6">
                <h3 className="text-[11px] font-bold text-slate-600 px-3 mb-2 uppercase tracking-wide">Today</h3>
                <HistoryItem title="Explain C Pointers" />
                <HistoryItem title="Python Automation Script" />
             </div>
             <div className="mb-6">
                <h3 className="text-[11px] font-bold text-slate-600 px-3 mb-2 uppercase tracking-wide">Yesterday</h3>
                <HistoryItem title="Debug Memory Leak" />
                <HistoryItem title="React useEffect Hook" />
                <HistoryItem title="SQL Join Types" />
             </div>
             <div>
                <h3 className="text-[11px] font-bold text-slate-600 px-3 mb-2 uppercase tracking-wide">Previous 7 Days</h3>
                <HistoryItem title="Binary Tree Traversal" />
                <HistoryItem title="CSS Flexbox Guide" />
                <HistoryItem title="Java Interface vs Abstract" />
                <HistoryItem title="Docker Basics" />
                <HistoryItem title="Next.js Routing" />
             </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-2 border-t border-slate-800 mt-auto">
             <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-800 transition-colors text-left group">
                <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{user?.name || 'User'}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user?.isPro ? 'Pro Plan' : 'Free Plan'}</div>
                </div>
                <Settings size={16} className="text-slate-500 group-hover:text-white" />
             </button>
          </div>
      </aside>

      {/* Main Chat Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#0a0b14] relative">
        
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 sticky top-0 z-30 bg-[#0a0b14]/95 backdrop-blur-sm border-b border-slate-800">
           <div className="flex items-center gap-2">
               {!isSidebarOpen && (
                   <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800" title="Open Sidebar">
                      <PanelLeft size={20} />
                   </button>
               )}
               {isSidebarOpen && isMobile && (
                   <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                      <X size={20} />
                   </button>
               )}
               
               {/* Back Button */}
               <button 
                  onClick={onBack} 
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
               >
                  <ArrowLeft size={20} />
               </button>

               <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-slate-200 hover:bg-slate-800 cursor-pointer transition-colors group">
                  <span className="text-base font-medium opacity-90 group-hover:opacity-100">GenSpark 3.0</span>
                  <ChevronDown size={14} className="text-slate-500 group-hover:text-white" />
               </div>
           </div>
           
           <div className="flex items-center gap-2">
               <button onClick={() => setMessages([])} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Clear Chat">
                  <Trash2 size={18} />
               </button>
           </div>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide w-full">
           <div className="flex flex-col items-center text-sm">
              
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-20">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                     <Sparkles size={32} className="text-indigo-500" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-8">How can I help you today?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                     <button onClick={() => setInput('Explain quantum computing in simple terms')} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 hover:border-indigo-500/30 text-left transition-all">
                        <h4 className="font-bold text-slate-200 mb-1">Explain quantum computing</h4>
                        <p className="text-slate-500 text-xs">in simple terms</p>
                     </button>
                     <button onClick={() => setInput('Write a Python script to optimize images')} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 hover:border-indigo-500/30 text-left transition-all">
                        <h4 className="font-bold text-slate-200 mb-1">Write a Python script</h4>
                        <p className="text-slate-500 text-xs">to optimize images</p>
                     </button>
                     <button onClick={() => setInput('How do I make an HTTP request in Javascript?')} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 hover:border-indigo-500/30 text-left transition-all">
                        <h4 className="font-bold text-slate-200 mb-1">HTTP request in JS</h4>
                        <p className="text-slate-500 text-xs">using fetch or axios</p>
                     </button>
                     <button onClick={() => setInput('What is the difference between SQL and NoSQL?')} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 hover:border-indigo-500/30 text-left transition-all">
                        <h4 className="font-bold text-slate-200 mb-1">SQL vs NoSQL</h4>
                        <p className="text-slate-500 text-xs">key differences & use cases</p>
                     </button>
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                 <div key={m.id} className={`w-full border-b border-slate-800/50 text-slate-200 ${
                    m.role === 'assistant' ? 'bg-slate-900/30' : 'bg-[#0a0b14]'
                 }`}>
                    <div className="max-w-3xl mx-auto flex gap-4 p-4 md:py-6 relative group">
                        <div className="flex-shrink-0 flex flex-col relative items-end">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                                m.role === 'user' ? 'bg-slate-800 text-slate-300' : 'bg-indigo-600 text-white shadow-indigo-500/20'
                            }`}>
                                {m.role === 'user' ? <UserIcon size={18} /> : <Sparkles size={18} fill="currentColor" />}
                            </div>
                        </div>
                        <div className="relative flex-1 overflow-hidden">
                            {/* Author Name */}
                            <div className="font-bold text-sm mb-1 opacity-90 text-slate-300">
                                {m.role === 'user' ? 'You' : 'GenSpark AI'}
                            </div>
                            
                            {/* Content */}
                            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 max-w-none text-[15px] prose-headings:text-indigo-300">
                                {m.content || (
                                   isLoading && i === messages.length - 1 ? (
                                      <span className="flex items-center gap-2 text-slate-400">
                                        <Loader2 className="animate-spin" size={14} /> Thinking...
                                      </span>
                                   ) : null
                                )}
                            </div>
                        </div>
                        
                        {/* Copy Button */}
                        {m.role === 'assistant' && (
                           <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                 onClick={() => navigator.clipboard.writeText(m.content)}
                                 className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                              >
                                 <Copy size={14} />
                              </button>
                           </div>
                        )}
                    </div>
                 </div>
              ))}
              <div ref={scrollRef} className="h-32" />
           </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#0a0b14] via-[#0a0b14] to-transparent pt-10 pb-6 px-4">
           <div className="max-w-3xl mx-auto">
              
              {/* File Preview */}
              {previewUrl && (
                <div className="mb-3 flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 w-fit backdrop-blur-sm animate-in slide-in-from-bottom-2 shadow-xl">
                   <div className="w-10 h-10 rounded bg-black/50 overflow-hidden">
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                   </div>
                   <div className="text-xs">
                      <p className="font-bold text-white">Image Attached</p>
                      <p className="text-slate-400">Ready to send</p>
                   </div>
                   <button onClick={() => { setAttachment(null); setPreviewUrl(null); }} className="p-1 hover:bg-slate-800 rounded-full ml-2 text-slate-400 hover:text-white transition-colors">
                      <X size={14} />
                   </button>
                </div>
              )}

              {/* Upload Menu */}
              {showMenu && (
                 <div ref={menuRef} className="absolute bottom-24 left-4 md:left-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 min-w-[200px] animate-in slide-in-from-bottom-2 z-50">
                    <button onClick={() => handleFileUpload('image')} className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-slate-800 text-left text-sm text-slate-200 transition-colors">
                       <ImageIcon size={16} className="text-emerald-500" /> Upload Image
                    </button>
                    <button onClick={() => handleFileUpload('file')} className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-slate-800 text-left text-sm text-slate-200 transition-colors">
                       <FileText size={16} className="text-blue-500" /> Upload File
                    </button>
                    <button onClick={() => handleFileUpload('image')} className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-slate-800 text-left text-sm text-slate-200 transition-colors">
                       <Camera size={16} className="text-purple-500" /> Take Photo
                    </button>
                 </div>
              )}

              <div className="relative flex items-end gap-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-3 focus-within:ring-1 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all">
                 <button 
                    onClick={() => setShowMenu(!showMenu)} 
                    className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-800"
                 >
                    <Plus size={20} className={showMenu ? 'rotate-45 transition-transform' : 'transition-transform'} />
                 </button>
                 
                 <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Send a message..."
                    className="flex-1 max-h-[200px] min-h-[24px] py-2 bg-transparent border-0 outline-none text-white placeholder:text-slate-500 resize-none overflow-y-auto scrollbar-hide text-[15px] font-medium"
                 />

                 <button 
                    onClick={() => handleSend()} 
                    disabled={(!input.trim() && !attachment) || isLoading}
                    className={`p-2 rounded-lg transition-all ${
                       (input.trim() || attachment) && !isLoading 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'bg-transparent text-slate-500 cursor-not-allowed'
                    }`}
                 >
                    <Send size={18} />
                 </button>
              </div>
              <div className="text-center pt-3">
                 <p className="text-[11px] text-slate-600 font-medium">
                    GenSpark AI can make mistakes. Consider checking important information.
                 </p>
              </div>
           </div>
        </div>
      </div>
      
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
};

const UserIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

export default AIChat;
