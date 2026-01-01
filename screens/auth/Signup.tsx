
import React, { useState } from 'react';
import { Mail, Lock, User, Loader2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import { User as UserType } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SignupProps {
  onSignup: (user: UserType) => void;
  onLogin: () => void;
  onBack?: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onLogin, onBack }) => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loadingProvider, setLoadingProvider] = useState<'google' | null>(null);

  const handleChange = (field: string, value: string) => {
    let finalValue = value;
    // Removed strict regex to allow user to type/paste freely. Validation happens on submit.
    setFormData(prev => ({ ...prev, [field]: finalValue }));
    if (error) setError(null);
  };

  const handleOAuth = async (provider: 'google') => {
    try {
      setLoadingProvider(provider);
      setError(null);
      if (provider === 'google') await signInWithGoogle();
    } catch (err: any) {
      setError(err.message?.replace("AuthApiError: ", "") || "Social login failed.");
      setLoadingProvider(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Race: 10s timeout vs API Call
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please check your internet connection.")), 10000)
      );

      const signupPromise = authService.signUp(formData.email, formData.password, formData.name);

      const user = await Promise.race([signupPromise, timeoutPromise]);
      // Navigate to home on success
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar py-8 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <button
          onClick={onBack || onLogin}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group mb-8 shrink-0 w-fit"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl shadow-indigo-500/20 mx-auto mb-6 group hover:scale-110 transition-all duration-700 overflow-hidden">
            <img
              src="/logo.png"
              alt="GenSpark Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Create Account</h2>
          <p className="text-slate-500 font-medium mt-2">Join the future of intelligent coding.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* SIGNUP FORM */}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Full Name"
              className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-white transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Email address"
              className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-white transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Create password (min 6 chars)"
              className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-white transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Confirm password"
              className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-white transition-all placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Create account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-slate-500 text-sm font-medium">
          Already have an account?{' '}
          <button onClick={onLogin} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Log in</button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
