import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { supabaseDB } from '../services/supabaseService';
import { StreakService } from '../services/streakService';

// Redefine essential fields for internal ref tracking to avoid import conflicts and missing fields
interface AuthUser {
    _id: string;
    firstName?: string;
    lastName?: string;
    onboardingCompleted?: boolean;
    lessonsCompleted?: number;
    completedLessonIds?: string[];
    unlockedLessonIds?: string[];
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    initializing: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithGithub: () => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateProfile: (updates: Partial<User>, specificActivity?: { type: 'lesson' | 'practice' | 'project' | 'challenge', title: string, xp?: number }) => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
    setInitializing: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        // Redundant Backup: Load immediately from localStorage to prevent flash
        if (typeof localStorage !== 'undefined') {
            try {
                const backup = localStorage.getItem('genspark_user_backup');
                return backup ? JSON.parse(backup) : null;
            } catch (e) { return null; }
        }
        return null;
    });
    const [initializing, setInitializing] = useState(!user);
    const [minSplashDone, setMinSplashDone] = useState(false);

    // State guard: Track the ACTUAL values we care about, not object references
    const userStateRef = useRef<{
        userId: string | null;
        firstName: string | null | undefined;
        lastName: string | null | undefined;
        onboardingCompleted: boolean | undefined;
        lessonsCompleted: number | undefined;
        completedLessonIds: string[];
        unlockedLessonIds: string[];
    }>({
        userId: null,
        firstName: null,
        lastName: null,
        onboardingCompleted: undefined,
        lessonsCompleted: undefined,
        completedLessonIds: [],
        unlockedLessonIds: ['c1']
    });

    const loading = initializing || !minSplashDone;

    const refreshProfile = useCallback(async () => {
        const currentUserId = userStateRef.current.userId;
        if (!currentUserId) return;

        try {
            const fresh = await supabaseDB.findOne({ _id: currentUserId });
            if (fresh) {
                const currentState = userStateRef.current;
                const freshCompleted = fresh.completedLessonIds || [];
                const freshUnlocked = fresh.unlockedLessonIds || ['c1'];

                const hasChanged =
                    currentState.userId !== fresh._id ||
                    currentState.firstName !== fresh.firstName ||
                    currentState.onboardingCompleted !== fresh.onboardingCompleted ||
                    currentState.lessonsCompleted !== fresh.lessonsCompleted ||
                    JSON.stringify(currentState.completedLessonIds) !== JSON.stringify(freshCompleted) ||
                    JSON.stringify(currentState.unlockedLessonIds) !== JSON.stringify(freshUnlocked);

                if (hasChanged) {
                    console.log("AuthContext: refreshProfile - state changed", fresh._id);
                    userStateRef.current = {
                        userId: fresh._id,
                        firstName: fresh.firstName,
                        lastName: fresh.lastName,
                        onboardingCompleted: fresh.onboardingCompleted,
                        lessonsCompleted: fresh.lessonsCompleted,
                        completedLessonIds: freshCompleted,
                        unlockedLessonIds: freshUnlocked
                    };
                    setUser(fresh);
                } else {
                    console.log("AuthContext: refreshProfile - no changes, skipping update");
                }
            }
        } catch (error) {
            console.error("AuthContext: refreshProfile error", error);
        }
    }, []); // No dependencies - uses ref instead

    useEffect(() => {
        let mounted = true;

        // 1. Min Splash Timer (Reduced to 1s for better UX)
        const splashTimer = setTimeout(() => {
            if (mounted) setMinSplashDone(true);
        }, 1000);

        // 2. Initial Session Check
        const initSession = async () => {
            console.log("AuthContext: Initializing session");

            try {
                const currentUser = await authService.getCurrentUser();
                if (mounted) {
                    if (currentUser) {
                        userStateRef.current = {
                            userId: currentUser._id,
                            firstName: currentUser.firstName,
                            lastName: currentUser.lastName,
                            onboardingCompleted: currentUser.onboardingCompleted,
                            lessonsCompleted: currentUser.lessonsCompleted,
                            completedLessonIds: currentUser.completedLessonIds || [],
                            unlockedLessonIds: currentUser.unlockedLessonIds || ['c1']
                        };
                        console.log("AuthContext: Initial user loaded", userStateRef.current);
                    }
                    setUser(currentUser);
                    setInitializing(false);

                    // --- NEW: Trigger streak update on initialization for accuracy ---
                    if (currentUser) {
                        StreakService.updateStreak(currentUser).then(updated => {
                            if (updated && mounted) setUser(updated);
                        });
                    }
                }
            } catch (error) {
                console.error("AuthContext: Init error:", error);
                if (mounted) setInitializing(false);
            }
        };

        // Delay initial check slightly to let splash animation run
        // This reduces race conditions with fast loads
        const initTimer = setTimeout(initSession, 100);

        // 3. Safety Timeout (Fallback)
        // If Supabase fails to respond within 5 seconds, force entry to the app.
        const safetyTimer = setTimeout(() => {
            if (mounted && initializing) {
                console.warn("AuthContext: Session check timed out, forcing entry.");
                setInitializing(false);
            }
        }, 5000);

        // 3. Listen for Auth Changes with State Guard
        const unsubscribe = authService.onAuthStateChange(async (updatedUser) => {
            if (!mounted) return;

            const currentState = userStateRef.current;

            // Fetch fresh profile data to ensure we have the absolute latest if possible
            // However, we apply a local "most-progressive" merge strategy below.
            const newState = updatedUser ? {
                userId: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                onboardingCompleted: updatedUser.onboardingCompleted,
                lessonsCompleted: updatedUser.lessonsCompleted,
                completedLessonIds: updatedUser.completedLessonIds || [],
                unlockedLessonIds: updatedUser.unlockedLessonIds || ['c1']
            } : {
                userId: null,
                firstName: null,
                lastName: null,
                onboardingCompleted: undefined,
                lessonsCompleted: undefined,
                completedLessonIds: [],
                unlockedLessonIds: ['c1']
            };

            // MERGE STRATEGY: Do not let server-side staleness (delay in reflecting updates)
            // revert critical local progress like onboarding completion.
            const mergedUser = updatedUser ? {
                ...updatedUser,
                onboardingCompleted: currentState.onboardingCompleted || updatedUser.onboardingCompleted,
                firstName: updatedUser.firstName || currentState.firstName,
                lastName: updatedUser.lastName || currentState.lastName,
            } : null;

            // **THE CRITICAL CHECK**: Only update if actual data changed
            const hasChanged =
                currentState.userId !== newState.userId ||
                (newState.firstName && currentState.firstName !== newState.firstName) ||
                (newState.onboardingCompleted !== undefined && currentState.onboardingCompleted !== newState.onboardingCompleted) ||
                JSON.stringify(currentState.completedLessonIds) !== JSON.stringify(newState.completedLessonIds);

            console.log("AuthContext: Auth change detected", {
                userId: newState.userId,
                serverOnboarding: newState.onboardingCompleted,
                localOnboarding: currentState.onboardingCompleted,
                hasChanged
            });

            if (hasChanged) {
                console.log("✅ AuthContext: Applying state update (with merge if applicable)");

                if (mergedUser) {
                    userStateRef.current = {
                        userId: mergedUser._id,
                        firstName: mergedUser.firstName,
                        lastName: mergedUser.lastName, // Added missing lastName
                        onboardingCompleted: mergedUser.onboardingCompleted,
                        lessonsCompleted: mergedUser.lessonsCompleted,
                        completedLessonIds: mergedUser.completedLessonIds || [],
                        unlockedLessonIds: mergedUser.unlockedLessonIds || ['c1']
                    };
                    setUser(mergedUser as User);
                } else {
                    userStateRef.current = newState;
                    setUser(null);
                }

                setInitializing(false);
            } else if (initializing) {
                setInitializing(false);
            }
        });

        return () => {
            mounted = false;
            if (typeof unsubscribe === 'function') unsubscribe();
            clearTimeout(splashTimer);
        };
    }, []);

    // 4. Persistence Effect: Save user to localStorage to avoid refresh-flashes
    useEffect(() => {
        if (user) {
            localStorage.setItem('genspark_user_backup', JSON.stringify(user));
            // Flag that this user has successfully authenticated at least once
            localStorage.setItem('genspark_returning_user', 'true');
        } else if (!loading) {
            localStorage.removeItem('genspark_user_backup');
        }
    }, [user, loading]);


    const value = {
        user,
        loading,
        initializing,
        signInWithGoogle: authService.signInWithGoogle.bind(authService),
        signInWithGithub: authService.signInWithGithub.bind(authService),
        logout: async () => {
            console.log("AuthContext: Starting logout...");
            try {
                // 1. Attempt server-side logout, but don't wait forever (max 2s)
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Logout timed out')), 2000));
                await Promise.race([authService.signOut(), timeout]);
            } catch (error) {
                console.warn("AuthContext: Sign out error/timeout:", error);
            } finally {
                // 2. ALWAYS clear local state and force redirect
                localStorage.clear();
                localStorage.removeItem('genspark_user_backup'); // Explicitly remove backup
                sessionStorage.clear();
                setUser(null);
                setInitializing(false);
                console.log("AuthContext: State cleared, forcing redirect.");
                window.location.href = '/login';
            }
        },
        refreshProfile,
        updateProfile: useCallback(async (updates: Partial<User>, specificActivity?: { type: 'lesson' | 'practice' | 'project' | 'challenge', title: string, xp?: number }) => {
            if (!userStateRef.current.userId) return;

            // 1. Get latest state for merging
            let baseUser: User | null = null;
            setUser(prev => {
                baseUser = prev;
                return prev;
            });

            if (!baseUser) return;

            // 2. High-integrity Merge (Using latest state)
            const currentCompleted = baseUser.completedLessonIds || [];
            const newCompleted = updates.completedLessonIds
                ? [...new Set([...currentCompleted, ...updates.completedLessonIds])]
                : currentCompleted;

            const currentUnlocked = baseUser.unlockedLessonIds || ['c1'];
            const newUnlocked = updates.unlockedLessonIds
                ? [...new Set([...currentUnlocked, ...updates.unlockedLessonIds])]
                : currentUnlocked;

            const activityUpdates = StreakService.getActivityUpdates(baseUser, specificActivity);
            const mergedUpdates = {
                ...updates,
                ...(activityUpdates || {}),
                completedLessonIds: newCompleted,
                unlockedLessonIds: newUnlocked
            };

            const previousUser = baseUser;
            const optimisticUser = {
                ...baseUser,
                ...mergedUpdates,
                lessonsCompleted: newCompleted.length
            };

            if (updates.firstName || updates.lastName) {
                const first = updates.firstName || baseUser.firstName || '';
                const last = updates.lastName || baseUser.lastName || '';
                optimisticUser.name = `${first} ${last}`.trim() || baseUser.name;
                optimisticUser.firstName = first;
                optimisticUser.lastName = last;
            }

            // 3. Update memory ref and optimistic UI
            userStateRef.current = {
                userId: optimisticUser._id,
                firstName: optimisticUser.firstName,
                lastName: optimisticUser.lastName,
                onboardingCompleted: optimisticUser.onboardingCompleted,
                lessonsCompleted: optimisticUser.lessonsCompleted,
                completedLessonIds: newCompleted,
                unlockedLessonIds: newUnlocked
            };

            setUser(optimisticUser as User);

            try {
                // 4. Persist to DB
                console.log("📦 [AuthContext] Starting DB update for", baseUser._id, mergedUpdates);
                console.log("📦 [AuthContext] Optimistic state BEFORE DB call:", {
                    onboardingCompleted: optimisticUser.onboardingCompleted,
                    firstName: optimisticUser.firstName,
                    lastName: optimisticUser.lastName
                });

                const updated = await supabaseDB.updateOne(baseUser._id, mergedUpdates);

                console.log("✅ [AuthContext] DB update SUCCESS. Returned data:", {
                    userId: updated._id,
                    onboardingCompleted: updated.onboardingCompleted,
                    firstName: updated.firstName,
                    lastName: updated.lastName
                });

                // 5. Final sync with DB result
                userStateRef.current = {
                    userId: updated._id,
                    firstName: updated.firstName,
                    lastName: updated.lastName,
                    onboardingCompleted: updated.onboardingCompleted,
                    lessonsCompleted: updated.lessonsCompleted,
                    completedLessonIds: updated.completedLessonIds || [],
                    unlockedLessonIds: updated.unlockedLessonIds || ['c1']
                };
                setUser(updated);
            } catch (error: any) {
                console.error("Profile update failed, checking for partial success...", error);

                // CRITICAL SAFETY: Repopulate from server to see if user_progress table actually updated
                // even if the users table (cache) failed.
                try {
                    const fresh = await supabaseDB.findOne({ _id: baseUser._id });
                    if (fresh) {
                        setUser(fresh);
                        return;
                    }
                } catch (e) {
                    console.error("Recovery fetch failed", e);
                }

                // Only revert if we truly failed everything and the user doesn't already have the data
                setUser(previousUser);
                throw error;
            }
        }, [user]),
        updateUser: (updates: Partial<User>) => Promise.resolve(), // Placeholder
        setInitializing
    };

    // Alias updateUser to updateProfile
    value.updateUser = value.updateProfile;

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
