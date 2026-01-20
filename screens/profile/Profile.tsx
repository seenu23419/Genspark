import React, { useState, useEffect } from 'react';
import {
  Settings,
  Flame,
  Star,
  BookOpen,
  Trophy,
  Mail,
  Zap,
  Crown,
  TrendingUp,
  Loader2,
  ExternalLink,
  Award,
  Calendar,
  ShieldCheck,
  Share2,
  Clock,
  Target,
  Pencil,
  CheckCircle2,
  ChevronRight,
  Camera,
  FileText,
  Lock,
  Scroll,
} from 'lucide-react';
import { User, Certificate } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { certificateService } from '../../services/certificateService';
import { supabaseDB } from '../../services/supabaseService';

const data = [
  { name: 'M', xp: 120, time: 45 },
  { name: 'T', xp: 90, time: 30 },
  { name: 'W', xp: 200, time: 60 },
  { name: 'T', xp: 150, time: 40 },
  { name: 'F', xp: 180, time: 55 },
  { name: 'S', xp: 400, time: 90 },
  { name: 'S', xp: 320, time: 70 },
];

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(true);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [solvedProblemsCount, setSolvedProblemsCount] = useState(0);

  useEffect(() => {
    const fetchPracticeStats = async () => {
      try {
        const progress = await supabaseDB.getAllPracticeProgress();
        const solved = progress.filter(p => p.status === 'completed').length;
        setSolvedProblemsCount(solved);
      } catch (err) {
        console.error("Failed to fetch practice stats", err);
      }
    };
    if (user) fetchPracticeStats();
  }, [user]);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (user) {
        try {
          const userCerts = await certificateService.getUserCertificates(user._id);
          setCertificates(userCerts);
          await checkAndGenerateCertificates();
        } catch (error) {
          console.error('Error fetching certificates:', error);
        } finally {
          setCertificatesLoading(false);
        }
      }
    };

    fetchCertificates();
  }, [user]);

  const checkAndGenerateCertificates = async () => {
    // Certificate check moved to LearningProfile to load only when stats are viewed
    if (!user) return;
    const courseData = [
      { id: 'c', name: 'C' } // Minimal check if needed in future
    ];
  };

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500 bg-[#0a0b14] min-h-screen">

      {/* 1. Personal Header - Centered & Premium */}
      <section className="relative overflow-hidden rounded-[3rem] bg-slate-900 border border-white/5 shadow-2xl p-10 mt-4">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Avatar Container */}
          <div className="relative">
            <div
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/30 cursor-pointer group active:scale-95 transition-all"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 border-4 border-slate-950 flex items-center justify-center relative">
                <span className="text-5xl md:text-7xl font-black text-white tracking-tighter transition-transform group-hover:scale-110">
                  {(user.name && user.name !== 'User' ? user.name : user.email)?.charAt(0).toUpperCase()}
                </span>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Edit Icon Button */}
            <button
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
              className="absolute -bottom-1 -right-1 w-10 h-10 bg-indigo-600 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-colors z-20 group"
            >
              <Camera size={14} className="text-white group-hover:scale-110 transition-transform" />
            </button>

            {/* Avatar Dropdown Menu */}
            {showAvatarMenu && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <button className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400">
                    <Camera size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-300">Change Avatar</span>
                </button>
                <button className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 transition-colors group border-t border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-xs font-bold text-white">Use Initial Avatar</span>
                </button>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-l border-t border-white/10 rotate-45" />
              </div>
            )}

            {/* Click-away listener backdrop */}
            {showAvatarMenu && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowAvatarMenu(false)}
              />
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight italic uppercase">
              {user.name}
            </h1>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck size={14} className="text-indigo-400" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Learning C Programming</p>
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
                {Math.round(((user.lessonsCompleted || 0) / 40) * 100)}% Complete
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/settings', { state: { section: 'EDIT_PROFILE' } })}
              className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2 border border-white/5 active:scale-95"
            >
              <Pencil size={12} /> Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* 2. Navigation Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/profile/stats')}
          className="w-full p-6 bg-slate-900 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all active:scale-95"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <Trophy size={24} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">View Learning Profile</h3>
              <p className="text-xs font-medium text-slate-500 group-hover:text-indigo-300/70 transition-colors">
                🔥 You're on a 3-day streak! Keep it up.
              </p>
            </div>
          </div>
          <ChevronRight className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="w-full p-6 bg-slate-900 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-slate-700 hover:bg-slate-800/50 transition-all active:scale-95"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-colors">
              <Settings size={24} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-white">Settings</h3>
              <p className="text-xs font-medium text-slate-500">Account, preferences & app info</p>
            </div>
          </div>
          <ChevronRight className="text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
        </button>
      </div>

    </div>
  );
};

export default Profile;