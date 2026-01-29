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
        const currentStreak = user.streak || 0;

        // Normalize dates to midnight for easy comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let newStreak = currentStreak;
        let shouldUpdate = false;

        if (!lastActive) {
            // First time setting a streak
            newStreak = 1;
            shouldUpdate = true;
        } else {
            const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());

            if (lastActiveDate.getTime() === today.getTime()) {
                // Already active today, no change to streak
                shouldUpdate = false;
            } else if (lastActiveDate.getTime() === yesterday.getTime()) {
                // Active yesterday, increment streak
                newStreak = currentStreak + 1;
                shouldUpdate = true;
            } else {
                // Missed a day (or more), reset streak to 1
                newStreak = 1;
                shouldUpdate = true;
            }
        }

        if (shouldUpdate) {
            // Manage activity log (keep last 60 active days)
            const activityLog = [...(user.activity_log || [])];

            // Timezone-safe date string (YYYY-MM-DD)
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            if (!activityLog.includes(dateStr)) {
                activityLog.push(dateStr);
                // Keep only last 60 unique active days
                if (activityLog.length > 60) {
                    activityLog.shift();
                }
            }

            const updates = {
                streak: newStreak,
                lastActiveAt: now.toISOString(),
                activity_log: activityLog
            };

            try {
                console.log(`[StreakService] Updating streak for ${user._id} to ${newStreak} with activity log`);
                const updatedUser = await supabaseDB.updateOne(user._id, updates);
                return updatedUser;
            } catch (error) {
                console.error('[StreakService] Failed to update streak:', error);
                return null;
            }
        }

        // Even if streak doesn't increment (already active today), 
        // we might want to ensure today is in the log just in case
        if (user.activity_log) {
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            if (!user.activity_log.includes(dateStr)) {
                // This shouldn't happen usually but ensures robustness
                const activityLog = [...user.activity_log, dateStr].slice(-60);
                await supabaseDB.updateOne(user._id, { activity_log: activityLog });
            }
        }

        return user;
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
        if (!user) return null; // streakEnabled check moved to internal logic if needed

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

        // 2. Update detailed activity history (LocalStorage)
        // Load latest from storage to ensure we don't overwrite with stale state
        let activityHistory = this.loadHistory(user._id);
        let hasHistoryUpdates = false;

        if (specificActivity) {
            const newItem = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                date: now.toISOString(),
                ...specificActivity
            };
            activityHistory.unshift(newItem); // Add to beginning
            if (activityHistory.length > 100) activityHistory = activityHistory.slice(0, 100); // Keep last 100 items

            this.saveHistory(user._id, activityHistory);
            hasHistoryUpdates = true;
        } else if (user.activity_history && user.activity_history.length > activityHistory.length) {
            // Edge case: State has more items than storage? (Unlikely but safe sync)
            // this.saveHistory(user._id, user.activity_history);
        }

        if (hasLogUpdates || hasHistoryUpdates) {
            const updates: Partial<User> = { lastActiveAt: now.toISOString() };
            if (hasLogUpdates) updates.activity_log = activityLog;
            // We return activity_history so the context updates the UI state immediately
            if (hasHistoryUpdates || specificActivity) updates.activity_history = activityHistory;

            return updates;
        }

        return null;
    }
}
