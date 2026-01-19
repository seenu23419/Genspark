import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/paymentService';
import { billingService } from '../../services/billingService';
import { User } from '../../types';
import { Check, X, Star, Sparkles, Loader2 } from 'lucide-react';

const SubscriptionPlan: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, you would call your backend to create an order
      // and then open the Razorpay checkout with that order
      await paymentService.openCheckout(user._id, user);
      
      // Note: The actual subscription creation would happen after payment verification
      // via webhook, but for demo purposes we'll show success
      // In a real app, this would happen after the payment webhook confirms
      setSuccess(true);
      
      // Refresh user profile to get updated subscription status
      // Note: This will only update after the webhook has processed the payment
      // In demo mode, we'll show success message
      await refreshProfile();
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to initiate subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await billingService.cancelSubscription(user._id);
      await refreshProfile(); // Refresh user data
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Cancel subscription error:', err);
      setError(err.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-6">
        <div className="text-center text-white">
          <p>Please log in to access subscription options.</p>
        </div>
      </div>
    );
  }

  // Determine current plan based on user subscription status
  const isPremiumActive = user.subscriptionStatus === 'PREMIUM_ACTIVE';
  const isPremiumExpired = user.subscriptionStatus === 'PREMIUM_EXPIRED';
  const isFree = !isPremiumActive && !isPremiumExpired;

  const currentPlan = isPremiumActive ? 'PREMIUM' : isFree ? 'FREE' : 'PREMIUM_EXPIRED';

  return (
    <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Unlock the full power of GenSpark with premium features designed to accelerate your coding journey.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-center">
            {isPremiumActive ? 'Subscription updated successfully!' : 'Action completed successfully!'}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className={`bg-slate-900/40 backdrop-blur-2xl border ${currentPlan === 'FREE' ? 'border-indigo-500/50 ring-2 ring-indigo-500/20' : 'border-white/10'} rounded-[2rem] p-8 shadow-2xl transition-all`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white mb-2">Free Plan</h2>
              <div className="text-4xl font-black text-white mb-1">₹0</div>
              <div className="text-slate-500 text-sm font-medium">forever</div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <Check className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-300">Limited lessons per course (first 20%)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-300">Limited compiler runs per day (10)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-300">Limited AI Tutor requests (5/day)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-300">Basic challenges</span>
              </li>
              <li className="flex items-center gap-3">
                <X className="text-slate-500 flex-shrink-0" size={20} />
                <span className="text-slate-500 line-through">No certificates</span>
              </li>
              <li className="flex items-center gap-3">
                <X className="text-slate-500 flex-shrink-0" size={20} />
                <span className="text-slate-500 line-through">No mentor approval</span>
              </li>
              <li className="flex items-center gap-3">
                <X className="text-slate-500 flex-shrink-0" size={20} />
                <span className="text-slate-500 line-through">No advanced challenges</span>
              </li>
            </ul>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-600/10 text-indigo-400 px-4 py-2 rounded-full text-sm font-bold">
                Current Plan
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div className={`bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-2xl border ${currentPlan === 'PREMIUM' ? 'border-indigo-500/50 ring-2 ring-indigo-500/20' : 'border-white/10'} rounded-[2rem] p-8 shadow-2xl transition-all relative overflow-hidden`}>
            {currentPlan === 'PREMIUM' && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                ACTIVE
              </div>
            )}
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-sm font-bold mb-3">
                <Star className="text-yellow-400" size={16} />
                PREMIUM
              </div>
              <h2 className="text-2xl font-black text-white mb-2">GenSpark Premium</h2>
              <div className="text-4xl font-black text-white mb-1">₹49</div>
              <div className="text-slate-300 text-sm font-medium">per month</div>
              <div className="text-slate-500 text-xs mt-2">Auto-renewable • Cancel anytime</div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <Check className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-300">Full course access (100%)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-300">Unlimited compiler runs</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-300">Unlimited AI Tutor usage</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-300">Certificate generation</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-300">Mentor-approved completion</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-300">Advanced challenges</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-emerald-500 flex-shrink-0" size={20} />
                <span className="text-slate-300">Priority performance</span>
              </li>
            </ul>

            <div className="text-center">
              {isPremiumActive ? (
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full h-14 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Cancel Subscription'}
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Upgrade to Premium
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>3-day grace period after subscription expires. Cancel anytime with no penalties.</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlan;