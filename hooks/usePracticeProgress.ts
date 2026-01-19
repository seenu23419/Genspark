
import { useState, useEffect } from 'react';
import { supabaseDB } from '../services/supabaseService';

export type ProgressState = {
    solved: Record<string, { solvedAt: number; attempts: number; lastAccepted?: boolean }>;
};

export const usePracticeProgress = () => {
    const [progress, setProgress] = useState<ProgressState>(() => {
        try {
            const raw = localStorage.getItem('practice_progress');
            if (raw) return JSON.parse(raw);
        } catch (e) { }
        return { solved: {} } as ProgressState;
    });

    const [history, setHistory] = useState<any[]>(() => {
        try { return JSON.parse(localStorage.getItem('practice_history') || '[]'); } catch (e) { return []; }
    });

    useEffect(() => {
        try { localStorage.setItem('practice_progress', JSON.stringify(progress)); } catch (e) { }
    }, [progress]);

    useEffect(() => {
        try { localStorage.setItem('practice_history', JSON.stringify(history)); } catch (e) { }
    }, [history]);

    const markProblemSolved = (problemId: string, accepted: boolean, stats?: { time?: string; memory?: string }) => {
        const now = Date.now();

        // Update history
        const entry = {
            at: now,
            problemId,
            accepted,
            time: stats?.time,
            memory: stats?.memory,
        };
        setHistory(prev => [...prev, entry]);

        // Update progress
        setProgress(prev => {
            const prevSolved = prev.solved[problemId] || { solvedAt: 0, attempts: 0 };
            const attempts = prevSolved.attempts + 1;
            // Only update solvedAt if it's a new success or it wasn't solved before
            const wasAccepted = accepted === true;

            return {
                ...prev,
                solved: {
                    ...prev.solved,
                    [problemId]: {
                        ...prevSolved,
                        attempts,
                        solvedAt: wasAccepted ? now : prevSolved.solvedAt,
                        lastAccepted: wasAccepted || prevSolved.lastAccepted
                    }
                }
            };
        });
    };

    return {
        progress,
        history,
        markProblemSolved
    };
};
