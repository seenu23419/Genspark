import React from 'react';
import { User } from '../../types';
import { BadgeDollarSign, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

interface SubscriptionStatusProps {
  user: User;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ user }) => {
  const isPremiumActive = user.subscriptionStatus === 'PREMIUM_ACTIVE';
  const isPremiumExpired = user.subscriptionStatus === 'PREMIUM_EXPIRED';
  const isFree = !isPremiumActive && !isPremiumExpired;

  let statusColor = '';
  let statusIcon = null;
  let statusText = '';
  let endDateText = '';

  if (isPremiumActive) {
    statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    statusIcon = <CheckCircle className="text-emerald-400" size={20} />;
    statusText = 'Premium Active';
    
    if (user.subscriptionEndDate) {
      const endDate = new Date(user.subscriptionEndDate);
      const now = new Date();
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft > 0) {
        endDateText = `Renews in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
      } else {
        endDateText = 'Expires today';
      }
    }
  } else if (isPremiumExpired) {
    statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    statusIcon = <Clock className="text-amber-400" size={20} />;
    statusText = 'Premium Expired';
    
    if (user.subscriptionEndDate) {
      const endDate = new Date(user.subscriptionEndDate);
      endDateText = `Expired on ${endDate.toLocaleDateString()}`;
    }
  } else {
    statusColor = 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    statusIcon = <XCircle className="text-slate-400" size={20} />;
    statusText = 'Free Plan';
    endDateText = 'No subscription';
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BadgeDollarSign className="text-indigo-400" size={20} />
          Subscription Status
        </h3>
      </div>

      <div className="space-y-4">
        <div className={`flex items-center justify-between p-4 rounded-xl border ${statusColor}`}>
          <div className="flex items-center gap-3">
            {statusIcon}
            <span className="font-bold text-white">{statusText}</span>
          </div>
          <span className="text-sm font-medium">{endDateText}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-slate-900/50 rounded-xl">
            <div className="text-slate-400">Plan</div>
            <div className="text-white font-bold">
              {isPremiumActive ? 'Premium' : isPremiumExpired ? 'Premium (Expired)' : 'Free'}
            </div>
          </div>
          
          <div className="p-3 bg-slate-900/50 rounded-xl">
            <div className="text-slate-400">Price</div>
            <div className="text-white font-bold">
              {isPremiumActive || isPremiumExpired ? '₹49/month' : 'Free'}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h4 className="font-bold text-white mb-2">What's included:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPremiumActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
              <span className={isPremiumActive ? 'text-white' : 'text-slate-500'}>
                Full course access (100%)
              </span>
            </li>
            <li className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPremiumActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
              <span className={isPremiumActive ? 'text-white' : 'text-slate-500'}>
                Unlimited compiler runs
              </span>
            </li>
            <li className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPremiumActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
              <span className={isPremiumActive ? 'text-white' : 'text-slate-500'}>
                Unlimited AI Tutor usage
              </span>
            </li>
            <li className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPremiumActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
              <span className={isPremiumActive ? 'text-white' : 'text-slate-500'}>
                Certificate generation
              </span>
            </li>
            <li className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPremiumActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
              <span className={isPremiumActive ? 'text-white' : 'text-slate-500'}>
                Advanced challenges
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;