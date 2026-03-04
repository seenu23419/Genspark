import { LessonModule } from '../types';
import { CURRICULUM as LOCAL_CURRICULUM } from '../constants';

const BASE_URL = import.meta.env.VITE_CURRICULUM_BASE_URL;

export interface CurriculumData {
    modules: LessonModule[];
    lastUpdated: string;
}

/**
 * Service to handle curriculum data fetching from remote sources.
 */
export const curriculumService = {
    /**
     * Fetches the curriculum for a specific language.
     * @param langId The language ID (e.g., 'c', 'java', 'python')
     */
    async fetchCurriculum(langId: string): Promise<LessonModule[]> {
        try {
            // Check for explicit URL first
            const envKey = `VITE_CURRICULUM_${langId.toUpperCase()}_URL`;
            const explicitUrl = import.meta.env[envKey];
            const baseUrl = import.meta.env.VITE_CURRICULUM_BASE_URL || BASE_URL;

            // If no remote source is provided at all, use bundled data.
            if (!explicitUrl && !baseUrl) {
                console.log(`[Curriculum] No remote source found for ${langId}, using bundled data.`);
                return [];
            }

            const url = explicitUrl || `${baseUrl}/${langId}.json`;

            // Check if we should prefer local data for this language
            const preferLocalKey = `VITE_CURRICULUM_${langId.toUpperCase()}_PREFER_LOCAL`;
            const preferLocal = import.meta.env[preferLocalKey] === 'true';

            if (preferLocal) {
                console.log(`[Curriculum] Prefer local data enabled for ${langId}, skipping remote fetch.`);
                return [];
            }

            const response = await fetch(url);

            if (!response.ok) {
                console.warn(`[Curriculum] Failed to fetch remote curriculum for ${langId}, falling back to local.`);
                return [];
            }

            const data = await response.json();
            const remoteModules = this.mapResponseToCurriculum(data, langId);

            // Safety check: Don't override if remote data is significantly smaller than local data
            const localModules = (LOCAL_CURRICULUM as any)[langId] || [];
            if (remoteModules.length === 0 && localModules.length > 0) {
                console.warn(`[Curriculum] Remote data for ${langId} is empty, using local data.`);
                return [];
            }

            // Optional: More aggressive check could compare lesson counts
            const remoteLessonCount = remoteModules.reduce((acc, m) => acc + m.lessons.length, 0);
            const localLessonCount = localModules.reduce((acc, m: any) => acc + m.lessons.length, 0);

            if (remoteLessonCount < localLessonCount * 0.5) { // If remote is less than 50% of local
                console.warn(`[Curriculum] Remote data for ${langId} seems incomplete (${remoteLessonCount} vs ${localLessonCount} lessons). Ignoring remote.`);
                return [];
            }

            return remoteModules;
        } catch (error) {
            console.error('Curriculum Fetch Error (falling back to local):', error);
            return []; // Return empty so context uses local data
        }
    },

    /**
     * Maps/Adapts remote JSON data to internal LessonModule interface.
     * Merges in local quizzes if remote ones are missing.
     */
    mapResponseToCurriculum(data: any, langId?: string): LessonModule[] {
        let modules: LessonModule[] = [];

        // Determine modules from data
        if (Array.isArray(data)) {
            modules = data;
        } else if (data.modules && Array.isArray(data.modules)) {
            modules = data.modules;
        }

        // Enhancement: Merge local quizzes if remote ones are missing or sparse
        if (langId && modules.length > 0) {
            const localModules = (LOCAL_CURRICULUM as any)[langId] || [];
            modules.forEach(m => {
                m.lessons.forEach(l => {
                    // Find local version of this lesson
                    const localLesson = localModules
                        .flatMap((lm: any) => lm.lessons)
                        .find((ll: any) => ll.id === l.id);

                    // If remote lesson has no quiz (or just 1) and local has more, preferred local
                    if (localLesson && localLesson.quizQuestions && localLesson.quizQuestions.length > 0) {
                        const remoteQCount = l.quizQuestions ? l.quizQuestions.length : 0;
                        const localQCount = localLesson.quizQuestions.length;

                        if (remoteQCount < localQCount) {
                            console.log(`[Curriculum] Merging local quizzes for lesson ${l.id} (${l.title})`);
                            l.quizQuestions = localLesson.quizQuestions;
                        }
                    }
                });
            });
        }

        return modules;
    }
};
