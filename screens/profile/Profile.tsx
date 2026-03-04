import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Github,
  Linkedin,
  Globe,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Trophy,
  Activity,
  Award,
  ShieldCheck,
  Pencil,
  FileText,
  Plus,
  X,
  Camera,
  Search,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePractice } from '../../contexts/PracticeContext';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { progress } = usePractice();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const solvedProblemsCount = useMemo(() => {
    return Object.values(progress || {}).filter((p: any) => p.status?.toLowerCase() === 'completed').length;
  }, [progress]);

  // Edit States
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  useEffect(() => {
    if (user) {
      setEditValues({
        name: user.name || '',
        username: user.username || user.email?.split('@')[0] || '',
        bio: user.bio || '',
        location: user.location || '',
        education: user.education || '',
        experience: user.experience || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        website: user.website || '',
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async (field: string) => {
    try {
      await updateUser({ [field]: editValues[field] });
      setEditingField(null);
    } catch (err) {
      console.error(`Failed to update ${field}`, err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };


  const SidebarItem = ({ icon: Icon, label, value, field, placeholder }: any) => (
    <div className="space-y-1 group/item">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Icon size={12} className="text-blue-500" />
          {label}
        </label>
        {editingField !== field && (
          <button
            onClick={() => setEditingField(field)}
            className="text-slate-400 hover:text-blue-500 transition-all"
          >
            <Pencil size={10} />
          </button>
        )}
      </div>
      {editingField === field ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={editValues[field]}
            onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
            onBlur={() => handleSave(field)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave(field)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-blue-500/30 rounded px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none"
            placeholder={placeholder}
          />
        </div>
      ) : (
        <p className={`text-xs font-bold leading-tight ${value ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 italic font-medium'}`}>
          {value || `No ${label.toLowerCase()} added`}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-500/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-10 pb-24 transition-colors duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* SIDEBAR: 4 columns */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="card-base p-8 text-center lg:text-left space-y-6 relative overflow-hidden">
              {/* Profile Pic */}
              <div className="relative inline-block mx-auto lg:mx-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl p-1 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-center relative -rotate-3 hover:rotate-0 transition-transform duration-500">
                    {user.avatar ? (
                      <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center hover:bg-blue-500 transition-colors"
                >
                  <Camera size={12} className="text-white" />
                </button>
              </div>

              {/* Name & ID */}
              <div className="space-y-1 group/name-section">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  {editingField === 'name' ? (
                    <input
                      autoFocus
                      type="text"
                      value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      onBlur={() => handleSave('name')}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave('name')}
                      className="text-center lg:text-left text-2xl font-black tracking-tight text-slate-900 dark:text-white bg-transparent border-b border-blue-500 outline-none w-full"
                    />
                  ) : (
                    <>
                      <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {user.name}
                      </h1>
                      <button
                        onClick={() => setEditingField('name')}
                        className="text-slate-400 hover:text-blue-500 transition-all"
                      >
                        <Pencil size={12} />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-2">
                  {editingField === 'username' ? (
                    <div className="flex items-center text-blue-500 font-bold text-xs">
                      <span>@</span>
                      <input
                        autoFocus
                        type="text"
                        value={editValues.username}
                        onChange={(e) => setEditValues({ ...editValues, username: e.target.value })}
                        onBlur={() => handleSave('username')}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave('username')}
                        className="bg-transparent border-b border-blue-500 outline-none w-full ml-0.5"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-blue-500 font-bold text-xs">@{user.username || user.email?.split('@')[0]}</p>
                      <button
                        onClick={() => setEditingField('username')}
                        className="text-slate-400 hover:text-blue-500 transition-all"
                      >
                        <Pencil size={10} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Socials */}
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => {
                    const url = prompt("Enter your GitHub URL:", user.github || "");
                    if (url !== null) updateUser({ github: url });
                  }}
                  className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center transition-all ${user.github ? 'text-blue-500 border-blue-500/30' : 'text-slate-400 hover:text-blue-500 hover:border-blue-500/30'}`}
                  title={user.github ? "Navigate to GitHub" : "Add GitHub Profile"}
                >
                  <Github size={18} />
                </button>
                <button
                  onClick={() => {
                    const url = prompt("Enter your LinkedIn URL:", user.linkedin || "");
                    if (url !== null) updateUser({ linkedin: url });
                  }}
                  className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center transition-all ${user.linkedin ? 'text-blue-500 border-blue-500/30' : 'text-slate-400 hover:text-blue-500 hover:border-blue-500/30'}`}
                  title={user.linkedin ? "Navigate to LinkedIn" : "Add LinkedIn Profile"}
                >
                  <Linkedin size={18} />
                </button>
                <button
                  onClick={() => {
                    const url = prompt("Enter your Website URL:", user.website || "");
                    if (url !== null) updateUser({ website: url });
                  }}
                  className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center transition-all ${user.website ? 'text-blue-500 border-blue-500/30' : 'text-slate-400 hover:text-blue-500 hover:border-blue-500/30'}`}
                  title={user.website ? "Navigate to Website" : "Add Website"}
                >
                  <Globe size={18} />
                </button>

                {(user.github || user.linkedin || user.website) && (
                  <div className="flex gap-2 ml-auto">
                    {user.github && <a href={user.github.startsWith('http') ? user.github : `https://${user.github}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500"><ExternalLink size={14} /></a>}
                    {user.linkedin && <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500"><ExternalLink size={14} /></a>}
                    {user.website && <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500"><ExternalLink size={14} /></a>}
                  </div>
                )}
              </div>

              {/* Sidebar Stats */}
              <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-6">
                <SidebarItem icon={MapPin} label="Location" value={user.location} field="location" placeholder="e.g. San Francisco" />
                <SidebarItem icon={Briefcase} label="Experience" value={user.experience} field="experience" placeholder="e.g. Software Engineer at Google" />
                <SidebarItem icon={GraduationCap} label="Education" value={user.education} field="education" placeholder="e.g. Stanford University" />

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} className="text-blue-500" />
                    Joined
                  </label>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Member since 2024'}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT: 8 columns */}
          <main className="lg:col-span-8 space-y-8">

            {/* Top Row: Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-base p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Activity size={20} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity Streak</p>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{user.streak || 0}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Days of continuous learning</p>
              </div>
              <div className="card-base p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Trophy size={20} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Points</p>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{user.xp || 0}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Total points earned</p>
              </div>
              <div className="card-base p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Problems Solved</p>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{solvedProblemsCount}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Challenges successfully verified</p>
              </div>
            </div>


            {/* About Me / Bio */}
            <section className="card-base p-8 group/bio-section">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" />
                  About
                </h3>
                {editingField !== 'bio' && (
                  <button
                    onClick={() => setEditingField('bio')}
                    className="text-slate-400 hover:text-blue-500 transition-all"
                  >
                    <Pencil size={12} />
                  </button>
                )}
              </div>
              {editingField === 'bio' ? (
                <textarea
                  autoFocus
                  value={editValues.bio}
                  onChange={(e) => setEditValues({ ...editValues, bio: e.target.value })}
                  onBlur={() => handleSave('bio')}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-blue-500/30 rounded-xl p-4 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none h-32 no-scrollbar"
                  placeholder="Write your professional bio..."
                />
              ) : (
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  {user.bio || "Write a short bio about your professional interests and goals."}
                </p>
              )}
            </section>

            {/* Skills Management */}
            <section className="card-base p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Award size={16} className="text-blue-500" />
                  Verified Skills
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {(user.skills && user.skills.length > 0) ? (
                  user.skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full group hover:border-blue-500/30 transition-all">
                      <ShieldCheck className="text-blue-500" size={14} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{skill}</span>
                      <button
                        onClick={() => {
                          const newSkills = user.skills?.filter((_, i) => i !== idx);
                          updateUser({ skills: newSkills });
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                ) : null}

                {/* Add Skill Option */}
                <button
                  onClick={() => {
                    const skill = prompt("Enter a new skill:");
                    if (skill && skill.trim()) {
                      updateUser({ skills: [...(user.skills || []), skill.trim()] });
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 dark:border-white/20 rounded-full text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all group"
                >
                  <Plus size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Add Skill</span>
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
