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
    const data = React.useMemo(() => {
        return {
            ...STATIC_CURRICULUM,
            ...remoteData
        };
    }, [remoteData]);

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
        for (const langId in data) {
            const langModules = data[langId];
            const allLessons = langModules.flatMap(m => m.lessons);
            const lessonIndex = allLessons.findIndex(l => l.id === lessonId);

            if (lessonIndex !== -1) {
                const lesson = allLessons[lessonIndex];
                const nextLesson = allLessons[lessonIndex + 1] || null;
                return { lesson, langId, nextLessonId: nextLesson?.id || null };
            }
        }
        return { lesson: null, langId: null, nextLessonId: null };
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

export const useCurriculum = () => {
    const context = useContext(CurriculumContext);
    if (context === undefined) {
        throw new Error('useCurriculum must be used within a CurriculumProvider');
    }
    return context;
};
