import React, { useState } from 'react';
import { ChevronRight, Code2, BookOpen, Award } from 'lucide-react';

interface LanguageSelectorProps {
  onSelect?: (language: string) => void;
  onContinue?: (language: string) => void;
}

/**
 * ═════════════════════════════════════════════════════════════
 * LANGUAGE SELECTOR - Card-Based SoloLearn Style
 * ═════════════════════════════════════════════════════════════
 * 
 * DESIGN:
 * - Card-based layout with language options
 * - 2-column grid on mobile
 * - Each card shows: Language name, icon, level, select button
 * - Selected language highlighted
 * - Dark theme preserved
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onSelect,
  onContinue
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(
    localStorage.getItem('selected_language') || null
  );

  const languages = [
    {
      id: 'c',
      name: 'C',
      icon: '🔶',
      level: 'Beginner',
      description: 'Learn fundamental programming concepts',
      popular: true
    },
    {
      id: 'cpp',
      name: 'C++',
      icon: '🔶',
      level: 'Beginner',
      description: 'Object-oriented programming basics',
      popular: true
    },
    {
      id: 'java',
      name: 'Java',
      icon: '☕',
      level: 'Intermediate',
      description: 'Enterprise-grade programming',
      popular: true
    },
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      level: 'Beginner',
      description: 'Simple and readable syntax',
      popular: true
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: '📜',
      level: 'Beginner',
      description: 'Web development scripting',
      popular: true
    },
    {
      id: 'sql',
      name: 'SQL',
      icon: '🗄️',
      level: 'Intermediate',
      description: 'Database query language',
      popular: false
    }
  ];

  const handleSelect = (language: string) => {
    setSelectedLanguage(language);
    localStorage.setItem('selected_language', language);
    onSelect?.(language);
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      onContinue?.(selectedLanguage);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#000000]">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-900/20 to-slate-900/20 border-b border-slate-700/50 px-4 py-6 sticky top-0 z-40">
        <h1 className="text-3xl font-black text-indigo-100 mb-2">Choose Your Language</h1>
        <p className="text-slate-400 text-sm">Select a programming language to get started. You can change it anytime.</p>
      </div>

      {/* LANGUAGE GRID */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-6">
          {languages.map(lang => (
            <div
              key={lang.id}
              onClick={() => handleSelect(lang.id)}
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-300 ${selectedLanguage === lang.id
                  ? 'border-indigo-500 bg-indigo-900/20 shadow-lg shadow-indigo-500/20'
                  : 'border-slate-700 bg-slate-900/30 hover:border-indigo-500/50 hover:bg-slate-900/50'
                }`}
            >
              {/* Popular Badge */}
              {lang.popular && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600/30 rounded text-xs text-indigo-300 font-bold">
                    <Award size={12} />
                    Popular
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className="text-4xl mb-3">{lang.icon}</div>

              {/* Language Name */}
              <h3 className="text-lg font-bold text-indigo-100 mb-1">{lang.name}</h3>

              {/* Level Badge */}
              <div className="mb-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${lang.level === 'Beginner'
                      ? 'bg-green-900/30 text-green-300'
                      : 'bg-yellow-900/30 text-yellow-300'
                    }`}
                >
                  {lang.level}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 mb-4">{lang.description}</p>

              {/* Selected Indicator */}
              {selectedLanguage === lang.id && (
                <div className="flex items-center justify-center gap-1 text-indigo-300 font-bold text-sm pt-2 border-t border-indigo-500/30">
                  <Code2 size={14} />
                  Selected
                </div>
              )}
            </div>
          ))}
        </div>

        {/* INFO BOX */}
        <div className="max-w-6xl mx-auto bg-indigo-900/20 border border-indigo-700/30 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <BookOpen size={20} className="text-indigo-300 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-indigo-200 mb-1">Getting Started</h3>
              <p className="text-slate-300 text-sm">
                Choose a language based on your experience level. All problems support multiple languages, so you can switch anytime without losing progress.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER - ACTION BUTTONS */}
      <div className="bg-slate-900/80 border-t border-slate-700/50 px-4 py-4 flex gap-3">
        <button
          disabled={!selectedLanguage}
          onClick={handleContinue}
          className={`flex-1 px-6 py-3 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2 ${selectedLanguage
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
        >
          {selectedLanguage ? 'Continue' : 'Select a Language'}
          {selectedLanguage && <ChevronRight size={20} />}
        </button>
      </div>

      {/* Status Message */}
      {!selectedLanguage && (
        <div className="text-center pb-4 text-slate-500 text-sm">
          Select a language to continue
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
