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

        // 2. Network Fetch (Modular)
        return this.revalidate();
    }

    private async revalidate(): Promise<PracticeContent> {
        try {
            // 1. Fetch the list of topics
            const topicsUrl = `${BASE_URL}/practice/topics.json?v=${Date.now()}`;
            const topicsRes = await fetch(topicsUrl, { cache: 'no-store' });
            if (!topicsRes.ok) throw new Error('Failed to fetch topics list');
            const coreTopics = await topicsRes.json();

            // 2. Fetch each topic's detailed problems in parallel
            const topicPromises = coreTopics.map(async (topic: any) => {
                try {
                    const topicUrl = `${BASE_URL}/practice/topic_${topic.id}.json?v=${Date.now()}`;
                    const res = await fetch(topicUrl, { cache: 'no-store' });
                    if (!res.ok) return topic; // Fallback to shallow topic
                    return await res.json();
                } catch (e) {
                    console.error(`Failed to load topic: ${topic.id}`, e);
                    return topic;
                }
            });

            const fullTopics = await Promise.all(topicPromises);

            const content: PracticeContent = {
                version: Date.now().toString(),
                topics: fullTopics
            };

            this.cache = content;
            return content;
        } catch (error) {
            console.error("Critical: Practice content fetch failed", error);
            if (this.cache) return this.cache;
            return { topics: [] };
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
