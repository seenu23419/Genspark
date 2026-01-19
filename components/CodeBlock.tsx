import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'python',
  title,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting for Python
  const highlightCode = (code: string, lang: string) => {
    if (lang === 'python') {
      const pythonKeywords = [
        'def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else',
        'for', 'while', 'break', 'continue', 'try', 'except', 'finally',
        'with', 'as', 'pass', 'raise', 'lambda', 'yield', 'assert',
        'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is'
      ];

      const builtins = [
        'print', 'input', 'len', 'range', 'enumerate', 'zip', 'map',
        'filter', 'sum', 'min', 'max', 'sorted', 'list', 'dict', 'set',
        'str', 'int', 'float', 'bool', 'type', 'isinstance', 'open'
      ];

      let highlighted = code;

      // Highlight keywords
      pythonKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        highlighted = highlighted.replace(
          regex,
          `<span class="text-pink-400 font-semibold">${keyword}</span>`
        );
      });

      // Highlight builtins
      builtins.forEach(builtin => {
        const regex = new RegExp(`\\b${builtin}\\b`, 'g');
        highlighted = highlighted.replace(
          regex,
          `<span class="text-blue-400 font-semibold">${builtin}</span>`
        );
      });

      // Highlight strings (simple approach)
      highlighted = highlighted.replace(
        /(['"])([^'"]*)\1/g,
        '<span class="text-green-400">"$2"</span>'
      );

      // Highlight comments
      highlighted = highlighted.replace(
        /#.*/g,
        (match) => `<span class="text-gray-500">${match}</span>`
      );

      // Highlight numbers
      highlighted = highlighted.replace(
        /\b(\d+\.?\d*)\b/g,
        '<span class="text-amber-400">$1</span>'
      );

      return highlighted;
    }

    return code;
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-slate-600/50">
      {/* Header */}
      {title && (
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-3 border-b border-slate-600/50">
          <h4 className="text-sm font-bold text-slate-200">{title}</h4>
        </div>
      )}

      {/* Code Block */}
      <div className="relative bg-slate-950 overflow-x-auto">
        <button
          onClick={copyToClipboard}
          className="absolute top-4 right-4 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition text-sm font-semibold text-slate-200 z-10"
        >
          {copied ? (
            <>
              <Check size={16} /> Copied
            </>
          ) : (
            <>
              <Copy size={16} /> Copy
            </>
          )}
        </button>

        <pre className="p-6 pr-20 text-sm font-mono leading-relaxed text-slate-200">
          <code
            dangerouslySetInnerHTML={{
              __html: highlightCode(code, language),
            }}
          />
        </pre>
      </div>

      {/* Language Badge */}
      <div className="bg-slate-900 px-6 py-2 border-t border-slate-600/50">
        <span className="text-xs font-semibold text-slate-400 uppercase">
          {language}
        </span>
      </div>
    </div>
  );
};

interface CodeExampleProps {
  examples: Array<{
    title: string;
    code: string;
    explanation: string;
  }>;
}

export const CodeExamples: React.FC<CodeExampleProps> = ({ examples }) => {
  const [activeExample, setActiveExample] = useState(0);

  return (
    <div className="my-8">
      <div className="flex gap-2 mb-6 flex-wrap">
        {examples.map((example, idx) => (
          <button
            key={idx}
            onClick={() => setActiveExample(idx)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeExample === idx
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            {example.title}
          </button>
        ))}
      </div>

      <CodeBlock
        code={examples[activeExample].code}
        language="python"
        title={examples[activeExample].title}
      />

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-600/50 rounded-xl p-6 mt-4">
        <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
          <span className="text-lg">💡</span>
          Explanation
        </h4>
        <p className="text-slate-300 leading-relaxed">
          {examples[activeExample].explanation}
        </p>
      </div>
    </div>
  );
};
