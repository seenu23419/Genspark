/**
 * SIGNUP SCREEN - Brand-Forward Design
 * Logo-first, premium, clean typography hierarchy
 * Consistent with Login screen branding
 */

import React, { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, ChevronLeft, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Validation
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isNameValid = name.trim().length >= 2;
  const isEmailValid = email.length > 0 && isValidEmail(email);
  const isPasswordValid = password.length >= 6;
  const isPasswordMatch = password === confirmPassword && password.length > 0;
  const isFormValid = isNameValid && isEmailValid && isPasswordValid && isPasswordMatch;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value.toLowerCase().trim());
    if (error) setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (error) setError(null);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('Please fill in all fields correctly');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout. Please try again.')), 12000)
      );

      const signupPromise = authService.signUp(email, password, name);
      await Promise.race([signupPromise, timeoutPromise]);

      navigate('/', { replace: true });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create account';
      setError(errorMsg);
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      const errorMsg = err.message?.replace('AuthApiError: ', '') || 'Google signup failed';
      setError(errorMsg);
      console.error('Google signup error:', err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-y-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-20 p-2 hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
        aria-label="Go back"
      >
        <ChevronLeft size={20} className="text-slate-400" />
      </button>

      {/* Main content - Logo first, brand-forward */}
      <div className="min-h-full flex flex-col items-center justify-center px-5 py-8">

        {/* Logo - Centered with gap */}
        <div className="mt-2 mb-2 animate-in fade-in zoom-in duration-700 ease-out">
          <img
            src="/icons/logo.png"
            alt="GenSpark"
            className="w-36 h-36 md:w-40 md:h-40 object-contain drop-shadow-2xl"
            draggable={false}
          />
        </div>

        {/* Typography Hierarchy - Balanced */}
        <div className="text-center mb-8 w-full space-y-1">
          <h1 className="text-xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Start your coding journey</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
            <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-300 font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="w-full max-w-[340px] space-y-5 px-4 pb-8">
          {/* Name field */}
          <div>
            <label htmlFor="name" className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-1.5 ml-1">
              Full Name
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3 text-slate-500 pointer-events-none" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="John Doe"
                disabled={isLoading || isGoogleLoading}
                className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-white text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-600/40 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              />
            </div>
          </div>

          {/* Email field */}
          <div>
            <label htmlFor="email" className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-1.5 ml-1">
              Email
            </label>
            <div className="relative group">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors z-10" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                disabled={isLoading || isGoogleLoading}
                className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-white text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-600/40 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-1.5 ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors z-10" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                disabled={isLoading || isGoogleLoading}
                className="w-full pl-11 pr-11 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-700/80 focus:border-indigo-600 focus:bg-slate-950 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || isGoogleLoading}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm password field */}
          <div>
            <label htmlFor="confirm" className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-1.5 ml-1">
              Confirm Password
            </label>
            <div className="relative group">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors z-10" />
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleConfirmChange}
                placeholder="••••••••"
                disabled={isLoading || isGoogleLoading}
                className="w-full pl-11 pr-11 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-700/80 focus:border-indigo-600 focus:bg-slate-950 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                disabled={isLoading || isGoogleLoading}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password && confirmPassword && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${isPasswordMatch ? 'text-green-400' : 'text-red-400'}`}>
                {isPasswordMatch ? (
                  <>
                    <CheckCircle2 size={14} />
                    Passwords match
                  </>
                ) : (
                  '✗ Passwords do not match'
                )}
              </p>
            )}
          </div>

          {/* Sign up button - Solid professional style */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading || isGoogleLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-base font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full max-w-xs flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-600" />
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Or</span>
          <div className="flex-1 h-px bg-slate-600" />
        </div>

        {/* Google signup button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isLoading || isGoogleLoading}
          className="w-full max-w-xs py-3 bg-slate-800/60 border border-slate-700 hover:border-slate-600 hover:bg-slate-800 rounded-full text-slate-200 text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <span>Sign up with Google</span>
            </>
          )}
        </button>

        {/* Login link */}
        <p className="text-center text-slate-300 text-sm mt-8 mb-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            disabled={isLoading || isGoogleLoading}
            className="text-slate-200 font-bold hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
