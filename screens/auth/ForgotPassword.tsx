
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
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="max-w-md w-full relative z-10 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar py-8 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 group transition-colors shrink-0 w-fit">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Login</span>
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-500 mx-auto mb-6">
            <Send size={32} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Recover Account</h2>
          <p className="text-slate-500 font-medium mt-2">We'll send a secure reset link to your email.</p>
        </div>

        {isSent ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 text-center space-y-4 animate-in zoom-in-95">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-white">Check your inbox</h3>
            <p className="text-slate-400 text-sm">We've sent recovery instructions to <span className="text-white font-bold">{email}</span>.</p>
            <button onClick={onBack} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold">Done</button>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input
                type="text"
                inputMode="email"
                required
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-white transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Send Recovery Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
