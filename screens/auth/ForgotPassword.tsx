
import React, { useState } from 'react';
import { Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { authService } from '../../services/authService';

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await authService.resetPassword(email);
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-[340px] space-y-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-white mb-4 group transition-colors shrink-0 w-fit"
            disabled={isLoading}
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Login</span>
          </button>

          {/* Logo - Consistent with branding */}
          <div className="flex justify-center -mb-4 animate-in fade-in zoom-in duration-700 ease-out">
            <img
              src="/icons/logo.png"
              alt="GenSpark"
              className="h-32 w-32 object-contain drop-shadow-2xl"
              draggable={false}
            />
          </div>

          <div className="text-center space-y-1 pb-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Recover Account</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Secure your workspace</p>
          </div>

          {isSent ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center space-y-4 animate-in zoom-in-95 duration-500">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Check your inbox</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We've sent recovery instructions to <br />
                  <span className="text-white font-bold">{email}</span>
                </p>
              </div>
              <button
                onClick={onBack}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 animate-in fade-in duration-300">
                  <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-300 leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold text-slate-300 uppercase tracking-widest block ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors z-10" size={18} />
                  <input
                    id="email"
                    type="text"
                    inputMode="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-slate-800 rounded-xl text-white text-sm placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-700/80 focus:border-indigo-600 focus:bg-black focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-black text-base transition-all flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/10"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Send Recovery Link"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
