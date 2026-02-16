import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { practiceService, PracticeContent, PracticeTopic, PracticeProblem } from '../services/practiceService';
import { supabaseDB } from '../services/supabaseService';
import { useAuth } from './AuthContext';

interface PracticeContextType {
    topics: PracticeTopic[];
    progress: Record<string, any>;
    loading: boolean;
    refreshProgress: () => Promise<void>;
    getProblemStatus: (id: string) => 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [content, setContent] = useState<PracticeContent | null>(null);
    const [progress, setProgress] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    // Load Content (JSON)
    useEffect(() => {
        const load = async () => {
            try {
                // Safety timeout for loading state
                const timer = setTimeout(() => setLoading(false), 5000);

                const data = await practiceService.fetchContent();
                clearTimeout(timer);

                setContent(data);
                setLoading(false);
            } catch (err) {
                console.error("Critical: Failed to load practice content:", err);
                setLoading(false);
            }
        };
        load();
    }, []);

    // Load Progress (DB)
    const fetchProgress = useCallback(async () => {
        if (!user) return;
        const data = await supabaseDB.getAllPracticeProgress();
        const mapped: Record<string, any> = {};
        data.forEach(p => {
            mapped[p.challenge_id] = p;
        });
        setProgress(mapped);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchProgress();
            // Background Sync: Push any "demo" progress to real DB
            supabaseDB.syncLocalProgressToDB();
        }
    }, [user]);

    const getProblemStatus = (id: string): 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' => {
        // 1. Check in-memory progress (Synched from DB/Local)
        const p = progress[id];
        if (p) {
            const status = p.status?.toLowerCase();
            if (status === 'completed') return 'COMPLETED';
            if (status === 'attempted' || status === 'in_progress') return 'IN_PROGRESS';
        }

        // 2. Fallback to direct LocalStorage check (for immediate UI updates if sync is pending)
        try {
            const localRaw = localStorage.getItem('practice_progress_local');
            if (localRaw) {
                const localData = JSON.parse(localRaw);
                const lp = localData[id];
                if (lp) {
                    const lStatus = lp.status?.toLowerCase();
                    if (lStatus === 'completed') return 'COMPLETED';
                    if (lStatus === 'attempted' || lStatus === 'in_progress') return 'IN_PROGRESS';
                }
            }
        } catch (e) { /* ignore */ }

        return 'NOT_STARTED';
    };

    const topics = useMemo(() => content ? practiceService.getAllTopics(content) : [], [content]);

    return (
        <PracticeContext.Provider value={{ topics, progress, loading, refreshProgress: fetchProgress, getProblemStatus }}>
            {children}
        </PracticeContext.Provider>
    );
};

export const usePractice = () => {
    const context = useContext(PracticeContext);
    if (!context) throw new Error('usePractice must be used within PracticeProvider');
    return context;
};
