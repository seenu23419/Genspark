import React, { createContext, useContext, useState, useEffect } from 'react';
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
    const fetchProgress = async () => {
        if (!user) return;
        const data = await supabaseDB.getAllPracticeProgress();
        const mapped: Record<string, any> = {};
        data.forEach(p => {
            mapped[p.challenge_id] = p;
        });
        setProgress(mapped);
        setLoading(false);
    };

    useEffect(() => {
        if (user) {
            fetchProgress();
            // Background Sync: Push any "demo" progress to real DB
            supabaseDB.syncLocalProgressToDB();
        }
    }, [user]);

    const getProblemStatus = (id: string) => {
        const p = progress[id];
        if (p?.status === 'completed') return 'COMPLETED';
        if (p?.status === 'attempted') return 'IN_PROGRESS';
        return 'NOT_STARTED';
    };

    const topics = content ? practiceService.getAllTopics(content) : [];

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
