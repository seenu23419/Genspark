import React, { useEffect, useState } from 'react';
import { Database, XCircle, Cloud, Zap, Key, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { supabaseDB } from '../../services/supabaseService';

const Splash: React.FC = () => {
  const [status, setStatus] = useState<{ server: boolean; db: boolean } | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    checkConnection();

    // If splash sticks around for 12 seconds, offer reset
    const timer = setTimeout(() => setShowReset(true), 12000);
    return () => clearTimeout(timer);
  }, []);

  const checkConnection = async () => {
    // Wait slightly for animation
    await new Promise(r => setTimeout(r, 1000));

    try {
      const result = await supabaseDB.getHealth();
      setStatus(result);

      // Only show config if DB check explicitly failed
      if (!result.db) {
        setTimeout(() => setShowConfig(true), 500);
      }
    } catch (e) {
      // Fallback if critical failure
      setStatus({ server: true, db: false });
      setTimeout(() => setShowConfig(true), 500);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    setIsRetrying(true);

    // Update service with new key
    supabaseDB.updateKey(apiKey.trim());

    // Retry connection
    const result = await supabaseDB.getHealth();
    setStatus(result);
    setIsRetrying(false);

    if (result.db) {
      setShowConfig(false);
      // Force reload to ensure all services pick up the new key cleanly
      window.location.reload();
    }
  };

  const handleReset = () => {
    // Clear Supabase session and local keys
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#0a0b14] p-6 text-center overflow-hidden z-[9999] touch-none selection:none">
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      {/* Logo Container */}
      <div className={`relative mb-8 flex flex-col items-center transition-all duration-1000 ${showConfig ? 'scale-75 -mt-20' : 'scale-100'} animate-in fade-in duration-1000`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="relative w-48 h-48 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 flex items-center justify-center shadow-[0_0_100px_rgba(79,252,252,0.2)] ring-1 ring-white/10 overflow-hidden">
            <img
              src="/logo.png"
              alt="GenSpark Logo"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            {/* Inner Glint */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Brand Tagline */}
      <div className="relative mt-4 animate-in slide-in-from-bottom-8 duration-1000 delay-300 z-10">
        <div className="flex items-center justify-center gap-3 opacity-80">
          <div className="h-[0.5px] w-6 bg-indigo-500/40"></div>
          <p className="text-indigo-200/90 font-black text-[9px] tracking-[0.4em] uppercase">Ignite Your Coding Intelligence</p>
          <div className="h-[0.5px] w-6 bg-indigo-500/40"></div>
        </div>
      </div>

      {/* Manual Configuration Input (Shows only if DB check fails) */}
      {showConfig && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-500 z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-red-500/30 p-6 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <XCircle size={20} />
              <p className="font-bold text-sm">Connection Failed</p>
            </div>
            <p className="text-xs text-slate-400 mb-4 text-left">
              The application cannot connect to the database. This usually happens if the API Key is missing.
            </p>

            <div className="space-y-3">
              <div className="relative">
                <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter Supabase Anon Key"
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSaveKey}
                disabled={isRetrying || !apiKey}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? <Loader2 size={16} className="animate-spin" /> : (
                  <>
                    Connect
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Bar */}
      {!showConfig && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-48 space-y-2">
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 w-full origin-left ${status ? 'transition-all duration-300' : 'animate-loading-bar-slow'}`} style={{ width: status ? '100%' : undefined }}></div>
          </div>
        </div>
      )}



      <style>{`
        @keyframes loading-bar-slow { 
          0% { transform: scaleX(0); } 
          100% { transform: scaleX(1); } 
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.3; transform: translate(-50%, -50%) scale(1.1); }
        }
        .animate-loading-bar-slow { 
          animation: loading-bar-slow 3s cubic-bezier(0.22, 1, 0.36, 1) forwards; 
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Splash;