import { User } from '../types';
import { supabaseDB } from './supabaseService';

export class StreakService {
    /**
     * Updates the user's streak based on their last active date.
     * This should be called whenever the user performs a meaningful action (e.g., login, lesson completion).
     */
    static async updateStreak(user: User): Promise<User | null> {
        if (!user || !supabaseDB.isStreakEnabled()) return null;

        const now = new Date();
        const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;

        // --- NEW: Recalculate streak from logs for absolute accuracy ---
        const activityLog = [...(user.activity_log || [])];
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Ensure today is in log if updating
        if (!activityLog.includes(todayStr)) {
            activityLog.push(todayStr);
        }

        const currentCalculatedStreak = this.recalculateStreak(activityLog);
        const currentStreakInProfile = user.streak || 0;

        // Normalize dates to midnight for easy comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let shouldUpdate = false;

        // Update if streak number is different from calculation OR lastActive is missing/old
        if (currentStreakInProfile !== currentCalculatedStreak) {
            shouldUpdate = true;
        } else if (!lastActive) {
            shouldUpdate = true;
        } else {
            const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
            if (lastActiveDate.getTime() < today.getTime()) {
                shouldUpdate = true;
            }
        }

        if (shouldUpdate) {
            // Keep only last 60 unique active days
            let finalLog = [...new Set(activityLog)].sort().slice(-60);

            const updates = {
                streak: currentCalculatedStreak,
                lastActiveAt: now.toISOString(),
                activity_log: finalLog
            };

            try {
                console.log(`[StreakService] Syncing streak for ${user._id} to ${currentCalculatedStreak}`);
                const updatedUser = await supabaseDB.updateOne(user._id, updates);
                return updatedUser;
            } catch (error) {
                console.error('[StreakService] Failed to update streak:', error);
                return null;
            }
        }

        return user;
    }

    /**
     * Absolute source of truth for streak calculation
     */
    static recalculateStreak(activityLog: string[]): number {
        if (!activityLog || activityLog.length === 0) return 0;

        // 1. Convert to sorted unique date objects (midnight)
        const sortedDates = [...new Set(activityLog)]
            .map(dateStr => {
                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d).getTime();
            })
            .sort((a, b) => b - a); // Descending (latest first)

        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterdayMidnight = todayMidnight - (24 * 60 * 60 * 1000);

        // 2. Check if streak is broken (haven't been active today OR yesterday)
        const latestActivity = sortedDates[0];
        if (latestActivity < yesterdayMidnight) {
            return 0; // Streak broken
        }

        // 3. Count consecutive days backwards
        let streak = 0;
        let expectedTime = latestActivity;

        for (const date of sortedDates) {
            if (date === expectedTime) {
                streak++;
                expectedTime -= (24 * 60 * 60 * 1000);
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Explicitly record activity for today without necessarily updating the streak increment logic.
     * Useful for non-streak-incrementing actions that still count as "activity".
     */
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

    static getActivityUpdates(user: User, specificActivity?: { type: 'lesson' | 'practice' | 'project' | 'challenge', title: string, xp?: number }): Partial<User> | null {
        if (!user) return null;

        const now = new Date();
        // Use local date for calendar consistency
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
        // Filter to keep only the FIRST occurrence of any (date_string + type + title) combination
        // This cleans up both existing duplicates and prevents new ones
        const uniqueHistory: any[] = [];
        const seen = new Set();

        for (const item of activityHistory) {
            const itemDateStr = new Date(item.date).toDateString(); // "Mon Jan 01 2024"
            const key = `${itemDateStr}|${item.type}|${item.title}`;

            if (!seen.has(key)) {
                seen.add(key);
                uniqueHistory.push(item);
            }
        }

        // Check if deduplication actually removed anything or if we added something new
        if (uniqueHistory.length !== activityHistory.length || hasHistoryUpdates) {
            activityHistory = uniqueHistory;

            if (activityHistory.length > 100) {
                activityHistory = activityHistory.slice(0, 100); // Keep last 100 items
            }

            this.saveHistory(user._id, activityHistory);
            hasHistoryUpdates = true;
        }

        if (hasLogUpdates || hasHistoryUpdates) {
            const updates: Partial<User> = { lastActiveAt: now.toISOString() };
            if (hasLogUpdates) updates.activity_log = activityLog;

            // Always update history if it changed (deduped or new)
            if (hasHistoryUpdates) updates.activity_history = activityHistory;

            return updates;
        }

        return null;
    }
}
