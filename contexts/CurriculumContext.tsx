import React, { createContext, useContext, useState, useCallback } from 'react';
import { LessonModule } from '../types';
import { curriculumService } from '../services/curriculumService';
import { CURRICULUM as STATIC_CURRICULUM } from '../constants';

interface CurriculumState {
    data: Record<string, LessonModule[]>;
    loading: Record<string, boolean>;
    error: Record<string, string | null>;
}

interface CurriculumContextType extends CurriculumState {
    fetchLanguageCurriculum: (langId: string) => Promise<void>;
    getLesson: (lessonId: string) => any;
}

export const CurriculumContext = createContext<CurriculumContextType | undefined>(undefined);

export const CurriculumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [remoteData, setRemoteData] = useState<Record<string, LessonModule[]>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<Record<string, string | null>>({});

    // Merge static curriculum with remote overrides
    // We add STATIC_CURRICULUM to dependencies so that local JSON file edits
    // (which update STATIC_CURRICULUM via HMR) are reflected in the app instantly.
    const data = React.useMemo(() => {
        console.log('[CurriculumContext] Recalculating data...', {
            staticKeys: Object.keys(STATIC_CURRICULUM),
            remoteKeys: Object.keys(remoteData)
        });
        return {
            ...STATIC_CURRICULUM,
            ...remoteData
        };
    }, [remoteData, STATIC_CURRICULUM]);

    React.useEffect(() => {
        console.log('[CurriculumContext] STATIC_CURRICULUM HMR Update detected');
    }, [STATIC_CURRICULUM]);

    const fetchLanguageCurriculum = useCallback(async (langId: string) => {
        setLoading(prev => ({ ...prev, [langId]: true }));
        setError(prev => ({ ...prev, [langId]: null }));

        try {
            const fetchedData = await curriculumService.fetchCurriculum(langId);
            if (fetchedData && fetchedData.length > 0) {
                setRemoteData(prev => ({ ...prev, [langId]: fetchedData }));
            }
            setLoading(prev => ({ ...prev, [langId]: false }));
        } catch (err: any) {
            setLoading(prev => ({ ...prev, [langId]: false }));
            setError(prev => ({ ...prev, [langId]: err.message || 'Failed to load curriculum' }));
        }
    }, []);

    const getLesson = useCallback((lessonId: string) => {
        const currentData = data;
        for (const langId in currentData) {
            for (const module of currentData[langId]) {
                const found = module.lessons.find(l => l.id === lessonId);
                if (found) return { lesson: found, langId };
            }
        }
        return { lesson: null, langId: null };
    }, [data]);

    return (
        <CurriculumContext.Provider value={{
            data,
            loading,
            error,
            fetchLanguageCurriculum,
            getLesson
        }}>
            {children}
        </CurriculumContext.Provider>
    );
};

