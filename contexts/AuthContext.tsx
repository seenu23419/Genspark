
import React, { createContext, useContext, useEffect, useState } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [initializing, setInitializing] = useState(true);
    const [minSplashDone, setMinSplashDone] = useState(false);

    const loading = initializing || !minSplashDone;

    const refreshProfile = async () => {
        if (!user) return;
        const fresh = await supabaseDB.findOne({ _id: user._id });
        if (fresh) setUser(fresh);
    };

    useEffect(() => {
        let mounted = true;

        // 1. Min Splash Timer (Reduced for speed)
        setTimeout(() => {
            if (mounted) setMinSplashDone(true);
        }, 600);

        // 2. Initial Session Check
        const initSession = async () => {
            console.log("AuthContext: Starting initSession...");

            // Safety Timeout
            const timeoutId = setTimeout(() => {
                if (mounted && initializing) {
                    console.warn("AuthContext: Initialization timed out.");
                    setInitializing(false);
                }
            }, 8000);

            try {
                const currentUser = await authService.getCurrentUser();
                if (mounted) {
                    setUser(currentUser);
                    setInitializing(false);
                }
            } catch (error) {
                console.error("Auth Init Error:", error);
                if (mounted) setInitializing(false);
            } finally {
                clearTimeout(timeoutId);
            }
        };

        initSession();

        // 3. Listen for Auth Changes
        const unsubscribe = authService.onAuthStateChange((updatedUser) => {
            if (mounted) {
                setUser(prev => {
                    // Smart Merge: If we have local optimistc data (name) but server sends stale data without it,
                    // PRESERVE the local data to prevent redirect loops.
                    if (prev?.firstName && !updatedUser?.firstName && prev?._id === updatedUser?._id) {
                        console.log("AuthContext: Preventing stale overwrite of user profile.");
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
            }
        });

        return () => {
            mounted = false;
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, []);

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
                console.warn("AuthContext: Sign out error/timeout:", err);
            } finally {
                // 2. ALWAYS clear local state and force redirect
                localStorage.clear();
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

            setUser(optimisticUser as User);

            // 2. Background Sync (Fire-and-Forget)
            // We do NOT await this, so the UI can navigate immediately.
            supabaseDB.updateOne(user._id, updates)
                .then(updated => {
                    setUser(updated);
                })
                .catch(error => {
                    console.error("Profile update failed, reverting...", error);
                    setUser(previousUser);
                });
        }
    };

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
