
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Check, Zap, ShieldCheck, Crown, ArrowLeft, Loader2, Star, Percent } from 'lucide-react';
import { supabaseDB } from '../../services/supabaseService';
import { User } from '../../types';

interface SubscriptionPlanProps {
  user?: User;
  onSuccess?: (updatedUser: User) => void;
  onBack?: () => void;
}

const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({ user: propUser, onSuccess, onBack: propOnBack }) => {
  const { user: authUser, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const user = propUser || authUser;

  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');

  const handleBack = () => {
    if (propOnBack) propOnBack();
    else navigate(-1);
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      // Pin-to-pin real payment simulation
      await new Promise(resolve => setTimeout(resolve, 2500));
      const nextDate = new Date();
      if (billingCycle === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else nextDate.setFullYear(nextDate.getFullYear() + 1);

      // Update via Supabase
      const updatedUser = await supabaseDB.updateOne(user._id, {
        isPro: true,
        subscriptionTier: 'Pro',
        billingCycle: billingCycle,
        nextBillingDate: nextDate
      });
      if (onSuccess) {
        onSuccess(updatedUser);
      } else {
        await refreshProfile();
        navigate('/profile');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const proFeatures = [
    { title: "GenSpark Pro Intelligence", desc: "Unlock Elite reasoning and complex logic solving.", icon: Star },
    { title: "2.5x XP Multiplier", desc: "Level up at lightning speed.", icon: Zap },
    { title: "Unlimited Debugging", desc: "Visual analysis for any code snippet.", icon: ShieldCheck },
    { title: "Advanced Modules", desc: "Exclusive Hard & Expert track access.", icon: Crown },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b14] p-6 md:p-12 flex flex-col items-center animate-in fade-in duration-500">
      <div className="max-w-5xl w-full">
        <header className="flex items-center justify-between mb-12">
          <button onClick={handleBack} className="p-3 bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-90">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Crown className="text-yellow-500" size={24} />
            <span className="font-black text-white uppercase tracking-[0.2em] text-sm">GenSpark Pro</span>
          </div>
          <div className="w-10"></div>
        </header>

        <div className="text-center space-y-4 mb-10">
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            Level Up Your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600">Coding Career</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Get unlimited access to advanced AI, faster leveling, and professional dev tools.
          </p>
        </div>

        {/* Cycle Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 flex items-center relative">
            <button
              onClick={() => setBillingCycle('Monthly')}
              className={`relative z-10 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${billingCycle === 'Monthly' ? 'text-white' : 'text-slate-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('Yearly')}
              className={`relative z-10 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${billingCycle === 'Yearly' ? 'text-white' : 'text-slate-500'}`}
            >
              Yearly
              <span className="absolute -top-3 -right-2 bg-emerald-500 text-[8px] px-2 py-0.5 rounded-full text-black font-black uppercase tracking-tighter shadow-lg shadow-emerald-500/20">Save 20%</span>
            </button>
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-indigo-600 rounded-xl transition-transform duration-500 ease-out ${billingCycle === 'Yearly' ? 'translate-x-full' : 'translate-x-0'}`}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] p-10 flex flex-col space-y-8 backdrop-blur-xl">
            <div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Starter</h3>
              <p className="text-slate-500 text-sm">Perfect for hobbyists</p>
            </div>
            <div className="text-5xl font-black text-white">₹0</div>

            <ul className="space-y-5 flex-1 pt-4">
              <FeatureItem text="GenSpark Flash AI" checked />
              <FeatureItem text="Standard XP Rate" checked />
              <FeatureItem text="Basic Curriculum" checked />
              <FeatureItem text="Limited Debugging" checked={false} />
            </ul>

            <button disabled className="w-full py-4 bg-slate-800/50 border border-slate-700 text-slate-500 rounded-2xl font-bold uppercase tracking-widest text-xs">
              Current Plan
            </button>
          </div>

          <div className="relative group animate-in slide-in-from-right-8 duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-slate-900 border-2 border-indigo-500/50 rounded-[2.5rem] p-10 flex flex-col space-y-8 h-full backdrop-blur-xl">
              <div className="absolute -top-4 right-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-2xl border border-white/10">
                Premium Choice
              </div>

              <div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter flex items-center gap-2">
                  Pro
                  <Crown size={24} className="text-yellow-500" />
                </h3>
                <p className="text-indigo-300 text-sm">For elite developers</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-white">₹{billingCycle === 'Monthly' ? '49' : '499'}</span>
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">/ {billingCycle === 'Monthly' ? 'month' : 'year'}</span>
              </div>

              <div className="grid grid-cols-1 gap-5 flex-1">
                {proFeatures.map((f, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <f.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{f.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isProcessing ? <Loader2 size={24} className="animate-spin" /> : `Subscribe ${billingCycle}`}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center mt-12 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          Secure 256-bit encrypted checkout • Instant Activation • Cancel Anytime
        </p>
      </div>
    </div>
  );
};

const FeatureItem = ({ text, checked }: { text: string, checked: boolean }) => (
  <li className="flex items-center gap-4 group">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${checked ? 'bg-indigo-500/20 text-indigo-400 scale-110' : 'bg-slate-800 text-slate-700'}`}>
      <Check size={14} strokeWidth={4} />
    </div>
    <span className={`text-sm font-bold ${checked ? 'text-slate-300' : 'text-slate-700'}`}>{text}</span>
  </li>
);

export default SubscriptionPlan;
