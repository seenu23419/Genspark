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
    return document.documentElement.classList.contains('dark') ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

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
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{subtitle}</p>}
      </div>
    </header>
  );

  const SectionItem = ({ icon: Icon, color, title, desc, action, toggle, toggleState }: any) => (
    <div
      onClick={action && !toggle ? () => action() : undefined}
      className="p-4 md:p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/50 last:border-0 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20 active:bg-slate-100 dark:active:bg-slate-800/40 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-slate-100 dark:bg-slate-800/50 group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base group-hover:text-black dark:group-hover:text-white transition-colors">{title}</p>
          <p className="text-[10px] md:text-[11px] text-slate-500 font-medium group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">{desc}</p>
        </div>
      </div>
      {toggle ? (
        <button onClick={() => action(!toggleState)} className={`w-11 h-6 rounded-full transition-colors relative ${toggleState ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${toggleState ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      ) : (
        !action && <ChevronRight className="text-slate-400 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all w-5 h-5" />
      )}
    </div>
  );

  if (activeSub === 'EDIT_PROFILE') {
    return (
      <div className="p-5 md:p-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
        {renderHeader('Edit Profile', 'Update your personal info')}

        <div className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-xl">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-900">
                  <span className="text-4xl font-black text-white">
                    {(user.name && user.name !== 'User' ? user.name : user.email)?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 bg-indigo-600 w-8 h-8 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center shadow-lg group-hover:bg-indigo-500 transition-colors">
                <Camera size={14} className="text-white" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 text-center">
              Upload a profile photo (optional)
            </p>
          </div>

          {/* Form Section */}
          <div className="space-y-6 bg-white dark:bg-slate-900/50 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3 ml-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-all"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3 ml-2">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full p-4 bg-slate-100/50 dark:bg-slate-900/50 border-2 border-transparent rounded-2xl font-medium text-slate-500 cursor-not-allowed select-none"
              />
              <p className="flex items-center gap-2 mt-3 ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Lock size={10} /> Email address cannot be changed
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving || !name.trim() || name === user.name}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Save Profile
          </button>
        </div>
      </div>
    );
  }


  const TextPage = ({ title, subtitle, children }: any) => (
    <div className="p-5 md:p-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
      {renderHeader(title, subtitle)}
      <div className="prose dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  );

  if (activeSub === 'PRIVACY') {
    return (
      <TextPage title="Privacy Policy" subtitle="Last updated: Jan 2025">
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          At GenSpark, we take your privacy seriously. This policy describes how we collect, use, and handle your data independently from third-party trackers.
        </p>
        <h3 className="font-bold text-slate-900 dark:text-white text-lg mt-6 mb-2">1. Data Collection</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          We collect essential information to provide our services, such as your name, email, and learning progress. We do not sell your personal data.
        </p>
        <h3 className="font-bold text-slate-900 dark:text-white text-lg mt-6 mb-2">2. Security</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Your data is encrypted in transit and at rest using industry-standard protocols.
        </p>
      </TextPage>
    );
  }

  if (activeSub === 'TERMS') {
    return (
      <TextPage title="Terms of Service" subtitle="Last updated: Jan 2025">
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          By using GenSpark, you agree to these terms. Please read them carefully.
        </p>
        <h3 className="font-bold text-slate-900 dark:text-white text-lg mt-6 mb-2">1. Usage License</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Permission is granted to temporarily download one copy of the materials (information or software) on GenSpark's website for personal, non-commercial transitory viewing only.
        </p>
      </TextPage>
    );
  }

  if (activeSub === 'ABOUT') {
    return (
      <div className="p-5 md:p-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
        {renderHeader('Help Center', 'We are here to help')}

        <div className="bg-slate-900 text-white p-8 rounded-[2rem] text-center mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2">GenSpark Support</h2>
            <p className="text-slate-400 mb-6">Need help with a course or account?</p>
            <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
              Contact Support
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-black text-slate-900 dark:text-white px-2">FAQ</h3>
          {[
            "How do I reset my progress?",
            "Can I download certificates?",
            "How does the AI tutor work?"
          ].map((q, i) => (
            <div key={i} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer">
              <span className="font-medium text-slate-700 dark:text-slate-300">{q}</span>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">GenSpark v1.0.2</p>
          <p className="text-[10px] text-slate-500">Made with ❤️ for coders</p>
        </div>
      </div>
    );
  }

  // ... (Other subsections remain the same)

  return (
    <div className="p-5 md:p-10 max-w-3xl mx-auto pb-32 animate-in fade-in duration-500">
      <header className="px-1 mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Settings</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Manage your preferences</p>
      </header>

      <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl font-black border border-indigo-500/20">
          {(user.name && user.name !== 'User' ? user.name : user.email)?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
            {user.name || 'User'}
          </h2>
          <p className="text-slate-500 font-medium text-sm">{user.email}</p>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-4 px-2">Account</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
            <SectionItem
              icon={UserIcon}
              color="text-blue-500"
              title="Edit Profile"
              desc="Personal info, picture & bio"
              action={() => setActiveSub('EDIT_PROFILE')}
            />
            <SectionItem
              icon={ShieldCheck}
              color="text-emerald-500"
              title="Password & Security"
              desc="2FA & Password settings"
              action={() => setActiveSub('EDIT_PROFILE')}
            />
          </div>
        </section>

        <section>
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-4 px-2">App Preferences</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
            <SectionItem
              icon={darkMode ? Moon : Sun}
              color="text-indigo-500"
              title="Dark Appearance"
              desc="Easier on the eyes at night"
              toggle={true}
              toggleState={darkMode}
              action={setDarkMode}
            />
            <SectionItem
              icon={Bell}
              color="text-rose-500"
              title="Push Notifications"
              desc="Daily reminders & streaks"
              toggle={true}
              toggleState={pushNotifs}
              action={setPushNotifs}
            />
            <SectionItem
              icon={Globe}
              color="text-cyan-500"
              title="Language"
              desc="English (US)"
            />
          </div>
        </section>

        {/* Feedback Section - Professional UI */}
        <section>
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-4 px-2">Feedback & Reviews</h3>
          <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 dark:border-indigo-500/20 rounded-[2rem] overflow-hidden p-6 relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-indigo-500/20"></div>

            {!feedbackSubmitted ? (
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 mx-auto bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 animate-bounce-slow">
                  <Star className="fill-current" size={24} />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Enjoying GenSpark?</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mb-6 max-w-xs mx-auto">
                  Your feedback helps us build the best coding platform for everyone.
                </p>

                <div className="flex items-center justify-center gap-2 mb-6 p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm w-fit mx-auto border border-slate-100 dark:border-slate-700">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${rating >= s ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600 hover:text-yellow-400/50'
                        }`}
                    >
                      <Star size={28} className={rating >= s ? "fill-current" : ""} />
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <textarea
                      className="w-full text-sm p-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 rounded-xl mb-3 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors resize-none placeholder:text-slate-400"
                      rows={2}
                      placeholder="Tell us what you love (or hate)..."
                    ></textarea>
                    <button
                      onClick={handleSubmitFeedback}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      Submit Review <Send size={14} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative z-10 text-center py-8 animate-in zoom-in duration-300">
                <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Thanks a bunch! 🎉</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm">We've received your feedback.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-4 px-2">Support & Legal</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
            <SectionItem
              icon={HelpCircle}
              color="text-teal-500"
              title="Help Center"
              desc="FAQs & Contact Support"
              action={() => setActiveSub('ABOUT')}
            />
            <SectionItem
              icon={Lock}
              color="text-slate-500"
              title="Privacy Policy"
              desc="How we handle your data"
              action={() => navigate('/privacy')}
            />
            <SectionItem
              icon={FileCheck}
              color="text-orange-500"
              title="Terms of Service"
              desc="The boring legal stuff"
              action={() => setActiveSub('TERMS')}
            />
            <SectionItem
              icon={LogOut}
              color="text-red-500"
              title="Log Out"
              desc="Sign out of your account"
              action={logout}
            />
          </div>
        </section>

        <div className="pt-4 px-2">
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

// ... CrownIcon component ...

export default Settings;