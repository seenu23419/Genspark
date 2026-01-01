
import React, { useState } from 'react';
import { Search, Filter, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LANGUAGES } from '../../constants';
import { Language } from '../../types';

interface ExploreProps {
  onSelectLanguage?: (lang: Language) => void;
  onBack?: () => void;
}

const Explore: React.FC<ExploreProps> = ({ onSelectLanguage, onBack: propOnBack }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLanguage = (lang: Language) => {
    if (onSelectLanguage) {
      onSelectLanguage(lang);
    } else {
      navigate(`/lessons/${lang.id}`);
    }
  };

  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 pb-24">
      <header className="flex flex-col md:flex-row md:items-center gap-6">
        <button
          onClick={handleBack}
          className="self-start p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500/50 rounded-2xl transition-all flex items-center gap-2 group shadow-xl"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest pr-2">Back to Dashboard</span>
        </button>

        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Explore Path</h1>
          <p className="text-slate-500 font-medium">Select a language to start your journey</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search language or framework..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white transition-all shadow-lg"
          />
        </div>
        <button className="px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
          <Filter size={20} />
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLanguages.map((lang) => (
          <div
            key={lang.id}
            onClick={() => handleSelectLanguage(lang)}
            className="group bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all cursor-pointer flex flex-col shadow-lg"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center p-3">
                <img
                  src={lang.icon}
                  alt={lang.name}
                  className="w-full h-full object-contain filter group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all"
                />
              </div>
              <div className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                {lang.level}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{lang.name}</h3>
            <p className="text-slate-500 text-sm mb-6 flex-grow">
              {lang.stats}
            </p>

            <button className="flex items-center gap-2 text-indigo-400 font-bold text-sm group-hover:gap-3 transition-all">
              View Curriculum <ChevronRight size={16} />
            </button>
          </div>
        ))}

        {filteredLanguages.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-400">No results found</h3>
            <p className="text-slate-600">Try searching for something else</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
