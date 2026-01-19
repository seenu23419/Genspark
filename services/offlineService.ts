
interface LessonCache {
    id: string;
    content: string; // The full content could be complex, assuming text/json for now
    timestamp: number;
}

const CACHE_KEY_PREFIX = 'genspark_lesson_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export const offlineService = {
    // Save lesson content to local cache
    saveLesson: (lessonId: string, content: any) => {
        try {
            const cacheItem: LessonCache = {
                id: lessonId,
                content: JSON.stringify(content),
                timestamp: Date.now()
            };
            localStorage.setItem(`${CACHE_KEY_PREFIX}${lessonId}`, JSON.stringify(cacheItem));
        } catch (e) {
            console.warn('Failed to cache lesson offline:', e);
        }
    },

    // Retrieve lesson from cache if available
    getLesson: (lessonId: string): any | null => {
        try {
            const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${lessonId}`);
            if (!raw) return null;

            const cacheItem: LessonCache = JSON.parse(raw);
            if (Date.now() - cacheItem.timestamp > CACHE_EXPIRY) {
                localStorage.removeItem(`${CACHE_KEY_PREFIX}${lessonId}`);
                return null;
            }

            return JSON.parse(cacheItem.content);
        } catch (e) {
            return null;
        }
    },

    // Check if network is offline
    isOffline: (): boolean => {
        return !navigator.onLine;
    },

    // Add a listener
    onStatusChange: (callback: (isOnline: boolean) => void) => {
        const setOnline = () => callback(true);
        const setOffline = () => callback(false);

        window.addEventListener('online', setOnline);
        window.addEventListener('offline', setOffline);

        return () => {
            window.removeEventListener('online', setOnline);
            window.removeEventListener('offline', setOffline);
        };
    }
};
