import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Moon, Sun, Bell, Globe, ShieldCheck, Smartphone,
  ChevronRight, ArrowLeft, Info, Lock, User as UserIcon,
  Trash2, Key, Database, Eye, FileText, ExternalLink,
  History, ShieldAlert, Zap, CreditCard, Calendar,
  CheckCircle2, Mail, HelpCircle, FileCheck, Star,
  LogOut, Crown, LayoutDashboard, GraduationCap, Code2, Sliders,
  Save, Loader2,
  Send, Camera
} from 'lucide-react';

type SubSection = 'MAIN' | 'EDIT_PROFILE' | 'PRIVACY' | 'ABOUT' | 'BILLING' | 'TERMS';

const Settings: React.FC<{ onBack?: () => void }> = ({ onBack: propOnBack }) => {
  const { user, logout, loading, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSub, setActiveSub] = useState<SubSection>('MAIN');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark as per user request
  });

  const toggleTheme = (isDark: boolean) => {
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  const [pushNotifs, setPushNotifs] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Edit Profile States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (location.state && (location.state as any).section === 'EDIT_PROFILE') {
      setActiveSub('EDIT_PROFILE');
    }

    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [location, user]);

  // Theme persistence and class application is now handled by toggleTheme and App.tsx

  if (loading || !user) return null;

  const handleBack = () => {
    if (activeSub !== 'MAIN') {
      setActiveSub('MAIN');
    } else {
      if (propOnBack) propOnBack();
      else navigate(-1);
    }
  };

  const handleSaveProfile = () => {
    if (!name.trim() || name === user?.name) return;

    // UI Update - Instant Feedback (Optimistic)
    setActiveSub('MAIN');

    // Background Update
    if (updateUser && user?._id) {
      updateUser({ name }).catch(err => {
        console.error("Background profile update failed:", err);
        // Ideally show a global error toast here if available
      });
    }
  };

  const handleSubmitFeedback = () => {
    // In a real app, you would send the rating to your backend here.
    console.log(`Submitting feedback: ${rating} stars`);
    setFeedbackSubmitted(true);
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await import('../../services/authService').then(m => m.authService.deleteAccount());
        navigate('/login');
      } catch (error) {
        alert("Failed to delete account. Please try again.");
        console.error(error);
      }
    }
  };

  const renderHeader = (title: string, subtitle?: string) => (
    <header className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl py-4 z-50 shrink-0 border-b border-transparent transition-all">
      <button
        onClick={handleBack}
        className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase italic">{title}</h1>
        {subtitle && <p className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-500 tracking-widest mt-1">{subtitle}</p>}
      </div>
    </header>
  );

  const SectionItem = ({ icon: Icon, color, title, desc, action, toggle, toggleState }: any) => (
    <div
      onClick={action && !toggle ? () => action() : undefined}
      className="p-4 md:p-5 flex items-center justify-between border-b border-slate-100 dark:border-white/5 last:border-0 group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 active:bg-slate-100 dark:active:bg-slate-800/40 transition-all"
    >
      <div className="flex items-center gap-4 md:gap-5">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${color} bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 group-hover:scale-105 group-hover:border-indigo-500/30 transition-all shrink-0 shadow-sm`}>
          <Icon size={18} className="md:w-[22px] md:h-[22px]" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors uppercase italic tracking-tight truncate">{title}</p>
          <p className="text-[10px] md:text-[11px] text-slate-600 dark:text-slate-400 font-bold group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors uppercase tracking-wide truncate">{desc}</p>
        </div>
      </div>
      {toggle ? (
        <button onClick={() => action(!toggleState)} className={`w-10 h-5 md:w-12 md:h-6 rounded-full transition-all relative shrink-0 ${toggleState ? 'bg-indigo-600' : 'bg-slate-800'}`}>
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all ${toggleState ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'}`} />
        </button>
      ) : (
        !action && <ChevronRight className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all w-4 h-4 md:w-5 md:h-5 shrink-0" />
      )}
    </div>
  );

  if (activeSub === 'EDIT_PROFILE') {
    return (
      <div className="p-5 md:p-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300 min-h-screen bg-slate-50 dark:bg-black">
        {renderHeader('Profile', 'Update your personal info')}

        <div className="space-y-10">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="relative group cursor-pointer">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-2xl transition-transform group-hover:scale-105">
                <div className="w-full h-full rounded-[1.8rem] bg-white dark:bg-black flex items-center justify-center overflow-hidden border-4 border-slate-50 dark:border-black">
                  <span className="text-5xl font-black text-slate-900 dark:text-white italic">
                    {(user.name && user.name !== 'User' ? user.name : user.email)?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 bg-indigo-600 w-10 h-10 rounded-xl border-4 border-slate-50 dark:border-black flex items-center justify-center shadow-lg group-hover:bg-indigo-500 transition-colors">
                <Camera size={18} className="text-white" />
              </div>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-600 text-center">
              Upload a profile photo
            </p>
          </div>

          {/* Form Section */}
          <div className="space-y-8 bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl">
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-700 dark:text-white mb-4 ml-2 italic">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-600 mb-4 ml-2 italic">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full p-4 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/5 rounded-2xl font-bold text-slate-500 dark:text-slate-600 cursor-not-allowed select-none italic"
              />
              <p className="flex items-center gap-2 mt-4 ml-2 text-[10px] font-black text-slate-700 uppercase tracking-[0.15em]">
                <Lock size={12} /> Email address cannot be changed
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving || !name.trim() || name === user.name}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-900 text-white disabled:text-slate-400 dark:disabled:text-slate-700 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 disabled:shadow-none disabled:cursor-not-allowed italic"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </div>
      </div>
    );
  }


  const TextPage = ({ title, subtitle, children }: any) => (
    <div className="p-5 md:p-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300 min-h-screen bg-slate-50 dark:bg-black">
      {renderHeader(title, subtitle)}
      <div className="prose dark:prose-invert max-w-none prose-slate">
        {children}
      </div>
    </div>
  );

  if (activeSub === 'PRIVACY') {
    return (
      <TextPage title="Privacy Policy" subtitle="Last updated: Feb 2026">
        <div className="space-y-6">
          <section>
            <h3 className="font-black text-slate-900 dark:text-white text-lg mb-2 uppercase italic tracking-tight underline decoration-indigo-500 underline-offset-4">1. AI-Powered Assistance</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              GenSpark uses AI (Google Gemini) to provide code explanations. We share your code snippets with these providers but NEVER your personal identification data.
            </p>
          </section>
          <section>
            <h3 className="font-black text-slate-900 dark:text-white text-lg mb-2 uppercase italic tracking-tight underline decoration-indigo-500 underline-offset-4">2. Local Storage</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              We use device storage to cache your progress and autosave your code. This ensures a seamless offline-to-online experience.
            </p>
          </section>
          <section>
            <h3 className="font-black text-secondary dark:text-white text-lg mb-2 uppercase italic tracking-tight underline decoration-indigo-500 underline-offset-4">3. Data Security</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              All user data is encrypted via SSL/TLS and stored in secure Supabase environments. We do not sell your data to third parties.
            </p>
          </section>
        </div>
      </TextPage>
    );
  }

  if (activeSub === 'TERMS') {
    return (
      <TextPage title="Terms of Service" subtitle="Last updated: Feb 2026">
        <div className="space-y-6">
          <section>
            <h3 className="font-black text-white text-lg mb-2 uppercase italic tracking-tight underline decoration-indigo-500 underline-offset-4">1. License of Use</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              GenSpark grants you a personal, non-exclusive license to use our educational materials for private study. Commercial redistribution is strictly prohibited.
            </p>
          </section>
          <section>
            <h3 className="font-black text-white text-lg mb-2 uppercase italic tracking-tight underline decoration-rose-500 underline-offset-4">2. Limitation of Liability</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              The Service is provided "as-is". GenSpark is not liable for errors in AI explanations or compiler results. Use at your own educational risk.
            </p>
          </section>
        </div>
      </TextPage>
    );
  }

  if (activeSub === 'ABOUT') {
    return (
      <div className="p-5 md:p-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300 min-h-screen bg-black">
        {renderHeader('Help Center', 'We are here to help')}

        <div className="bg-indigo-600 text-white p-10 rounded-[2.5rem] text-center mb-10 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-3 uppercase italic">GenSpark Support</h2>
            <p className="text-indigo-100 font-bold mb-8 italic">Need help with a course or account?</p>
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl">
              Contact Support
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        </div>

        <div className="space-y-6">
          <h3 className="font-black text-white px-2 uppercase tracking-[0.2em] italic text-xs">Frequently Asked Questions</h3>
          {[
            "How do I reset my progress?",
            "How does the AI tutor work?"
          ].map((q, i) => (
            <div key={i} className="p-5 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-slate-800 transition-all cursor-pointer group">
              <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{q}</span>
              <ChevronRight size={18} className="text-slate-600 group-hover:text-indigo-400 transition-all" />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center border-t border-white/5 pt-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-2 italic">GenSpark v0.1.0 Beta</p>
          <p className="text-[10px] font-bold text-slate-600 uppercase italic tracking-wider mb-8">Professional Educational Platform</p>

          <div className="flex flex-wrap justify-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
            {['React', 'Vite', 'Supabase', 'Monaco', 'Lucide', 'Tailwind'].map(lib => (
              <span key={lib} className="px-2 py-1 border border-white/20 rounded text-[9px] font-black text-slate-400 uppercase tracking-widest">{lib}</span>
            ))}
          </div>
          <p className="text-[8px] font-bold text-slate-700 uppercase mt-6 tracking-[0.2em]">© 2026 GenSpark Learning Systems</p>
        </div>
      </div>
    );
  }

  // ... (Other subsections remain the same)

  return (
    <div className="px-4 py-8 md:p-10 max-w-4xl mx-auto pb-32 animate-in fade-in duration-500 min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300">
      <header className="px-1 mb-6 md:mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 md:mb-2 uppercase italic">Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] md:text-xs tracking-[0.3em]">Manage your profile</p>
      </header>

      <div className="mb-8 md:mb-10 p-5 md:p-8 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-5 md:gap-8 shadow-xl">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl md:text-3xl font-black border border-indigo-500/20 dark:border-indigo-500/30 shrink-0 shadow-sm">
          {(user.name && user.name !== 'User' ? user.name : user.email)?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-0.5 md:mb-1 uppercase italic tracking-tight truncate">
            {user.name || 'User'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs md:text-sm tracking-wide truncate">{user.email}</p>
        </div>
      </div>

      <div className="space-y-6 md:space-y-10">
        <section>
          <h3 className="text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-3 md:mb-4 px-2 italic">Account</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-xl">
            <SectionItem
              icon={UserIcon}
              color="text-blue-400"
              title="Edit Profile"
              desc="Personal info, picture & bio"
              action={() => setActiveSub('EDIT_PROFILE')}
            />
            <SectionItem
              icon={ShieldCheck}
              color="text-emerald-400"
              title="Password & Security"
              desc="2FA & Password settings"
              action={() => setActiveSub('EDIT_PROFILE')}
            />
          </div>
        </section>

        <section>
          <h3 className="text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-3 md:mb-4 px-2 italic">App Preferences</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-xl">
            <SectionItem
              icon={darkMode ? Moon : Sun}
              color="text-indigo-400"
              title="Dark Appearance"
              desc="Easier on the eyes at night"
              toggle={true}
              toggleState={darkMode}
              action={toggleTheme}
            />
            <SectionItem
              icon={Bell}
              color="text-rose-400"
              title="Push Notifications"
              desc="Daily reminders & streaks"
              toggle={true}
              toggleState={pushNotifs}
              action={setPushNotifs}
            />
            <SectionItem
              icon={Globe}
              color="text-cyan-400"
              title="Language"
              desc="English (US)"
            />
          </div>
        </section>

        {/* Feedback Section - Professional UI */}
        <section>
          <h3 className="text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-3 md:mb-4 px-2 italic">Feedback & Reviews</h3>
          <div className="bg-white dark:bg-slate-900 border border-indigo-500/20 rounded-2xl md:rounded-[2.5rem] overflow-hidden p-6 md:p-8 relative group shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-indigo-500/20"></div>

            {!feedbackSubmitted ? (
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 md:mb-4 animate-bounce-slow border border-indigo-500/20">
                  <Star size={24} className="fill-current md:w-7 md:h-7" />
                </div>
                <h4 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2 uppercase italic">Enjoying GenSpark?</h4>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] md:text-sm mb-6 md:mb-8 max-w-xs mx-auto">
                  Your feedback helps us build the best coding platform for everyone.
                </p>

                <div className="flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8 p-2 md:p-3 bg-slate-50 dark:bg-black rounded-full shadow-inner w-fit mx-auto border border-slate-200 dark:border-white/10">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className={`p-1.5 md:p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${rating >= s ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-700 hover:text-yellow-400/50'
                        }`}
                    >
                      <Star size={24} className={`md:w-8 md:h-8 ${rating >= s ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <textarea
                      className="w-full text-xs md:text-sm p-3 md:p-4 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl md:rounded-[1.5rem] mb-3 md:mb-4 focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white font-bold"
                      rows={3}
                      placeholder="Tell us what you love (or hate)..."
                    ></textarea>
                    <button
                      onClick={handleSubmitFeedback}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all text-xs md:text-base"
                    >
                      Submit Review <Send size={16} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative z-10 text-center py-6 md:py-10 animate-in zoom-in duration-300">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4 md:mb-6 border border-green-500/20">
                  <CheckCircle2 size={32} className="md:w-10 md:h-10" />
                </div>
                <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase italic">Thanks a bunch! 🎉</h4>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">We've received your feedback.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-3 md:mb-4 px-2 italic">Support</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-xl">
            <SectionItem
              icon={HelpCircle}
              color="text-teal-400"
              title="Help Center"
              desc="FAQs & Contact Support"
              action={() => setActiveSub('ABOUT')}
            />
            <SectionItem
              icon={Info}
              color="text-indigo-400"
              title="About GenSpark"
              desc="Platform version & mission"
              action={() => setActiveSub('ABOUT')}
            />
          </div>
        </section>

        <section>
          <h3 className="text-slate-900 dark:text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-3 md:mb-4 px-2 italic">Legal</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-xl">
            <SectionItem
              icon={Lock}
              color="text-slate-400"
              title="Privacy Policy"
              desc="Data protection & transparency"
              action={() => setActiveSub('PRIVACY')}
            />
            <SectionItem
              icon={FileCheck}
              color="text-orange-400"
              title="Terms of Service"
              desc="Agreement & usage rules"
              action={() => setActiveSub('TERMS')}
            />
          </div>
        </section>

        <section>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-xl">
            <SectionItem
              icon={LogOut}
              color="text-red-400"
              title="Log Out"
              desc="Sign out of your account"
              action={logout}
            />
          </div>
        </section>

        <div className="pt-6 md:pt-8 px-4 text-center md:text-left">
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-3 text-red-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-red-300 transition-all active:scale-95 italic"
          >
            <Trash2 size={16} />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

// ... CrownIcon component ...

export default Settings;