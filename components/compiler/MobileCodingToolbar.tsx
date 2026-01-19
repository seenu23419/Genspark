import React from 'react';

interface MobileCodingToolbarProps {
    onInsert: (text: string) => void;
    onTab: () => void;
    visible: boolean;
}

const SYMBOLS = ['{', '}', '(', ')', '[', ']', ';', '=', '=>', 'console.log'];

const MobileCodingToolbar: React.FC<MobileCodingToolbarProps> = ({ onInsert, onTab, visible }) => {
    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 flex gap-2 overflow-x-auto no-scrollbar z-50 pb-safe md:hidden">
            <button
                onMouseDown={(e) => { e.preventDefault(); onTab(); }}
                className="px-4 py-3 bg-slate-800 text-indigo-400 rounded-lg font-mono text-sm font-bold active:bg-slate-700 shrink-0 shadow-lg"
            >
                TAB
            </button>
            {SYMBOLS.map((char) => (
                <button
                    key={char}
                    onMouseDown={(e) => { e.preventDefault(); onInsert(char); }}
                    className="px-4 py-3 bg-slate-800 text-slate-200 rounded-lg font-mono text-sm font-bold active:bg-slate-700 shrink-0 shadow-lg"
                >
                    {char}
                </button>
            ))}
        </div>
    );
};

export default MobileCodingToolbar;
