import React from 'react';
import { Play, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NextUpPreviewProps {
    lessonId: string;
    title: string;
    duration: string;
}

const NextUpPreview: React.FC<NextUpPreviewProps> = ({
    lessonId,
    title,
    duration
}) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/lesson/${lessonId}`)}
            className="group flex items-center justify-between p-4 md:p-5 bg-slate-900/10 border border-slate-800/30 rounded-2xl hover:bg-slate-900/20 hover:border-slate-700/40 transition-all cursor-pointer"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-600 group-hover:bg-indigo-500/15 group-hover:text-indigo-400 transition-colors flex-shrink-0">
                    <Play size={14} fill="currentColor" />
                </div>
                <div className="min-w-0">
                    <h5 className="text-sm font-bold text-slate-300 truncate group-hover:text-slate-200 transition-colors">{title}</h5>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
                <div className="flex items-center gap-1 text-slate-600 text-xs font-medium group-hover:text-slate-500 transition-colors">
                    <Clock size={12} />
                    <span>{duration}</span>
                </div>
            </div>
        </div>
    );
};

export default NextUpPreview;
