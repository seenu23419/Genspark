import React, { useState } from 'react';
import BadgeModal from '../../components/BadgeModal';
import { useNavigate } from 'react-router-dom';

const BADGE_INFO: Array<{ id: string; title: string; description: string }> = [
  { id: 'Bronze Coder', title: 'Bronze Coder', description: 'Earned 200 XP from practice challenges.' },
  { id: 'Silver Coder', title: 'Silver Coder', description: 'Earned 500 XP from practice challenges.' },
  { id: 'Gold Coder', title: 'Gold Coder', description: 'Earned 1200 XP from practice challenges.' },
];

const BadgesPage: React.FC = () => {
  const [selected, setSelected] = useState<{ id: string; title: string; description: string } | null>(null);
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto bg-[#000000] min-h-screen">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Badges</h1>
          <p className="text-slate-500 text-sm">Your achievements and earned badges</p>
        </div>
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">Back</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BADGE_INFO.map(b => (
          <div key={b.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer" onClick={() => setSelected(b)}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-300">🏅</div>
              <div>
                <div className="font-bold text-white">{b.title}</div>
                <div className="text-slate-400 text-xs">{b.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BadgeModal open={!!selected} onClose={() => setSelected(null)} badge={selected} />
    </div>
  );
};

export default BadgesPage;
