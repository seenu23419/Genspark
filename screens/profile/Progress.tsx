
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Star, Trophy, Target, BookOpen, ArrowLeft } from 'lucide-react';
import { User } from '../../types';

interface ProgressProps {
  user?: User;
  onBack?: () => void;
}

const Progress: React.FC<ProgressProps> = ({ user: propUser, onBack: propOnBack }) => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const user = propUser || authUser;

  const handleBack = () => {
    if (propOnBack) propOnBack();
    else navigate(-1);
  };

  if (!user) return null;

  const levelProgress = (user.xp % 1000) / 10;
  const currentLevel = Math.floor(user.xp / 1000) + 1;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10">
      <header className="flex items-center gap-4">
        <button onClick={handleBack} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Learning Progress</h1>
          <p className="text-slate-400">You're in the top 5% of learners this month!</p>
        </div>
      </header>

      {/* Main Level Progress */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Current Rank</span>
              <h2 className="text-4xl font-black text-white">Level {currentLevel}</h2>
            </div>
            <div className="text-right">
              <p className="text-slate-400 font-bold">{user.xp} / {(currentLevel * 1000)} XP</p>
            </div>
          </div>

          <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
          <p className="text-center text-slate-500 text-sm font-medium">
            {1000 - (user.xp % 1000)} XP to next level
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-400/10 rounded-2xl flex items-center justify-center text-emerald-400">
            <BookOpen size={32} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-white">{user.lessonsCompleted}</h4>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Lessons Finished</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center gap-6">
          <div className="w-16 h-16 bg-orange-400/10 rounded-2xl flex items-center justify-center text-orange-400">
            <Target size={32} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-white">42</h4>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Challenges Solved</p>
          </div>
        </div>
      </div>

      {/* Skill Map Simulation */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-white">Skill Proficiency</h3>
        <div className="grid grid-cols-1 gap-4">
          {[
            { name: 'JavaScript', val: 85, color: 'bg-yellow-400' },
            { name: 'Python', val: 62, color: 'bg-blue-400' },
            { name: 'DSA', val: 45, color: 'bg-purple-400' },
            { name: 'System Design', val: 28, color: 'bg-pink-400' }
          ].map((skill) => (
            <div key={skill.name} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center font-bold">
                <span className="text-white">{skill.name}</span>
                <span className="text-slate-400">{skill.val}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${skill.color} rounded-full`} style={{ width: `${skill.val}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Progress;
