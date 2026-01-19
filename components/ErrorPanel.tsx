import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorPanelProps {
  language: string;
  lineNumber?: number;
  errorMessage: string;
  onDismiss?: () => void;
  isVisible: boolean;
}

/**
 * Error Panel Component
 * Displays compilation/runtime errors in a clear, educational format.
 * 
 * - Shows language name
 * - Shows line number where error occurred
 * - Shows compiler/runtime error message (plain text only)
 * - No code blocks, no copy buttons
 * - Clear, professional design
 */
const ErrorPanel: React.FC<ErrorPanelProps> = ({
  language,
  lineNumber,
  errorMessage,
  onDismiss,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="border-t border-red-500/30 bg-red-500/5 p-4 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-400">
              {language} Error
            </h3>
            {lineNumber && (
              <p className="text-xs text-slate-400">
                Line {lineNumber}
              </p>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-500 hover:text-slate-400 transition-colors flex-shrink-0"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Error Message (Plain Text Only) */}
      <div className="bg-slate-900/50 border border-red-500/20 rounded-lg p-3 sm:p-4">
        <p className="text-sm text-slate-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
          {errorMessage}
        </p>
      </div>

      {/* Educational Note */}
      <p className="text-xs text-slate-400 pl-8">
        Read the error message carefully. It tells you what went wrong and where.
      </p>
    </div>
  );
};

export default ErrorPanel;
