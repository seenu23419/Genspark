import { User } from '../types';


export class StreakService {
    /**
     * Calculates the user's streak based on strict rules:
     * 1. Consecutive calendar days.
     * 2. Missed day resets to 0.
     * 3. Multiple completions = 1 day.
     * 4. Timezone respected (uses local time of the environment).
     */
    static calculateStreak(activityLog: string[]): {
        currentStreak: number;
        longestStreak: number;
        lastActiveDate: string | null;
        isStreakAliveToday: boolean;
        isActiveToday: boolean;
    } {
        if (!activityLog || activityLog.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: null,
                isStreakAliveToday: false,
                isActiveToday: false
            };
        }

        // 1. Sort and Deduplicate Dates (Timezone: Local 00:00:00)
        // We assume activityLog contains 'YYYY-MM-DD' strings which are timezone agnostic dates
        // OR ISO strings. We will normalize to 'YYYY-MM-DD' to represent "calendar days".
        const sortedUniqueDays = [...new Set(activityLog.map(date => {
            const d = new Date(date);
            // Ensure we are working with local calendar dates for the user
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }))].sort((a, b) => b.localeCompare(a)); // Descending: Newest first

        if (sortedUniqueDays.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: null,
                isStreakAliveToday: false,
                isActiveToday: false
            };
        }

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

        const latestActivityStr = sortedUniqueDays[0];
        const lastActiveDate = latestActivityStr;
        const isActiveToday = latestActivityStr === todayStr;

        // 2. Calculate Current Streak
        let currentStreak = 0;

        // If the last active day was neither today nor yesterday, the streak is broken (0).
        // Unless we are just calculating "what the streak WOULD be if they continued", 
        // strictly speaking, if they missed yesterday and haven't done today, it's 0.
        // If they did yesterday, it's alive.

        // Check if streak is broken
        // A streak is broken if the latest activity is before yesterday.
        if (latestActivityStr < yesterdayStr) {
            currentStreak = 0;
        } else {
            // Count backwards from the latest consecutive block
            let expectedDate = new Date(latestActivityStr);
            let streakCount = 0;

            for (const dateStr of sortedUniqueDays) {
                const current = new Date(dateStr);
                // Reset time components for accurate comparison
                current.setHours(0, 0, 0, 0);
                const expected = new Date(expectedDate);
                expected.setHours(0, 0, 0, 0);

                if (current.getTime() === expected.getTime()) {
                    streakCount++;
                    expectedDate.setDate(expectedDate.getDate() - 1); // Move back one day
                } else {
                    break; // Gap found
                }
            }
            currentStreak = streakCount;
        }

        // 3. Calculate Longest Streak
        let longestStreak = 0;
        let tempStreak = 0;
        let prevDate: number | null = null;

        // Iterate oldest to newest for longest streak calc convenience, or just handle logic carefully.
        // Let's use the sorted (descending) array.
        for (const dateStr of sortedUniqueDays) {
            const currentDate = new Date(dateStr).getTime();

            if (prevDate === null) {
                tempStreak = 1;
            } else {
                const diffTime = Math.abs(prevDate - currentDate);
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
            prevDate = currentDate;
        }
        longestStreak = Math.max(longestStreak, tempStreak);


        // 4. Streak Alive Status
        // Is the streak "alive"? 
        // It is alive if they have been active today OR yesterday.
        // If they were active yesterday, the streak is "at risk" but alive (they can extend it today).
        // If they were active today, it is extended and safe.
        const isStreakAliveToday = latestActivityStr === todayStr || latestActivityStr === yesterdayStr;

        return {
            currentStreak,
            longestStreak,
            lastActiveDate,
            isStreakAliveToday,
            isActiveToday
        };
    }

    /**
     * Checks if the user's streak needs to be updated based on their activity log.
     * Returns the updates if necessary, or null if the streak is already correct.
     * Use this to sync streak state without direct DB coupling.
     */
    static getStreakMismatch(user: User, isStreakEnabled: boolean = true): Partial<User> | null {
        if (!user || !isStreakEnabled) return null;

        const activityLog = [...(user.activity_log || [])];
        const stats = this.calculateStreak(activityLog);

        // Update if streak number is different from calculation
        if (user.streak !== stats.currentStreak) {
            console.log(`[StreakService] Streak mismatch detected for ${user._id}: ${user.streak} -> ${stats.currentStreak}`);
            return {
                streak: stats.currentStreak
            };
        }

        return null;
    }

    // --- Persistence Helper for Detailed History (LocalStorage) ---
    private static getHistoryKey(userId: string): string {
        return `activity_history_${userId}`;
    }

    static loadHistory(userId: string): any[] {
        if (typeof localStorage === 'undefined') return [];
        try {
            const raw = localStorage.getItem(this.getHistoryKey(userId));
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Failed to load history", e);
            return [];
        }
    }

    private static saveHistory(userId: string, history: any[]) {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem(this.getHistoryKey(userId), JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history", e);
        }
    }

    static getActivityUpdates(user: User, specificActivity?: {
        type: 'lesson' | 'practice' | 'project' | 'challenge',
        title: string,
        xp?: number,
        executionTime?: string,
        language?: string,
        itemId?: string,
        score?: number,
        timeSpent?: number
    }): Partial<User> | null {
        if (!user) return null;

        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const activityLog = [...(user.activity_log || [])];
        let hasLogUpdates = false;

        // 1. Update basic activity log (dates only) - This goes to DB
        if (!activityLog.includes(dateStr)) {
            activityLog.push(dateStr);
            if (activityLog.length > 60) activityLog.shift(); // Keep last 60 days
            hasLogUpdates = true;
        }

        // 2. Update detailed activity history (LocalStorage + DB fallback)
        let activityHistory = this.loadHistory(user._id);

        // Merge from user profile if local storage is empty but profile has history (migration/sync)
        if (activityHistory.length === 0 && user.activity_history && user.activity_history.length > 0) {
            activityHistory = [...user.activity_history];
        }

        let hasHistoryUpdates = false;

        if (specificActivity) {
            const newItem = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                date: now.toISOString(),
                ...specificActivity
            };

            // Add new item to the front
            activityHistory.unshift(newItem);
            hasHistoryUpdates = true;
        }

        // --- ROBUST DEDUPLICATION ---
        const uniqueHistory: any[] = [];
        const seen = new Set();

        for (const item of activityHistory) {
            // Handle potentially missing date fields if legacy data
            const itemDateStr = item.date ? new Date(item.date).toDateString() : 'Unknown Date';
            const key = `${itemDateStr}|${item.type}|${item.title}`;

            if (!seen.has(key)) {
                seen.add(key);
                uniqueHistory.push(item);
            }
        }

        if (uniqueHistory.length !== activityHistory.length || hasHistoryUpdates) {
            activityHistory = uniqueHistory;
            if (activityHistory.length > 100) activityHistory = activityHistory.slice(0, 100);
            this.saveHistory(user._id, activityHistory);
            hasHistoryUpdates = true;
        }

        // Calculate new streak based on the updated log
        const stats = this.calculateStreak(activityLog);

        if (hasLogUpdates || hasHistoryUpdates || user.streak !== stats.currentStreak) {
            const updates: Partial<User> = {
                lastActiveAt: now.toISOString(),
                streak: stats.currentStreak // update streak immediately
            };

            if (hasLogUpdates) updates.activity_log = activityLog;
            if (hasHistoryUpdates) updates.activity_history = activityHistory;

            return updates;
        }

        return null;
    }
}
