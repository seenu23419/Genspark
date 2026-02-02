import { LessonModule } from '../types';
import { CURRICULUM as LOCAL_CURRICULUM } from '../constants';

const BASE_URL = import.meta.env.VITE_CURRICULUM_BASE_URL || 'https://aoiagnnkhaswpmhbobhd.supabase.co/storage/v1/object/public/curriculum';

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
                throw new Error(`Failed to fetch curriculum for ${langId}: ${response.statusText}`);
            }

            const data = await response.json();

            // Adaptation layer if the remote JSON structure differs from our internal types
            // The user requested: topic, lesson id, title, theory, syntax, code block, expected output, difficulty level
            // We'll map these fields to our LessonModule and Lesson interfaces.

            return this.mapResponseToCurriculum(data, langId);
        } catch (error) {
            console.error('Curriculum Fetch Error:', error);
            throw error;
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
