
import React, { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, Shield, ArrowLeft, Github } from 'lucide-react';
import { authService } from '../../services/authService';
import { User } from '../../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onSignup: () => void;
  onForgotPassword: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignup, onForgotPassword, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      setLoadingProvider(provider);
      setError(null);
      if (provider === 'google') await authService.signInWithGoogle();
      else await authService.signInWithGithub();
    } catch (err: any) {
      setError(err.message?.replace("AuthApiError: ", "") || "Social login failed.");
      setLoadingProvider(null);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strictly allow only valid email characters
    const clean = e.target.value.replace(/[^a-zA-Z0-9@.+_%\-]/g, '').toLowerCase();
    setEmail(clean);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await authService.signIn(email, password);
      onLogin(user);
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

      <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group mb-8"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center font-black text-white text-3xl shadow-2xl mx-auto mb-6">G</div>
          <h2 className="text-3xl font-black text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 font-medium mt-2">Log in to continue your journey.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-in shake duration-500">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="space-y-3 mb-10">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={!!loadingProvider}
            className="w-full h-14 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg border border-slate-200 group disabled:opacity-70"
          >
            {loadingProvider === 'google' ? <Loader2 className="animate-spin text-slate-400" size={20} /> : (
              <>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Continue with Google
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('github')}
            disabled={!!loadingProvider}
            className="w-full h-14 bg-[#24292e] hover:bg-[#1a1e22] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] border border-slate-700 shadow-lg group disabled:opacity-70"
          >
            {loadingProvider === 'github' ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <Github size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                Continue with GitHub
              </>
            )}
          </button>

          <div className="relative py-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800/60"></div></div>
            <span className="relative px-4 bg-[#0a0b14] text-slate-600 font-black uppercase tracking-[0.3em] text-[8px]">OR CONTINUE WITH EMAIL</span>
          </div>
        </div>

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
              className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-white transition-all font-medium"
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
              className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-white transition-all font-medium"
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Log In
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm font-medium">
          New to GenSpark?{' '}
          <button onClick={onSignup} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Sign up</button>
        </p>

        <div className="mt-10 flex items-center justify-center gap-2 text-slate-800">
          <Shield size={12} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Identity Layer</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
