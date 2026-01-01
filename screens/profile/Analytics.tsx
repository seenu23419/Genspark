
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { ArrowLeft, Zap, Target, TrendingUp } from 'lucide-react';

const data = [
  { name: 'Mon', time: 45, xp: 120, accuracy: 85 },
  { name: 'Tue', time: 30, xp: 90, accuracy: 78 },
  { name: 'Wed', time: 60, xp: 200, accuracy: 92 },
  { name: 'Thu', time: 40, xp: 150, accuracy: 88 },
  { name: 'Fri', time: 55, xp: 180, accuracy: 95 },
  { name: 'Sat', time: 90, xp: 400, accuracy: 90 },
  { name: 'Sun', time: 70, xp: 320, accuracy: 82 },
];

interface AnalyticsProps {
  onBack?: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ onBack: propOnBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (propOnBack) propOnBack();
    else navigate(-1);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10 pb-24">
      <header className="flex items-center gap-4">
        <button onClick={handleBack} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Learning Analytics</h1>
          <p className="text-slate-500 font-medium">Track your performance over time</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly XP Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="text-indigo-400" size={18} />
              Weekly Activity
            </h3>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded-lg">Last 7 Days</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} dy={10} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                />
                <Bar dataKey="xp" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Spent Area Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={18} />
              Time Spent Coding
            </h3>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded-lg">Avg: 52m/day</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} dy={10} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="time" stroke="#10b981" fillOpacity={1} fill="url(#colorTime)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="text-red-400" size={18} />
              Quiz Accuracy %
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Increasing Trend
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} dy={10} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5, strokeWidth: 0 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
