import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { supabaseDB } from '../services/supabaseService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithGithub: () => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>; // Alias for backwards compatibility
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
    const [initializing, setInitializing] = useState(!user); // If we have backup, we are not "initializing" in UI terms
    const [minSplashDone, setMinSplashDone] = useState(false);

    // State guard: Track the ACTUAL values we care about, not object references
    const userStateRef = useRef<{
        userId: string | null;
        firstName: string | null | undefined;
        onboardingCompleted: boolean | undefined;
        lessonsCompleted: number | undefined;
    }>({
        userId: null,
        firstName: null,
        onboardingCompleted: undefined,
        lessonsCompleted: undefined
    });

    const loading = initializing || !minSplashDone;

    const refreshProfile = async () => {
        if (!user) return;
        try {
            const fresh = await supabaseDB.findOne({ _id: user._id });
            if (fresh) {
                // Use the same state guard for manual refreshes
                const currentState = userStateRef.current;
                const hasChanged =
                    currentState.userId !== fresh._id ||
                    currentState.firstName !== fresh.firstName ||
                    currentState.onboardingCompleted !== fresh.onboardingCompleted ||
                    currentState.lessonsCompleted !== fresh.lessonsCompleted;

                if (hasChanged) {
                    console.log("AuthContext: refreshProfile - state changed", {
                        old: currentState,
                        new: {
                            userId: fresh._id,
                            firstName: fresh.firstName,
                            onboardingCompleted: fresh.onboardingCompleted,
                            lessonsCompleted: fresh.lessonsCompleted
                        },
                        completedLessons: fresh.completedLessonIds
                    });
                    userStateRef.current = {
                        userId: fresh._id,
                        firstName: fresh.firstName,
                        onboardingCompleted: fresh.onboardingCompleted,
                        lessonsCompleted: fresh.lessonsCompleted
                    };
                    setUser(fresh);
                } else {
                    console.log("AuthContext: refreshProfile - no state change, but refreshing anyway for completion sync", fresh.completedLessonIds);
                    // Even if state guard says no change, we update user to refresh completedLessonIds
                    setUser(fresh);
                }
            }
        } catch (error) {
            console.error("AuthContext: refreshProfile error", error);
        }
    };

    useEffect(() => {
        let mounted = true;

        // 1. Min Splash Timer
        setTimeout(() => {
            if (mounted) setMinSplashDone(true);
        }, 600);

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
                            onboardingCompleted: currentUser.onboardingCompleted,
                            lessonsCompleted: currentUser.lessonsCompleted
                        };
                        console.log("AuthContext: Initial user loaded", userStateRef.current);
                    }
                    setUser(currentUser);
                    setInitializing(false);
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
        // If Supabase fails to respond within 5 seconds (common on spotty mobile LANs), 
        // force entry to the app (will load as logged out).
        const safetyTimer = setTimeout(() => {
            if (mounted && initializing) {
                console.warn("AuthContext: Session check timed out, forcing entry.");
                setInitializing(false);
            }
        }, 5000);

        // 3. Listen for Auth Changes with State Guard
        const unsubscribe = authService.onAuthStateChange((updatedUser) => {
            if (!mounted) return;

            const currentState = userStateRef.current;
            const newState = updatedUser ? {
                userId: updatedUser._id,
                firstName: updatedUser.firstName,
                onboardingCompleted: updatedUser.onboardingCompleted,
                lessonsCompleted: updatedUser.lessonsCompleted
            } : {
                userId: null,
                firstName: null,
                onboardingCompleted: undefined,
                lessonsCompleted: undefined
            };

            // **THE CRITICAL CHECK**: Only update if actual data changed
            const hasChanged =
                currentState.userId !== newState.userId ||
                currentState.firstName !== newState.firstName ||
                currentState.onboardingCompleted !== newState.onboardingCompleted;

            console.log("AuthContext: Auth state change", {
                hasChanged,
                currentState,
                newState,
                event: updatedUser ? 'user_update' : 'logout'
            });

            if (hasChanged) {
                console.log("✅ AuthContext: State CHANGED - updating user");
                userStateRef.current = newState;

                // Smart merge for optimistic updates
                setUser(prev => {
                    if (prev?.firstName && !updatedUser?.firstName && prev?._id === updatedUser?._id) {
                        console.log("AuthContext: Preserving optimistic firstName");
                        return {
                            ...updatedUser,
                            firstName: prev.firstName,
                            lastName: prev.lastName,
                            name: prev.name,
                            onboardingCompleted: true
                        } as User;
                    }
                    return updatedUser;
                });
                setInitializing(false);
            } else {
                console.log("⏭️ AuthContext: State UNCHANGED - skipping setUser (prevents re-render)");

                // If we are in an OAuth flow (detectable via URL), don't stop initializing on a null state yet.
                // This prevents flickering the login screen while Supabase processes the redirect params.
                const hasAuthParams =
                    window.location.hash.includes('access_token') ||
                    window.location.hash.includes('code') ||
                    window.location.search.includes('code') ||
                    window.location.search.includes('state');

                if (initializing) {
                    if (!hasAuthParams || updatedUser) {
                        setInitializing(false);
                    } else {
                        console.log("🔐 AuthContext: OAuth tokens detected, keeping loading state active...");
                        // Safety fallback: if nothing happens, the 5s safetyTimer already in place will rescue us.
                    }
                }
            }
        });

        return () => {
            mounted = false;
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, []);

    // 4. Persistence Effect: Save user to localStorage to avoid refresh-flashes
    useEffect(() => {
        if (user) {
            localStorage.setItem('genspark_user_backup', JSON.stringify(user));
        } else if (!loading) {
            localStorage.removeItem('genspark_user_backup');
        }
    }, [user, loading]);

    const value = {
        user,
        loading,
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
        updateProfile: async (updates: Partial<User>) => {
            if (!user) return;

            // 1. Optimistic Update (Instant Feedback)
            const previousUser = user;
            const optimisticUser = { ...user, ...updates };
            // Ensure derived fields are updated
            if (updates.firstName || updates.lastName) {
                const first = updates.firstName || user.firstName || '';
                const last = updates.lastName || user.lastName || '';
                optimisticUser.name = `${first} ${last}`.trim() || user.name;
                optimisticUser.firstName = first; // Explicitly set to ensure
            }

            // Ensure we keep complex objects if not updated
            if (!updates.completedLessonIds) optimisticUser.completedLessonIds = user.completedLessonIds;
            if (!updates.unlockedLessonIds) optimisticUser.unlockedLessonIds = user.unlockedLessonIds;

            // **CRITICAL**: Update state guard ref for optimistic update
            userStateRef.current = {
                userId: optimisticUser._id,
                firstName: optimisticUser.firstName,
                onboardingCompleted: optimisticUser.onboardingCompleted,
                lessonsCompleted: optimisticUser.lessonsCompleted
            };
            console.log("AuthContext: Optimistic update", userStateRef.current);

            setUser(optimisticUser as User);

            // 2. Await Sync to ensure consistency
            try {
                const updated = await supabaseDB.updateOne(user._id, updates);

                // Update state guard with server response
                userStateRef.current = {
                    userId: updated._id,
                    firstName: updated.firstName,
                    onboardingCompleted: updated.onboardingCompleted,
                    lessonsCompleted: updated.lessonsCompleted
                };
                console.log("AuthContext: Server update confirmed", userStateRef.current);

                setUser(updated);
            } catch (error: any) {
                console.error("Profile update failed, reverting...", error);

                // If user record doesn't exist, try to create it first
                if (error.message?.includes('not found') || error.code === 'PGRST116' || error.details?.includes('0 rows')) {
                    console.log("User record not found, creating it...");
                    try {
                        const newUser = await supabaseDB.insertOne({
                            _id: user._id,
                            email: user.email,
                            name: user.name || 'User',
                            ...updates
                        });

                        // Update state guard with created user
                        userStateRef.current = {
                            userId: newUser._id,
                            firstName: newUser.firstName,
                            onboardingCompleted: newUser.onboardingCompleted,
                            lessonsCompleted: newUser.lessonsCompleted
                        };

                        setUser(newUser);
                        return; // Success!
                    } catch (insertError) {
                        console.error("Failed to create user record:", insertError);

                        // Revert state guard
                        userStateRef.current = {
                            userId: previousUser._id,
                            firstName: previousUser.firstName,
                            onboardingCompleted: previousUser.onboardingCompleted,
                            lessonsCompleted: previousUser.lessonsCompleted
                        };

                        setUser(previousUser);
                        throw new Error("Failed to save profile. Please check your database connection.");
                    }
                }

                // Revert state guard on error
                userStateRef.current = {
                    userId: previousUser._id,
                    firstName: previousUser.firstName,
                    onboardingCompleted: previousUser.onboardingCompleted,
                    lessonsCompleted: previousUser.lessonsCompleted
                };

                setUser(previousUser);
                throw error; // Re-throw so UI knows it failed
            }
        },
        updateUser: async (updates: Partial<User>) => { } // Placeholder, overridden below
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
