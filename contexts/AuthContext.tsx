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
    updateProfile: (updates: Partial<User>, specificActivity?: {
        type: 'lesson' | 'practice' | 'project' | 'challenge',
        title: string,
        xp?: number,
        score?: number,
        timeSpent?: number,
        language?: string,
        executionTime?: string,
        itemId?: string
    }) => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
    loadActivityHistory: () => Promise<void>;
    setInitializing: (val: boolean) => void;
    minSplashDone: boolean;
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
        userId: user?._id || null,
        firstName: user?.firstName || null,
        lastName: user?.lastName || null,
        onboardingCompleted: user?.onboardingCompleted,
        lessonsCompleted: user?.completedLessonIds?.length,
        completedLessonIds: user?.completedLessonIds || [],
        unlockedLessonIds: user?.unlockedLessonIds || ['c1']
    });

    // Safety Ref to avoid stale closures in timeouts
    const initializingRef = useRef(initializing);
    useEffect(() => {
        initializingRef.current = initializing;
    }, [initializing]);

    const loading = initializing; // Route guards depend only on data initialization

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
    }, []);

    const loadActivityHistory = useCallback(async () => {
        const currentUserId = userStateRef.current.userId;
        if (!currentUserId || !user) return;

        // Skip if already loaded
        if (user.activity_history && user.activity_history.length > 0) return;

        console.log("AuthContext: Lazy-loading activity history for", currentUserId);
        try {
            const data = await supabaseDB.fetchFields(currentUserId, ['activity_log', 'activity_history']);
            if (data && (data.activity_log || data.activity_history)) {
                setUser(prev => prev ? ({
                    ...prev,
                    activity_log: data.activity_log || prev.activity_log || [],
                    activity_history: data.activity_history || prev.activity_history || []
                }) : null);
                console.log("AuthContext: Activity history loaded successfully");
            }
        } catch (error) {
            console.error("AuthContext: loadActivityHistory error", error);
        }
    }, [user]);

    useEffect(() => {
        let mounted = true;

        // 1. Min Splash Timer (Drastically reduced for instant feel if data is ready)
        const splashTimer = setTimeout(() => {
            if (mounted) setMinSplashDone(true);
        }, 2000); // 2s duration for a premium "logo page" experience

        // 2. Initial Session Check - Faster lookup
        const initSession = async () => {
            try {
                // Check if we HAVE a user in local state already (restored from backup)
                if (user && mounted) {
                    console.log("AuthContext: Retaining backup user for fast start.");
                    setInitializing(false);
                    // No need to return; we still want to start the listener for sync
                }

                const { data: { session } } = await supabaseDB.supabase.auth.getSession();
                if (mounted && !session?.user) {
                    setInitializing(false);
                }
            } catch (error) {
                console.error("AuthContext: Init error:", error);
                if (mounted) setInitializing(false);
            }
        };

        // Run immediately
        initSession();

        // 3. Safety Timeout (Fallback)
        const safetyTimer = setTimeout(() => {
            if (mounted && initializingRef.current) {
                console.warn("AuthContext: Session check EXCEEDED safety limit, forcing entry.");
                setInitializing(false);
            }
        }, 1500); // 1.5s instead of 3s for a "permanent" fix to long waits

        // 3. Listen for Auth Changes with State Guard
        const unsubscribe = authService.onAuthStateChange(async (updatedUser) => {
            if (!mounted) return;

            const currentState = userStateRef.current;

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

            const mergedUser = updatedUser ? {
                ...updatedUser,
                onboardingCompleted: currentState.onboardingCompleted || updatedUser.onboardingCompleted,
                firstName: updatedUser.firstName || currentState.firstName,
                lastName: updatedUser.lastName || currentState.lastName,
                completedLessonIds: [...new Set([...(currentState.completedLessonIds || []), ...(updatedUser.completedLessonIds || [])])],
                unlockedLessonIds: [...new Set([...(currentState.unlockedLessonIds || []), ...(updatedUser.unlockedLessonIds || [])])]
            } : null;

            const hasChanged =
                currentState.userId !== newState.userId ||
                (newState.firstName && currentState.firstName !== newState.firstName) ||
                (newState.onboardingCompleted !== undefined && currentState.onboardingCompleted !== newState.onboardingCompleted) ||
                (mergedUser && currentState.completedLessonIds.length < mergedUser.completedLessonIds.length) ||
                JSON.stringify(currentState.completedLessonIds) !== JSON.stringify(newState.completedLessonIds);

            if (hasChanged) {
                console.log("✅ AuthContext: Applying state update (with merge if applicable)");

                if (mergedUser) {
                    const finalUser = {
                        ...mergedUser,
                        completedLessonIds: [...new Set([...currentState.completedLessonIds, ...(mergedUser.completedLessonIds || [])])],
                        unlockedLessonIds: [...new Set([...currentState.unlockedLessonIds, ...(mergedUser.unlockedLessonIds || [])])]
                    };

                    userStateRef.current = {
                        userId: finalUser._id,
                        firstName: finalUser.firstName,
                        lastName: finalUser.lastName,
                        onboardingCompleted: finalUser.onboardingCompleted,
                        lessonsCompleted: finalUser.completedLessonIds.length,
                        completedLessonIds: finalUser.completedLessonIds || [],
                        unlockedLessonIds: finalUser.unlockedLessonIds || ['c1']
                    };
                    setUser(finalUser as User);
                } else {
                    userStateRef.current = newState;
                    setUser(null);
                }

                setInitializing(false);
            } else {
                setInitializing(false);
            }
        });

        return () => {
            mounted = false;
            if (typeof unsubscribe === 'function') unsubscribe();
            clearTimeout(splashTimer);
            clearTimeout(safetyTimer);
        };
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem('genspark_user_backup', JSON.stringify(user));
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
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Logout timed out')), 2000));
                await Promise.race([authService.signOut(), timeout]);
            } catch (error) {
                console.warn("AuthContext: Sign out error/timeout:", error);
            } finally {
                localStorage.clear();
                localStorage.removeItem('genspark_user_backup');
                sessionStorage.clear();
                setUser(null);
                setInitializing(false);
                console.log("AuthContext: State cleared, forcing redirect.");
                window.location.href = '/login';
            }
        },
        refreshProfile,
        loadActivityHistory,
        updateProfile: useCallback(async (updates: Partial<User>, specificActivity?: {
            type: 'lesson' | 'practice' | 'project' | 'challenge',
            title: string,
            xp?: number,
            score?: number,
            timeSpent?: number,
            language?: string,
            executionTime?: string,
            itemId?: string
        }) => {
            if (!userStateRef.current.userId) return;

            let baseUser: User | null = null;
            setUser(prev => {
                baseUser = prev;
                return prev;
            });

            if (!baseUser) return;

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
                const updated = await supabaseDB.updateOne(baseUser._id, mergedUpdates);
                const finalUser = {
                    ...updated,
                    completedLessonIds: [...new Set([...newCompleted, ...(updated.completedLessonIds || [])])],
                    unlockedLessonIds: [...new Set([...newUnlocked, ...(updated.unlockedLessonIds || [])])]
                };

                userStateRef.current = {
                    userId: finalUser._id,
                    firstName: finalUser.firstName,
                    lastName: finalUser.lastName,
                    onboardingCompleted: finalUser.onboardingCompleted,
                    lessonsCompleted: finalUser.completedLessonIds.length,
                    completedLessonIds: finalUser.completedLessonIds || [],
                    unlockedLessonIds: finalUser.unlockedLessonIds || ['c1']
                };
                setUser(finalUser);
            } catch (error: unknown) {
                console.error("Profile update failed, checking for partial success...", error);
                try {
                    const fresh = await supabaseDB.findOne({ _id: baseUser._id });
                    if (fresh) {
                        setUser(fresh);
                        return;
                    }
                } catch (e) {
                    console.error("Recovery fetch failed", e);
                }
                setUser(previousUser);
                throw error;
            }
        }, [user]),
        updateUser: (updates: Partial<User>) => Promise.resolve(), // Placeholder
        setInitializing,
        minSplashDone
    };

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
