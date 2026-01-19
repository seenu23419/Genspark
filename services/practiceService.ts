export interface TestCase {
    stdin: string;
    expected_output: string;
}

export interface PracticeProblem {
    id: string;
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    concept: string;
    description: string;
    starter_codes: Record<string, string>;
    test_cases: TestCase[];
    inputFormat?: string;
    outputFormat?: string;
    sampleInput?: string;
    sampleOutput?: string;
    initialCode?: string;
    language?: string;
    hint?: string;
    estimatedTime?: number;
    commonMistake?: string;
    relatedLesson?: string;
    explanation?: string;
}

export interface PracticeTopic {
    id: string;
    title: string;
    problems: PracticeProblem[];
}

export interface PracticeContent {
    version?: string;
    topics: PracticeTopic[];
    problems?: PracticeProblem[]; // Optional flat list if needed
}

const BASE_URL = import.meta.env.VITE_PRACTICE_BASE_URL || '';
const STORAGE_KEY = 'genspark_practice_cache';

class PracticeService {
    private cache: PracticeContent | null = null;

    async fetchContent(): Promise<PracticeContent> {
        // 1. Try Memory Cache
        if (this.cache) return this.cache;

        // 2. Try LocalStorage Cache
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                this.cache = JSON.parse(saved);
                // Background revalidate
                this.revalidate();
                return this.cache!;
            } catch (e) {
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        // 3. Network Fetch
        return this.revalidate();
    }

    private async revalidate(): Promise<PracticeContent> {
        try {
            const url = `${BASE_URL}/practice_content.json?v=${Date.now() + 1}`; // Force New Version
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) throw new Error('Fetch failed');

            const data = await response.json();
            this.cache = data;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return data;
        } catch (error) {
            // Fallback to local if network fails and no cache exists
            if (!this.cache) {
                // In a real app, you might have a local copy bundled
                console.warn("Using empty fallback. Network and cache failed.");
                return { version: '0', topics: [], problems: [] };
            }
            return this.cache;
        }
    }

    getAllTopics(content: PracticeContent): PracticeTopic[] {
        // If topics already have problems (legacy structure), return as is
        if (content.topics.some(t => t.problems && t.problems.length > 0)) {
            return content.topics;
        }

        // If generic structure (flat lists), hydrate topics
        const allProblems = content.problems || [];
        return content.topics.map(topic => ({
            ...topic,
            problems: allProblems.filter((p: any) => p.topicId === topic.id)
        }));
    }

    getProblemById(content: PracticeContent, problemId: string): PracticeProblem | null {
        const topics = this.getAllTopics(content);
        for (const topic of topics) {
            const problem = topic.problems.find(p => p.id === problemId);
            if (problem) return problem;
        }
        return null;
    }
}

export const practiceService = new PracticeService();
