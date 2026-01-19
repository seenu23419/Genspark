import { LessonModule } from '../types';

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
            const baseUrl = import.meta.env.VITE_CURRICULUM_BASE_URL;

            // If no remote source is provided, or we're in dev with no specific overrides, 
            // return empty array to use the statically bundled JSON data.
            if (!explicitUrl && !baseUrl) {
                console.log(`[Curriculum] No remote URL provided for ${langId}, using bundled data.`);
                return [];
            }

            const url = explicitUrl || `${baseUrl}/${langId}.json`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch curriculum for ${langId}: ${response.statusText}`);
            }

            const data = await response.json();

            // Adaptation layer if the remote JSON structure differs from our internal types
            // The user requested: topic, lesson id, title, theory, syntax, code block, expected output, difficulty level
            // We'll map these fields to our LessonModule and Lesson interfaces.

            return this.mapResponseToCurriculum(data);
        } catch (error) {
            console.error('Curriculum Fetch Error:', error);
            throw error;
        }
    },

    /**
     * Maps/Adapts remote JSON data to internal LessonModule interface.
     */
    mapResponseToCurriculum(data: any): LessonModule[] {
        // If it's already an array of modules (as in our local files), return it
        if (Array.isArray(data)) {
            return data;
        }

        // Example of mapping if the structure is different
        // This allows the user to have a slightly different format on the server
        if (data.modules && Array.isArray(data.modules)) {
            return data.modules;
        }

        return [];
    }
};
