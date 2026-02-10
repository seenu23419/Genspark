import React, { useState, useRef } from 'react';
import { Loader2, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

interface OTPProps {
  email: string;
  onVerify: () => void;
}

const OTP: React.FC<OTPProps> = ({ email, onVerify }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;
    setError(null);

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== '' && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-verify if last digit is entered
    if (index === 5 && element.value !== '') {
      handleVerification([...newOtp]);
    }
  };

  const handleBackspace = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerification = async (currentOtp: string[]) => {
    const token = currentOtp.join('');
    if (token.length < 6) return;

    setIsVerifying(true);
    setError(null);
    try {
      await authService.verifyOtp(email, token, 'signup');
      // Transition handled by onAuthStateChange in App.tsx
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;

    setIsResending(true);
    setError(null);
    try {
      await authService.resendOtp(email, 'signup');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6 relative">
      <div className="max-w-md w-full text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-500 mb-6">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">Verify email</h2>
          <p className="text-slate-500 font-medium">
            Enter the code sent to <span className="text-white font-bold">{email}</span>.<br />
            Code expires in <span className="text-indigo-400 font-bold">{formatTime(resendTimer + 540)}</span>
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-in shake duration-300">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="flex justify-center gap-3">
          {otp.map((data, index) => (
            <input
              key={index}
              ref={(el) => { inputs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              disabled={isVerifying}
              className={`w-12 h-16 md:w-14 md:h-20 bg-slate-900 border-2 rounded-2xl text-3xl font-black text-white text-center transition-all focus:outline-none ${isVerifying ? 'opacity-50 border-slate-800' : 'border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                }`}
            />
          ))}
        </div>

        <div className="space-y-6">
          <button
            onClick={() => handleVerification(otp)}
            disabled={isVerifying || otp.join('').length < 6}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
          >
            {isVerifying ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Verifying...
              </>
            ) : "Confirm code"}
          </button>

          <div className="flex flex-col gap-4">
            <p className="text-slate-600 text-sm font-bold uppercase tracking-widest">
              Didn't get it?
              <button
                onClick={handleResend}
                disabled={resendTimer > 0 || isResending}
                className={`ml-2 transition-colors ${resendTimer > 0 ? 'text-slate-800 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300'}`}
              >
                {isResending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
              </button>
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
            >
              <ArrowLeft size={14} /> Change email address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTP;
