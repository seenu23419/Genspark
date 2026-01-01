import React, { useState, useEffect } from 'react';
import { Loader2, UserPlus, LogIn, Shield, CheckCircle2, HelpCircle, X, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface WelcomeProps {
  onLoginSuccess: (user: User) => void;
  onGoToLogin: () => void;
  onGoToSignup: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onLoginSuccess, onGoToLogin, onGoToSignup }) => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<'google' | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  console.log("Welcome Component State:", { acceptedTerms, isLoading, loadingProvider });

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
  const handleOAuth = async (provider: 'google') => {
    if (!acceptedTerms) {
      setError("Please check the 'I accept Terms' box below to continue.");
      return;
    }
    try {
      setLoadingProvider(provider);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error("OAuth Initialization Error:", err);
      const message = err.message?.replace("AuthApiError: ", "") || "Unable to establish secure connection with provider.";
      setError(message);
      setLoadingProvider(null);
    }
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
      await authService.signIn(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[60%] bg-indigo-600/10 rounded-full blur-[80px] md:blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-purple-600/10 rounded-full blur-[80px] md:blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar py-8 px-2 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="text-center space-y-3 md:space-y-4 mb-8 md:mb-10 shrink-0">
          <div className="w-20 h-20 md:w-32 md:h-32 bg-black/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl shadow-indigo-500/20 mx-auto transition-all duration-700 overflow-hidden">
            <img
              src="/logo.png"
              alt="GenSpark Logo"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>
          <div className="pt-1 md:pt-2">
            <p className="text-slate-400 text-base md:text-lg font-medium tracking-tight">Ignite your coding intelligence.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-in shake duration-500">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* EMAIL FORM (FIRST) */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value.toLowerCase());
                  if (error) setError(null);
                }}
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-white transition-all font-medium text-sm md:text-base"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input
                type="password"
                required
                autoComplete="current-password"
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
                onClick={() => navigate('/forgot-password')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors bg-slate-900 px-2 py-1 rounded-lg"
              >
                Forgot?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 md:h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-base md:text-lg transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group mt-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Log In
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-dotted border-slate-800/60"></div></div>
            <span className="relative px-4 bg-[#0a0b14] text-slate-500 font-black text-[10px] tracking-[0.3em]">OR</span>
          </div>

          {/* GOOGLE BUTTON (SECOND) */}
          <button
            onClick={() => handleOAuth('google')}
            disabled={!!loadingProvider}
            className="w-full h-12 md:h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] group disabled:opacity-50"
          >
            {loadingProvider === 'google' ? <Loader2 className="animate-spin text-slate-400" size={20} /> : (
              <>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Continue with Google
              </>
            )}
          </button>

          {/* SIGN UP OPTION (THIRD) */}
          <div className="pt-2 text-center">
            <p className="text-slate-500 text-sm font-medium">
              New to GenSpark?{' '}
              <button onClick={() => navigate('/signup')} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Create Account</button>
            </p>
          </div>

          {/* TERMS (FOURTH) */}
          <div className="mt-8 pt-6 border-t-2 border-dotted border-slate-800/60">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (error) setError(null);
                  }}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-slate-700 rounded bg-slate-900 transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600 group-hover:border-slate-500"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white scale-0 transition-transform peer-checked:scale-100">
                  <Shield size={12} fill="currentColor" />
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium leading-relaxed select-none">
                I accept the <button type="button" onClick={(e) => { e.stopPropagation(); setShowTerms(true); }} className="text-indigo-400 underline decoration-indigo-400/30 hover:decoration-indigo-400 transition-all">Terms</button> and <button type="button" onClick={(e) => { e.stopPropagation(); setShowPrivacy(true); }} className="text-indigo-400 underline decoration-indigo-400/30 hover:decoration-indigo-400 transition-all">Privacy Policy</button>
              </span>
            </label>
          </div>
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
              onClick={() => { setShowHelp(false); navigate('/signup'); }}
              className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all"
            >
              Go to Email Signup
            </button>
          </div>
        </div>
      )}

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
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <section className="space-y-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">1. Acceptance of Terms</h4>
                <p className="text-slate-400 leading-relaxed text-sm">
                  By accessing or using GenSpark, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use the service. We provide an AI-powered coding education platform designed to accelerate your learning journey.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">2. Description of Service</h4>
                <p className="text-slate-400 leading-relaxed text-sm">
                  GenSpark offers interactive coding lessons, AI-assisted tutoring, and practice environments. The service uses advanced artificial intelligence to provide personalized feedback and explanations.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">3. User Conduct</h4>
                <p className="text-slate-400 leading-relaxed text-sm">
                  You agree not to misuse our services. Misuse includes attempting to circumvent security measures, using the platform for illegal activities, or attempting to reverse engineer the AI models or platform infrastructure.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">4. Intellectual Property</h4>
                <p className="text-slate-400 leading-relaxed text-sm">
                  All content, branding, and technology on the platform are the exclusive property of GenSpark. Your usage grants you a limited, non-exclusive license for educational purposes only.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">5. Limitation of Liability</h4>
                <p className="text-slate-400 leading-relaxed text-sm italic">
                  The service is provided "as is" without warranties of any kind. GenSpark is not responsible for any inaccuracies in AI-generated responses or technical interruptions.
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
                  <CheckCircle2 className="text-emerald-500" size={24} />
                  Privacy Policy
                </h3>
                <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest">Your Data, Your Control</p>
              </div>
              <button onClick={() => setShowPrivacy(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl mb-4">
                <p className="text-emerald-400 font-bold text-sm">We value your privacy. Your code and conversations are used only to personalize your learning experience.</p>
              </div>

              <section className="space-y-3">
                <h4 className="text-lg font-bold text-white">Data We Collect</h4>
                <p className="text-slate-400 leading-relaxed text-sm">
                  We collect basic account information (Email, Name), your learning progress (completed lessons, XP), and your interactions with the AI tutor to improve our teaching models.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-lg font-bold text-white">How We Use Your Information</h4>
                <ul className="list-disc list-inside text-slate-400 text-sm space-y-2">
                  <li>To provide personalized coding feedback.</li>
                  <li>To track and reward your learning achievements.</li>
                  <li>To maintain security and prevent unauthorized access.</li>
                  <li>To communicate important updates about your account.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h4 className="text-lg font-bold text-white">Data Security</h4>
                <p className="text-slate-400 leading-relaxed text-sm">
                  We use industry-standard encryption to protect your data. Authentication is handled securely through Supabase, and we never sell your personal information to third parties.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-lg font-bold text-white">Your Rights</h4>
                <p className="text-slate-400 leading-relaxed text-sm">
                  You have the right to access, update, or delete your account and all associated data at any time through the settings panel or by contacting our support team.
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

export default Welcome;