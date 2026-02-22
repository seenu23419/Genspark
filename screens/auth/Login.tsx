/**
 * LOGIN SCREEN - Minimal High-Conversion Design
 * Clean, dark theme, mobile-optimized for fast, frictionless login
 */

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';


const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Validation
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isEmailValid = email.length > 0 && isValidEmail(email);
  const isPasswordValid = password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isFormValid = isEmailValid && isPasswordValid;

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value.toLowerCase().trim());
    if (error) setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('Join with a valid email and 8+ character complex password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Reduced timeout to 15s - if it takes longer, something is wrong with the network.
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login is taking longer than usual. Please check your connection.')), 15000)
      );

      await Promise.race([authService.signIn(email, password), timeoutPromise]);
    } catch (err: any) {
      const errorMsg = err.message || 'Invalid email or password';
      setError(errorMsg);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setIsGoogleLoading(false);
      const errorMsg = err.message?.replace('AuthApiError: ', '') || 'Google login failed';
      setError(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-y-auto transition-colors duration-300">
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-[340px] space-y-5">

          {/* Logo - Centered with minimal spacing */}
          <div className="flex justify-center -mb-6">
            <img
              src="/icons/logo.png"
              alt="GenSpark"
              className="h-28 w-28 object-contain"
              draggable={false}
            />
          </div>

          {/* Headline + Subtext */}
          <div className="text-center space-y-1 pb-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome to GenSpark
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              Start your journey today
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-300 uppercase tracking-widest block ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Email address"
                  autoComplete="email"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-slate-800 rounded-xl text-white text-sm placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-700/80 focus:border-indigo-600 focus:bg-black focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-widest block ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full pl-11 pr-11 py-3 bg-white/5 border border-slate-800 rounded-xl text-white text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-600/40 focus:border-indigo-500 focus:bg-black focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isGoogleLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Forgot password - Right-aligned, muted */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  disabled={isLoading || isGoogleLoading}
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Primary CTA - Log In (Premium Solid Design) */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading || isGoogleLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-base font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                'Log in'
              )}
            </button>
          </form>

          {/* Divider Section - "or continue with" */}
          <div className="relative flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-slate-600"></div>
            <span className="text-xs text-slate-400 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-slate-600"></div>
          </div>

          {/* Secondary Authentication - Google (Less Prominent) */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-3.5 bg-white/5 border border-slate-800 hover:border-slate-700 hover:bg-white/10 rounded-lg text-slate-200 text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009766, -39.238281)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.754 52.809 -21.904 52.039 -21.904 51.239 C -21.904 50.439 -21.754 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -13.004 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Bottom signup link */}
          <p className="text-center text-sm text-slate-400 pt-2">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              disabled={isLoading || isGoogleLoading}
              className="text-slate-300 hover:text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign up
            </button>
          </p>

          {/* About Section - Minimal for Google Verification */}
          <div className="pt-8 border-t border-slate-800/50 mt-4">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 text-center">About GenSpark</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed text-center px-2">
              GenSpark is an AI-powered coding intelligence platform designed to ignite your programming journey with interactive lessons,
              real-time IDE execution, and smart personalized challenges.
            </p>
          </div>

          {/* Legal Footer - Required by Google */}
          <div className="flex items-center justify-center gap-6 pt-6">
            <button
              onClick={() => navigate('/privacy')}
              className="text-[10px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-widest transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => navigate('/terms')}
              className="text-[10px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-widest transition-colors"
            >
              Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
