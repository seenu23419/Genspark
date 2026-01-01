
import React, { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: User) => void;
  onSignup: () => void;
  onForgotPassword: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignup, onForgotPassword, onBack }) => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<'google' | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleOAuth = async (provider: 'google') => {
    if (!acceptedTerms) {
      setError("Please check the 'I accept Terms' box below to continue.");
      return;
    }
    try {
      setLoadingProvider(provider);
      setError(null);
      console.log("Initiating OAuth for:", provider);
      if (provider === 'google') await signInWithGoogle();
    } catch (err: any) {
      console.error("OAuth Error:", err);
      setError(err.message?.replace("AuthApiError: ", "") || "Social login failed.");
      setLoadingProvider(null);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^a-zA-Z0-9@.+_%\-]/g, '').toLowerCase();
    setEmail(clean);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Please check the 'I accept Terms' box below to log in.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please check your connection.")), 10000)
      );

      const loginPromise = authService.signIn(email, password);

      const user = await Promise.race([loginPromise, timeoutPromise]);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar py-8 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group mb-8 shrink-0 w-fit"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="mb-8 md:mb-10 text-center">
          <div className="w-20 h-20 md:w-32 md:h-32 bg-black/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl shadow-indigo-500/20 mx-auto mb-6 transition-all duration-700 overflow-hidden">
            <img
              src="/logo.png"
              alt="GenSpark Logo"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 font-medium mt-1 md:mt-2 text-sm md:text-base">Log in to continue your journey.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-in shake duration-500">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* EMAIL & PASSWORD FORM (FIRST) */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              type="text"
              inputMode="email"
              required
              value={email}
              onChange={handleEmailChange}
              placeholder="Email address"
              className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-white transition-all font-medium text-sm md:text-base"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Password"
              className="w-full pl-12 pr-32 py-3 md:py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-white transition-all font-medium text-sm md:text-base"
            />
            <button
              type="button"
              onClick={onForgotPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors bg-slate-900 px-2 py-1 rounded-lg"
            >
              Forgot?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 md:h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-base md:text-lg transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Log In
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* GOOGLE BUTTON (SECOND) */}
        <div className="relative pt-8">
          <div className="absolute inset-x-0 top-8 flex items-center"><div className="w-full border-t-2 border-dotted border-slate-800/60"></div></div>
          <span className="relative px-4 mx-auto block w-fit bg-[#0a0b14] text-slate-500 font-black text-xs tracking-[0.3em] mb-6">OR</span>

          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={!!loadingProvider}
            className="w-full h-12 md:h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] border border-white/10 group mt-4 disabled:opacity-50"
          >
            {loadingProvider === 'google' ? <Loader2 className="animate-spin text-slate-400" size={20} /> : (
              <>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Continue with Google
              </>
            )}
          </button>
        </div>

        {/* SIGN UP OPTION (THIRD) */}
        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm font-medium">
            New to GenSpark?{' '}
            <button
              onClick={onSignup}
              className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors hover:underline decoration-2 underline-offset-4"
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* TERMS & CONDITIONS (FOURTH) */}
        <div className="mt-10 pt-6 border-t-2 border-dotted border-slate-800/60">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-1">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (error) setError(null);
                }}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-slate-700 rounded-md bg-slate-900 transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600 group-hover:border-slate-500"></div>
              <div className="absolute inset-0 flex items-center justify-center text-white scale-0 transition-transform peer-checked:scale-100">
                <Shield size={12} fill="currentColor" />
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium leading-relaxed select-none">
              By logging in, I accept the <button type="button" onClick={(e) => { e.stopPropagation(); setShowTerms(true); }} className="text-indigo-400 font-bold hover:underline">Terms of Service</button> and <button type="button" onClick={(e) => { e.stopPropagation(); setShowPrivacy(true); }} className="text-indigo-400 font-bold hover:underline">Privacy Policy</button>.
            </span>
          </label>
        </div>
      </div>

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#0f111a] border border-white/10 w-full max-w-2xl max-h-[80vh] rounded-[2.5rem] relative flex flex-col shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <Shield className="text-indigo-500" size={24} />
                  Terms of Service
                </h3>
                <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest">Last updated: January 2025</p>
              </div>
              <button onClick={() => setShowTerms(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                <Shield size={24} className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              <section className="space-y-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">1. Acceptance of Terms</h4>
                <p className="text-slate-400 leading-relaxed text-sm">
                  By accessing or using GenSpark, you agree to be bound by these Terms of Service.
                </p>
              </section>
              <section className="space-y-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">2. Description of Service</h4>
                <p className="text-slate-400 leading-relaxed text-sm">
                  GenSpark offers interactive coding lessons and AI-assisted tutoring.
                </p>
              </section>
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5">
              <button
                onClick={() => setShowTerms(false)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-lg"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#0f111a] border border-white/10 w-full max-w-2xl max-h-[80vh] rounded-[2.5rem] relative flex flex-col shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <Shield className="text-emerald-500" size={24} />
                  Privacy Policy
                </h3>
                <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest">Your Data, Your Control</p>
              </div>
              <button onClick={() => setShowPrivacy(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                <Shield size={24} className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              <section className="space-y-3">
                <h4 className="text-lg font-bold text-white">Data We Collect</h4>
                <p className="text-slate-400 leading-relaxed text-sm">
                  We value your privacy. Your code and conversations are used only to personalize your learning experience.
                </p>
              </section>
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5">
              <button
                onClick={() => setShowPrivacy(false)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black transition-all shadow-lg"
              >
                Close Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
