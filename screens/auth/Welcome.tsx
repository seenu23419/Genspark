import React, { useState, useEffect } from 'react';
import { Github, Loader2, UserPlus, LogIn, Shield, CheckCircle2, HelpCircle, X } from 'lucide-react';
import { authService } from '../../services/authService';
import { User } from '../../types';

interface WelcomeProps {
  onLoginSuccess: (user: User) => void;
  onGoToLogin: () => void;
  onGoToSignup: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onGoToLogin, onGoToSignup }) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Automatically detect errors returned by Supabase/Google via URL hash
    const checkUrlForErrors = () => {
      const hash = window.location.hash;
      const search = window.location.search;

      if ((hash && hash.includes('error')) || (search && search.includes('error'))) {
        const fullString = hash.substring(1) + "&" + search.substring(1);
        const params = new URLSearchParams(fullString);

        const errorDescription = params.get('error_description');
        const errorCode = params.get('error_code');

        if (errorDescription || errorCode) {
          const decodedError = errorDescription ? decodeURIComponent(errorDescription).replace(/\+/g, ' ') : 'Login Failed';
          setError(decodedError);
          setShowHelp(true);

          // Clean URL without refresh
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    checkUrlForErrors();
  }, []);

  /**
   * INITIATE REAL OAUTH FLOW
   * This triggers the provider's official browser-based login UI.
   */
  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      setLoadingProvider(provider);
      setError(null);

      if (provider === 'google') {
        await authService.signInWithGoogle();
      } else {
        await authService.signInWithGithub();
      }

      // If success, the app reloads/redirects.
      // We don't manually clear loading here because the page will change.
    } catch (err: any) {
      console.error("OAuth Initialization Error:", err);
      // Strip typical error prefix if present to make it cleaner
      const message = err.message?.replace("AuthApiError: ", "") || "Unable to establish secure connection with provider.";
      setError(message);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl shadow-indigo-500/20 mx-auto group hover:scale-110 transition-all duration-700 overflow-hidden">
            <img
              src="/C:/Users/DELL/.gemini/antigravity/brain/2ae91892-9cb9-48cb-8528-3a0d18afebcd/genspark_logo_1766814566695.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white tracking-tight">GenSpark</h1>
            <p className="text-slate-400 text-lg font-medium">Ignite your coding intelligence.</p>
          </div>
        </div>

        <div className="space-y-3">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center font-medium animate-in shake duration-300 flex flex-col items-center gap-2">
              <span>{error}</span>
              <button
                onClick={onGoToSignup}
                className="text-xs font-bold bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-400 transition-colors mt-1 shadow-lg shadow-red-500/20"
              >
                Create Account with Email Instead
              </button>
            </div>
          )}

          {/* REAL GOOGLE BUTTON */}
          <button
            onClick={() => handleOAuth('google')}
            disabled={!!loadingProvider}
            className="w-full h-14 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl border border-slate-200 group disabled:opacity-70"
          >
            {loadingProvider === 'google' ? <Loader2 className="animate-spin text-slate-400" size={20} /> : (
              <>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Continue with Google
              </>
            )}
          </button>

          {/* REAL GITHUB BUTTON */}
          <button
            onClick={() => handleOAuth('github')}
            disabled={!!loadingProvider}
            className="w-full h-14 bg-[#24292e] hover:bg-[#1a1e22] text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] border border-slate-700 shadow-xl group disabled:opacity-70"
          >
            {loadingProvider === 'github' ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <Github size={22} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                Continue with GitHub
              </>
            )}
          </button>

          <div className="relative py-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800/60"></div></div>
            <span className="relative px-4 bg-[#0a0b14] text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">OR</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onGoToSignup}
              className="h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              <UserPlus size={18} />
              Create Account
            </button>
            <button
              onClick={onGoToLogin}
              className="h-14 bg-slate-900 border border-slate-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:bg-slate-800 active:scale-95"
            >
              <LogIn size={18} />
              Log In
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col items-center gap-4">
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors text-xs font-bold"
          >
            <HelpCircle size={14} />
            Having trouble logging in?
          </button>

          <p className="text-center text-slate-600 text-[9px] font-bold uppercase tracking-[0.2em] leading-relaxed">
            Authorized Provider Integration.<br />
            © 2025 GenSpark Intelligence Network.
          </p>
        </div>
      </div>

      {/* Troubleshooting Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] max-w-sm w-full relative shadow-2xl">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield size={20} className="text-indigo-500" />
              Login Issues?
            </h3>

            <div className="space-y-4 text-sm text-slate-400">
              <p>
                <strong className="text-white">Error 403: Access Denied</strong>
                <br />
                This happens when using Google Login on a project you don't own. The Google Cloud configuration restricts access to specific test users.
              </p>

              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-indigo-300 font-medium">
                <p>💡 <strong>Solution:</strong></p>
                <p>Please use the <strong>"Create Account"</strong> button to sign up with Email & Password. It works instantly!</p>
              </div>
            </div>

            <button
              onClick={() => { setShowHelp(false); onGoToSignup(); }}
              className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all"
            >
              Go to Email Signup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Welcome;