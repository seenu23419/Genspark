import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PremiumGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureName?: string;
  showUpgradeButton?: boolean;
}

const PremiumGuard: React.FC<PremiumGuardProps> = ({
  children,
  fallback,
  featureName = 'this feature',
  showUpgradeButton = true
}) => {
  const { user } = useAuth();
  
  const isPremiumActive = user?.subscriptionStatus === 'PREMIUM_ACTIVE';
  
  if (isPremiumActive) {
    return <>{children}</>;
  }
  
  // Default fallback if none provided
  const defaultFallback = (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-6">
        <Lock className="text-indigo-500" size={32} />
      </div>
      
      <h3 className="text-xl font-black text-white mb-2">
        Premium Access Required
      </h3>
      
      <p className="text-slate-400 mb-6">
        Unlock {featureName} and more premium features with GenSpark Premium.
      </p>
      
      {showUpgradeButton && (
        <Link 
          to="/subscription" 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/20"
        >
          <Sparkles size={18} />
          Upgrade to Premium
        </Link>
      )}
    </div>
  );
  
  return fallback || defaultFallback;
};

export default PremiumGuard;