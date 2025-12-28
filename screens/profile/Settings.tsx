
import React, { useState } from 'react';
import { 
  Moon, Sun, Bell, Globe, ShieldCheck, Smartphone,
  ChevronRight, ArrowLeft, Info, Lock, User as UserIcon,
  Trash2, Key, Database, Eye, FileText, ExternalLink,
  History, ShieldAlert, Zap, CreditCard, Calendar
} from 'lucide-react';
import { Screen, User } from '../../types';

interface SettingsProps {
  user: User | null;
  setScreen: (screen: Screen) => void;
}

type SubSection = 'MAIN' | 'PRIVACY' | 'ABOUT' | 'BILLING';

const Settings: React.FC<SettingsProps> = ({ user, setScreen }) => {
  const [activeSub, setActiveSub] = useState<SubSection>('MAIN');
  const [darkMode, setDarkMode] = useState(true);

  const renderHeader = (title: string, backTo: SubSection = 'MAIN') => (
    <header className="flex items-center gap-4 mb-8 sticky top-0 bg-slate-950/80 backdrop-blur-md py-4 z-10">
      <button onClick={() => setActiveSub(backTo)} className="p-2 text-slate-400 hover:text-white rounded-xl transition-all">
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-2xl font-black text-white">{title}</h1>
    </header>
  );

  const SectionItem = ({ icon: Icon, color, title, desc, action }: any) => (
    <div onClick={action} className="p-5 flex items-center justify-between border-b border-slate-800 last:border-0 group cursor-pointer hover:bg-white/[0.03] transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="font-bold text-slate-200">{title}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{desc}</p>
        </div>
      </div>
      <ChevronRight className="text-slate-600 group-hover:text-slate-300 transition-colors" size={18} />
    </div>
  );

  if (activeSub === 'BILLING') {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
        {renderHeader('Subscription & Billing')}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-600/20">
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-1">Active Plan</p>
            <h3 className="text-3xl font-black mb-6">{user?.subscriptionTier || 'Free'} Edition</h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold uppercase opacity-60">Next Payment</p>
                <p className="font-mono text-sm">{user?.nextBillingDate ? new Date(user.nextBillingDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase opacity-60">Cycle</p>
                <p className="font-bold text-lg">{user?.billingCycle || 'None'}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
             <SectionItem icon={CreditCard} color="text-emerald-400" title="Payment Methods" desc="Mastercard •••• 4242" action={() => {}} />
             <SectionItem icon={Calendar} color="text-indigo-400" title="Billing History" desc="Download PDF Invoices" action={() => {}} />
             <SectionItem icon={Zap} color="text-yellow-400" title="Switch Plan" desc="Change cycle or upgrade" action={() => setScreen('SUBSCRIPTION')} />
          </div>

          <button className="w-full py-4 bg-red-400/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black text-sm transition-all border border-red-500/20">
            Cancel Subscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tighter">Production Settings</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Manage your professional dev profile</p>
      </header>

      <div className="space-y-8">
        <section>
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <SectionItem icon={UserIcon} color="text-indigo-400" title="Personal Info" desc="Name, Email & Avatar" action={() => setScreen('PROFILE')} />
            <SectionItem icon={ShieldCheck} color="text-emerald-400" title="Privacy & Security" desc="2FA & Sessions" action={() => setActiveSub('PRIVACY')} />
            <SectionItem icon={CreditCard} color="text-purple-400" title="Manage Billing" desc="Subscription & Invoices" action={() => setActiveSub('BILLING')} />
          </div>
        </section>

        <section>
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <SectionItem icon={Bell} color="text-orange-400" title="Notifications" desc="Push & Email alerts" action={() => {}} />
            <SectionItem icon={Globe} color="text-blue-400" title="Region & Language" desc="English (United States)" action={() => {}} />
            <SectionItem icon={Info} color="text-slate-500" title="About GenSpark" desc="v4.0.2 Build GS_240" action={() => setActiveSub('ABOUT')} />
          </div>
        </section>
      </div>

      <div className="text-center pb-20 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">GenSpark Intelligence Global Network</p>
      </div>
    </div>
  );
};

export default Settings;
