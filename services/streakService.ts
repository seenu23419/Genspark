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
    /**
     * Helper to get activity log updates for a user.
     * Use this to merge activity tracking into other profile updates.
     */
    static getActivityUpdates(user: User): Partial<User> | null {
        if (!user || !supabaseDB.isStreakEnabled()) return null;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const activityLog = [...(user.activity_log || [])];
        if (!activityLog.includes(dateStr)) {
            activityLog.push(dateStr);
            return {
                activity_log: activityLog.slice(-60),
                lastActiveAt: now.toISOString()
            };
        }

        return null;
    }
}
