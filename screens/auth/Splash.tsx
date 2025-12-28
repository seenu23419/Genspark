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
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#0a0b14] p-6 pb-32 text-center overflow-hidden z-50 touch-none selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      {/* Logo Container */}
      <div className={`relative mb-12 flex flex-col items-center transition-all duration-1000 ${showConfig ? 'scale-75 -mt-20' : 'scale-110'} animate-in fade-in zoom-in duration-1000`}>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="relative w-56 h-56 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 flex items-center justify-center shadow-[0_0_100px_rgba(79,252,252,0.2)] ring-1 ring-white/10 overflow-hidden">
            <img
              src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/genspark_logo.png"
              alt="GenSpark Logo"
              className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-1000"
              onError={(e) => {
                // Fallback to local path if remote fails (standard practice for my generated assets in this env)
                e.currentTarget.src = "/C:/Users/DELL/.gemini/antigravity/brain/2ae91892-9cb9-48cb-8528-3a0d18afebcd/genspark_logo_1766814566695.png";
              }}
            />
            {/* Inner Glint */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Brand Text */}
      <div className="relative space-y-4 animate-in slide-in-from-bottom-12 duration-1000 delay-300 z-10">
        <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-2 text-white drop-shadow-lg">
          GenSpark
        </h1>
        <div className="flex items-center justify-center gap-3 opacity-90">
          <div className="h-px w-8 bg-indigo-500/50"></div>
          <p className="text-indigo-300 font-bold text-sm tracking-[0.3em] uppercase">Ignite Your Coding Intelligence</p>
          <div className="h-px w-8 bg-indigo-500/50"></div>
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

      {/* Loading Bar (Hides when config shows) */}
      {!showConfig && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-64 space-y-4">
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <div className={`h-full bg-gradient-to-r from-[#4ffcfc] via-[#6366f1] to-[#a855f7] w-full origin-left ${status ? 'transition-all duration-300' : 'animate-loading-bar-slow'}`} style={{ width: status ? '100%' : undefined }}></div>
          </div>
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">Initializing Core</p>
            <Zap size={10} className="text-indigo-500 animate-pulse" />
          </div>
        </div>
      )}

      {/* Status Indicator or Reset Button */}
      {!showConfig && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          {showReset ? (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full font-bold text-xs hover:bg-red-500/20 transition-all"
            >
              <RefreshCw size={14} />
              App Stuck? Reset Data
            </button>
          ) : (
            status && (
              <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-md shadow-lg transition-all duration-500 ${status.db
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                {status.db ? (
                  <>
                    <Cloud size={14} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Supabase Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle size={14} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Connection Failed</span>
                  </>
                )}
              </div>
            )
          )}
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