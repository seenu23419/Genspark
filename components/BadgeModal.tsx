import React from 'react';

const BadgeModal: React.FC<{ open: boolean; onClose: () => void; badge: { id: string; title: string; description: string } | null }> = ({ open, onClose, badge }) => {
  if (!open || !badge) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-black text-yellow-300">{badge.title}</h3>
            <p className="text-slate-300 text-sm mt-2">{badge.description}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-300 font-bold">🏅</div>
            <div>
              <p className="text-sm text-slate-300">You've earned this badge for consistent progress.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeModal;
