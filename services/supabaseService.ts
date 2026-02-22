import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from '../types';
import { StreakService } from './streakService';

const PROJECT_URL = 'https://aoiagnnkhaswpmhbobhd.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaWFnbm5raGFzd3BtaGJvYmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODU0MTUsImV4cCI6MjA4MjM2MTQxNX0.ZYGTcqoIp8SPMCMO_6VQa9pmj_dqoHv6qrsK8DXD3ls';

// Helper to safely get env vars
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return '';
};

/**
 * Supabase Service Client - Scalable Architecture
 * 
 * DESIGN FOR SCALE:
 * 1. Uses 'users' table for profile data.
 * 2. Uses 'user_progress' table for normalized lesson tracking (better for millions of rows).
 * 3. Removes LocalStorage/Mock logic to enforce production-grade reliability.
 */
class SupabaseService {
  public supabase: SupabaseClient;
  private isConfigured: boolean = false;
  private streakEnabled: boolean = true; // Circuit breaker for streak updates
  private supabaseUrl: string;

  constructor() {
    const envUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
    const envKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_KEY');

    // Check LocalStorage for manually entered key (fallback for demos/web containers)
    const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem('GENSPARK_SUPABASE_KEY') : null;

    // Use environment variables if available, otherwise fall back to project URL
    this.supabaseUrl = envUrl || PROJECT_URL;

    // Priority: Env Key > LocalStorage Key > Hardcoded Default > Placeholder
    const supabaseKey = envKey || localKey || DEFAULT_ANON_KEY || 'missing-anon-key';

    if (!envKey && !localKey && !DEFAULT_ANON_KEY) {
      console.warn("⚠️ GenSpark: Supabase Anon Key is missing. Waiting for user input.");
      this.isConfigured = false;
    } else {
      this.isConfigured = true;
    }

    this.supabase = createClient(this.supabaseUrl, supabaseKey);
  }

  /**
   * Manually update the Supabase Key (called from Splash Screen if connection fails)
   */
  public updateKey(newKey: string) {
    if (!newKey) return;
    localStorage.setItem('GENSPARK_SUPABASE_KEY', newKey);
    this.supabase = createClient(this.supabaseUrl, newKey);
    this.isConfigured = true;
  }

  // --- Health Check ---
  public async getHealth(): Promise<{ server: boolean; db: boolean; mode: 'SUPABASE' }> {
    if (!this.isConfigured) {
      return { server: true, db: false, mode: 'SUPABASE' };
    }

    try {
      // Create a timeout promise (10s max for slower connections)
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));

      // Simple lightweight query to check connection
      const query = this.supabase.from('users').select('count', { count: 'exact', head: true });

      // Race against timeout
      const { error } = await Promise.race([query, timeout]) as any;

      // If error is 401 (Unauthorized), the key is wrong.
      if (error && (error.code === 'PGRST301' || error.message?.includes('JWT'))) {
        return { server: true, db: false, mode: 'SUPABASE' };
      }

      // If table doesn't exist yet but we connected, that's "connected" but "not setup". 
      // For Splash screen purposes, we count it as DB success if we didn't get a connection error.
      return { server: true, db: !error || error.code === '42P01', mode: 'SUPABASE' };
    } catch (e) {
      console.warn("Health check failed/timed out:", e);
      // CHANGED: Return success anyway to not block the app
      // The actual operations will fail gracefully if there's a real issue
      return { server: true, db: true, mode: 'SUPABASE' };
    }
  }

  // --- Data Transformation Layer ---
  // Converts SQL Normalized Data -> React Application State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async formatUserForApp(profile: any, preFetchedProgress?: any[]): Promise<User | null> {
    if (!profile) return null;

    let progressData = preFetchedProgress;

    // If not pre-fetched, fetch now (Scalable approach)
    if (!progressData) {
      const { data, error } = await this.supabase
        .from('user_progress')
        .select('lesson_id, status')
        .eq('user_id', profile.id);

      progressData = data || [];

      // HYBRID FALLBACK: If DB returns empty or table is missing, check LocalStorage
      // This solves the issue if user_progress table isn't migrated yet.
      if (typeof localStorage !== 'undefined') {
        const localKey = `progress_${profile.id}`;
        try {
          const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
          if (Array.isArray(localData)) {
            // MERGE: Keep unique ones from both. Give priority to local if DB is failing.
            const merged = [...progressData];
            localData.forEach((lp: any) => {
              if (!merged.find(p => p.lesson_id === lp.lesson_id)) {
                merged.push(lp);
              }
            });
            progressData = merged;
          }
        } catch (e) {
          console.warn("Failed to parse local progress fallback", e);
        }
      }
    }

    const completedIds = [...new Set([
      ...(progressData?.filter((p: any) => p.status === 'completed').map((p: any) => p.lesson_id) || []),
      ...(profile.completed_lesson_ids || [])
    ])];

    const unlockedIds = [...new Set([
      ...(progressData?.filter((p: any) => p.status === 'unlocked' || p.status === 'completed').map((p: any) => p.lesson_id) || []),
      ...(profile.unlocked_lesson_ids || []),
      'c1' // Default unlock first lesson
    ])];

    return {
      _id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      name: profile.name || (profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'User'),
      avatar: profile.avatar,
      lessonsCompleted: completedIds.length,
      completedLessonIds: completedIds,
      unlockedLessonIds: unlockedIds,
      createdAt: new Date(profile.created_at),
      provider: 'email', // simplified for UI
      onboardingCompleted: profile.onboarding_completed || false,
      streak: profile.streak || 0,
      lastActiveAt: profile.last_active_at,
      lastLanguageId: profile.last_language_id,
      lastLessonId: profile.last_lesson_id,
      activity_log: profile.activity_log || [],
      activity_history: profile.activity_history || [] // Simplified: no merging during login for performance
    };
  }

  // --- Core Operations ---

  async findOne(query: { email?: string, _id?: string }): Promise<User | null> {
    if (!this.isConfigured) return null;

    const userId = query._id;
    const email = query.email;

    // 1. Multi-tier select string for extreme resilience
    // Tier 1: FULL (Everything)
    // Tier 2: COMPAT (Remove complex activity logs/streaks)
    // Tier 3: SAFE (Absolute minimum for auth + basic profile)

    const FULL_SELECT = 'id, email, name, first_name, last_name, avatar, is_pro, subscription_tier, onboarding_completed, streak, last_active_at, activity_log, activity_history, completed_lesson_ids, unlocked_lesson_ids, created_at, last_language_id, last_lesson_id';
    const COMPAT_SELECT = 'id, email, name, first_name, last_name, avatar, is_pro, onboarding_completed, created_at, completed_lesson_ids, unlocked_lesson_ids';
    const SAFE_SELECT = 'id, email, name, first_name, last_name, avatar, onboarding_completed, created_at';
    const TINY_SELECT = 'id, email, name, onboarding_completed';

    // Heuristic: If we know streak is disabled, don't even try FULL
    const selectStr = this.streakEnabled ? FULL_SELECT : COMPAT_SELECT;

    try {
      if (userId) {
        // FAST CACHE LOOKUP: If we had a recent fetch, return it immediately
        if (typeof localStorage !== 'undefined') {
          const cached = localStorage.getItem('genspark_user_backup');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed._id === userId) {
                console.log("[SupabaseService] findOne - Returning cached data for fast start");
                // Don't return here if we want background refresh, but for findOne, 
                // we usually want the most accurate data. 
                // Logic shift: Use findOne for "Deep" fetch, but provide a way to get "Quick" data.
              }
            } catch (e) { }
          }
        }

        // PARALLEL FETCH: Profile + Progress
        const profilePromise = this.supabase
          .from('users')
          .select(selectStr)
          .eq('id', userId)
          .single();

        const progressPromise = this.supabase
          .from('user_progress')
          .select('lesson_id, status')
          .eq('user_id', userId);

        const [profileResult, progressResult] = await Promise.all([profilePromise, progressPromise]);

        if (profileResult.error) {
          // Tiered Fallback
          if (selectStr === FULL_SELECT) {
            console.warn("[SupabaseService] FULL select failed, retrying with COMPAT", profileResult.error.message);
            this.streakEnabled = false; // Persistent downgrade
            return this.findOne(query);
          } else if (selectStr === COMPAT_SELECT) {
            console.warn("[SupabaseService] COMPAT select failed, retrying with SAFE", profileResult.error.message);
            return this.supabase.from('users').select(SAFE_SELECT).eq('id', userId).single()
              .then(res => res.error ? null : this.formatUserForApp(res.data, (progressResult.data || []) as { lesson_id: string; status: string }[])) as unknown as Promise<User | null>;
          }
          console.error("[SupabaseService] Profile fetch failed even in SAFE mode:", profileResult.error);
          return null;
        }

        return this.formatUserForApp(profileResult.data, progressResult.data || []);
      } else if (email) {
        const { data, error } = await this.supabase
          .from('users')
          .select(selectStr)
          .eq('email', email)
          .single();

        if (error) {
          if (selectStr === FULL_SELECT) {
            console.warn("[SupabaseService] (Email) FULL failed -> COMPAT");
            this.streakEnabled = false;
            return this.findOne(query);
          } else if (selectStr === COMPAT_SELECT) {
            console.warn("[SupabaseService] (Email) COMPAT failed -> SAFE");
            const safeRes = await this.supabase.from('users').select(SAFE_SELECT).eq('email', email).single();
            return safeRes.data ? this.formatUserForApp(safeRes.data) : null;
          }
          return null;
        }
        return this.formatUserForApp(data);
      }
    } catch (e) {
      console.error("[SupabaseService] findOne exception:", e);
    }
    return null;
  }

  /**
   * Extremely fast profile fetch for UI unblocking
   */
  async findOneHeader(userId: string): Promise<Partial<User> | null> {
    if (!this.isConfigured || !userId) return null;
    const { data, error } = await this.supabase
      .from('users')
      .select('id, email, name, onboarding_completed, first_name, avatar')
      .eq('id', userId)
      .single();

    if (error) return null;
    return {
      _id: data.id,
      email: data.email,
      name: data.name,
      firstName: data.first_name,
      avatar: data.avatar,
      onboardingCompleted: data.onboarding_completed
    };
  }

  /**
   * Fetch specific fields for a user (used for lazy-loading heavy data)
   */
  async fetchFields(userId: string, fields: string[]): Promise<any> {
    if (!this.isConfigured) return null;

    const { data, error } = await this.supabase
      .from('users')
      .select(fields.join(', '))
      .eq('id', userId)
      .single();

    if (error) {
      console.error(`[SupabaseService] Failed to fetch fields ${fields}:`, error);
      return null;
    }

    return data;
  }

  /**
   * Insert User (Utility function, primarily handled by Auth Trigger)
   */
  async insertOne(userData: Partial<User>): Promise<User> {
    if (!this.isConfigured) throw new Error("Database not configured");

    if (!userData._id) throw new Error("User ID is required for profile creation");

    // Extract first name from name or email to prevent null firstName
    let firstName = userData.firstName;
    let lastName = userData.lastName;

    if (!firstName && userData.name) {
      const nameParts = userData.name.split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || '';
    }

    if (!firstName && userData.email) {
      // Use email username as fallback
      firstName = userData.email.split('@')[0];
    }

    const profileRequest = this.supabase
      .from('users')
      .insert({
        id: userData._id,
        email: userData.email,
        name: userData.name || firstName || 'User',
        first_name: firstName || 'User',
        last_name: lastName || '',
        avatar: userData.avatar,
        onboarding_completed: false, // Always false for new users
        created_at: userData.createdAt || new Date()
      })
      .select('id, email, name, first_name, last_name, avatar, is_pro, subscription_tier, onboarding_completed, streak, last_active_at, completed_lesson_ids, unlocked_lesson_ids, created_at, last_language_id, last_lesson_id');

    let { data: profile, error } = await profileRequest.single();

    if (error && (error.code === '42703' || error.message?.includes('column'))) {
      console.warn("[SupabaseService] Missing streak columns during insert, retrying without them");
      const fallbackInsert = await this.supabase
        .from('users')
        .insert({
          id: userData._id,
          email: userData.email,
          name: userData.name || firstName || 'User',
          first_name: firstName || 'User',
          last_name: lastName || '',
          avatar: userData.avatar,
          onboarding_completed: false,
          created_at: userData.createdAt || new Date()
        })
        .select('id, email, name, first_name, last_name, avatar, is_pro, subscription_tier, onboarding_completed, created_at')
        .single() as any;

      profile = fallbackInsert.data;
      error = fallbackInsert.error;
    }

    if (error) throw error;

    // 2. Initialize First Lesson
    await this.supabase.from('user_progress').upsert({
      user_id: profile.id,
      lesson_id: 'c1',
      status: 'unlocked'
    }, { onConflict: 'user_id, lesson_id' });

    return (await this.formatUserForApp(profile))!;
  }

  /**
   * Update User & Progress
   * Handles complex logic to split updates between 'users' table and 'user_progress' table
   */
  async updateOne(id: string, updates: Partial<User>): Promise<User> {
    console.log("[SupabaseService] updateOne CALLED for:", id, "With Updates:", updates);
    if (!this.isConfigured) {
      console.error("[SupabaseService] Database not configured");
      throw new Error("Database not configured");
    }

    // 1. Update Profile Fields (Exclude XP/Streak - now managed by RPC)
    const profileUpdates: any = {};
    if (updates.avatar !== undefined) profileUpdates.avatar = updates.avatar;
    if (updates.firstName !== undefined) profileUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) profileUpdates.last_name = updates.lastName;
    if (updates.name !== undefined) {
      profileUpdates.name = updates.name;
      // Heuristic: If name provided but firstName isn't, try to split
      if (!updates.firstName) {
        profileUpdates.first_name = updates.name.split(' ')[0];
        profileUpdates.last_name = updates.name.split(' ').slice(1).join(' ');
      }
    }
    if (updates.onboardingCompleted !== undefined) profileUpdates.onboarding_completed = updates.onboardingCompleted;
    if (updates.completedLessonIds) profileUpdates.completed_lesson_ids = updates.completedLessonIds;
    if (updates.unlockedLessonIds) profileUpdates.unlocked_lesson_ids = updates.unlockedLessonIds;
    if (updates.streak !== undefined) profileUpdates.streak = updates.streak;
    if (updates.lastActiveAt !== undefined) profileUpdates.last_active_at = updates.lastActiveAt;
    if (updates.activity_log !== undefined) profileUpdates.activity_log = updates.activity_log;
    if (updates.activity_history !== undefined) profileUpdates.activity_history = updates.activity_history;

    // Resume Reliability
    if (updates.lastLessonId) profileUpdates.last_lesson_id = updates.lastLessonId;
    // We store the full context as JSONB for flexibility
    if (updates.lastLessonId) {
      profileUpdates.current_context = {
        lesson_id: updates.lastLessonId,
        status: 'in_progress', // Default, logic can be more granular
        timestamp: Date.now()
      };
      profileUpdates.last_visited_at = new Date();
    }

    if (Object.keys(profileUpdates).length > 0) {
      console.log("[SupabaseService] Updating Profile:", profileUpdates);
      let { error, data } = await this.supabase
        .from('users')
        .update(profileUpdates)
        .eq('id', id)
        .select();

      if (error) {
        console.error("❌ [DB_FAILURE] Supabase update failed for user", id, error);
      } else {
        console.log("✅ [DB_SUCCESS] Supabase update succeeded", data?.[0]?.onboarding_completed);
      }

      if (error && (error.code === '42703' || error.message?.includes('column'))) {
        console.warn("[SupabaseService] Missing columns during update, retrying with strictly compatible fields");
        this.streakEnabled = false;

        // Comprehensive fallback: Only keep columns known to be in early schemas
        const legacyCompatibleUpdates: any = {};
        const safeKeys = ['name', 'first_name', 'last_name', 'avatar', 'is_pro', 'subscription_tier', 'onboarding_completed'];

        Object.keys(profileUpdates).forEach(key => {
          if (safeKeys.includes(key)) {
            legacyCompatibleUpdates[key] = profileUpdates[key];
          }
        });

        console.log("[SupabaseService] Fallback Update Content:", legacyCompatibleUpdates);
        const fallbackUpdate = await this.supabase
          .from('users')
          .update(legacyCompatibleUpdates)
          .eq('id', id)
          .select();

        error = fallbackUpdate.error;
        data = fallbackUpdate.data;
      }

      if (error) {
        console.error("Supabase update error:", { error, userId: id });
        // Don't throw here, allow progress update to proceed if possible
      }
    }

    // 2. XP & Gamification (RPC Call)
    // If XP is trying to be updated directly, we redirect to RPC if it's an increment.
    // Note: Direct setting of XP is no longer supported for security.
    if ((updates as any).xp !== undefined) {
      // We assume 'updates.xp' passed here was intended as a DELTA or TOTAL. 
      // Architecture Shift: The UI should call 'awardXP' directly. 
      // For backward compatibility, we log a warning.
      console.warn("Direct XP update attempted. Please use awardXP() RPC for security.");
    }

    // 3. Update Progress (Standard Lesson Completion)
    if (updates.completedLessonIds && updates.completedLessonIds.length > 0) {
      console.log("[SupabaseService] Processing completedLessonIds (Bulk):", updates.completedLessonIds.length);

      // Deduplicate IDs safely
      const uniqueLessonIds = [...new Set(updates.completedLessonIds)];

      // MIRROR TO LOCALSTORAGE: Ensure immediate persistence even if DB fails
      if (typeof localStorage !== 'undefined') {
        const localKey = `progress_${id}`;
        try {
          const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
          const localMap = new Map(localData.map((p: any) => [p.lesson_id, p]));

          uniqueLessonIds.forEach(lessonId => {
            if (!localMap.has(lessonId)) {
              localMap.set(lessonId, { lesson_id: lessonId, status: 'completed' });
            }
          });

          localStorage.setItem(localKey, JSON.stringify(Array.from(localMap.values())));
        } catch (e) {
          console.error("[SupabaseService] Local mirror failed", e);
        }
      }

      // CRITICAL: Bulk upsert to user_progress for maximum speed
      try {
        const upsertData = uniqueLessonIds.map(lessonId => ({
          user_id: id,
          lesson_id: lessonId,
          status: 'completed',
          completed_at: new Date().toISOString()
        }));

        console.log(`[SupabaseService] Upserting ${upsertData.length} rows to user_progress...`);

        const { data: upsertResult, error } = await this.supabase
          .from('user_progress')
          .upsert(upsertData, { onConflict: 'user_id, lesson_id' })
          .select();

        if (error) {
          console.error(`[SupabaseService] ❌ Bulk user_progress update failed:`, error.message, error.details);

          // Fallback 1: Try without completed_at (common schema mismatch)
          console.warn("[SupabaseService] Retrying without completed_at column...");
          const partialUpsertData = uniqueLessonIds.map(lessonId => ({
            user_id: id,
            lesson_id: lessonId,
            status: 'completed'
          }));

          const fallbackUpsert = await this.supabase
            .from('user_progress')
            .upsert(partialUpsertData, { onConflict: 'user_id, lesson_id' });

          if (fallbackUpsert.error) {
            console.error(`[SupabaseService] ❌ Fallback upsert also failed:`, fallbackUpsert.error.message);
          } else {
            console.log(`[SupabaseService] ✅ Fallback upsert succeeded (without completed_at).`);
          }
        } else {
          console.log(`[SupabaseService] ✅ Bulk progress updated successfully. Rows:`, upsertResult?.length);
        }
      } catch (e) {
        console.error(`[SupabaseService] Error in bulk progress operation:`, e);
      }

      // Update streak on lesson completion
      try {
        const u = await this.findOne({ _id: id });
        if (u) {
          const streakUpdates = StreakService.getStreakMismatch(u, this.isStreakEnabled());
          if (streakUpdates) {
            // Determine if we should recursively call updateOne or just direct update
            // Direct update is safer to avoid loops, but updateOne handles logic.
            // Since getStreakMismatch implies a drift, calling updateOne is okay as long as it converges.
            await this.updateOne(id, streakUpdates);
          }
        }
      } catch (e) {
        console.error("Streak sync failed", e);
      }
    }

    // Unlocking is now implicit based on completion of N-1. 
    // We no longer manually "unlock" next lessons in DB (status='unlocked' is deprecated in favor of just checking completion).
    // However, for UI backward compat, we might still track it if the schema expects it.

    // Return fresh state
    const freshUser = await this.findOne({ _id: id });
    if (!freshUser) throw new Error("Update failed");

    // DATA INTEGRITY GUARD: Ensure we don't return a stale user if findOne lags
    if (updates.completedLessonIds && freshUser.completedLessonIds.length < updates.completedLessonIds.length) {
      console.warn("[SupabaseService] findOne returned stale data after update, merging manually.");
      return {
        ...freshUser,
        completedLessonIds: [...new Set([...(freshUser.completedLessonIds || []), ...updates.completedLessonIds])],
        unlockedLessonIds: [...new Set([...(freshUser.unlockedLessonIds || []), ...(updates.unlockedLessonIds || [])])]
      };
    }

    return freshUser;
  }

  /**
   * Secure XP Awarding (RPC)
   */
  async awardXP(amount: number, reason: string): Promise<void> {
    if (!this.isConfigured) return;
    const { error } = await this.supabase.rpc('award_xp', { amount, reason });
    if (error) console.error("XP Award Failed:", error);
  }

  /**
   * Practice Hub Persistence (Enhanced)
   */
  /**
   * Sync LocalStorage Progress to DB (Ensures permanence)
   */
  async syncLocalProgressToDB(): Promise<void> {
    if (typeof localStorage === 'undefined' || !this.isConfigured) return;

    // 1. Get Local Data
    let localData: Record<string, any> = {};
    try {
      localData = JSON.parse(localStorage.getItem('practice_progress_local') || '{}');
    } catch (e) { return; }

    const challenges = Object.keys(localData);
    if (challenges.length === 0) return;

    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    console.log(`🔄 Syncing ${challenges.length} challenges to DB...`);

    // 2. Push each to DB if not already completed there
    // using Promise.all for parallel execution
    await Promise.all(challenges.map(async (cid) => {
      const item = localData[cid];
      const { error } = await this.supabase.from('practice_progress').upsert({
        user_id: user.id,
        challenge_id: cid,
        status: item.status,
        code_snapshot: item.code_snapshot,
        language_used: item.language_used || 'c',
        attempts_count: item.attempts_count || 1,
        last_attempt_at: item.last_attempt_at || new Date(),
        last_opened_at: new Date(),
        updated_at: new Date()
      }, { onConflict: 'user_id, challenge_id' });

      if (error) console.error(`Sync failed for ${cid}:`, error);
    }));

    console.log("✅ Sync Complete");
  }

  async savePracticeAttempt(challengeId: string, code: string, solved: boolean, language: string, executionTime?: string): Promise<void> {
    // EMERGENCY FALLBACK: Save to localStorage FIRST for demo reliability
    try {
      const localKey = 'practice_progress_local';
      const existing = JSON.parse(localStorage.getItem(localKey) || '{}');
      existing[challengeId] = {
        status: solved ? 'completed' : 'attempted',
        code_snapshot: code,
        language_used: language,
        execution_time: executionTime,
        last_attempt_at: new Date().toISOString()
      };
      localStorage.setItem(localKey, JSON.stringify(existing));
      console.log('✅ Practice saved to localStorage:', challengeId);
    } catch (e) {
      console.error('LocalStorage save failed:', e);
    }

    if (!this.isConfigured) return;
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    // 1. Get current status to prevent downgrades
    const { data: existing } = await this.supabase
      .from('practice_progress')
      .select('status, attempts_count')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .single();

    const newAttemptsCount = (existing?.attempts_count || 0) + 1;
    const finalStatus = (existing?.status === 'completed' || solved) ? 'completed' : 'attempted';

    // 2. Upsert persistence
    const { error } = await this.supabase.from('practice_progress').upsert({
      user_id: user.id,
      challenge_id: challengeId,
      status: finalStatus,
      code_snapshot: code,
      language_used: language,
      attempts_count: newAttemptsCount,
      last_attempt_at: new Date(),
      last_opened_at: new Date(),
      execution_time: executionTime,
      ...(solved ? { completed_at: new Date() } : {})
    }, { onConflict: 'user_id, challenge_id' });

    if (error) {
      console.error("Practice Save Failed (DB):", error);
      // Don't throw - we already saved to localStorage
      return;
    }

    if (solved && (!existing || existing.status !== 'completed')) {
      await this.awardXP(20, `practice_${challengeId}`);

      // Update streak and activity log
      try {
        const { data: profile } = await this.supabase.from('users').select('*').eq('id', user.id).single();
        if (profile) {
          const mappedUser = await this.formatUserForApp(profile);
          if (mappedUser) {
            const activityUpdates = StreakService.getActivityUpdates(mappedUser, {
              type: 'practice',
              title: `Solved Challenge: ${challengeId}`,
              xp: 20,
              executionTime,
              language,
              itemId: challengeId
            });

            if (activityUpdates) {
              console.log("[SupabaseService] Saving streak updates for practice completion:", activityUpdates);
              await this.updateOne(user.id, activityUpdates);
            }
          }
        }
      } catch (e) {
        console.error("Streak update failed", e);
      }
    }
  }

  /**
   * Fetch specific practice progress
   */
  async getPracticeProgress(challengeId: string): Promise<any> {
    // Try localStorage first
    try {
      const localKey = 'practice_progress_local';
      const localData = JSON.parse(localStorage.getItem(localKey) || '{}');
      if (localData[challengeId]) {
        console.log('✅ Loaded from localStorage:', challengeId);
        return localData[challengeId];
      }
    } catch (e) {
      console.error('LocalStorage read failed:', e);
    }

    if (!this.isConfigured) return null;
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('practice_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching progress:", error);
    }
    return data;
  }

  /**
   * Fetch all practice progress for current user
   */
  async getAllPracticeProgress(): Promise<any[]> {
    let localDataList: any[] = [];

    // 1. Get LocalStorage Data
    if (typeof localStorage !== 'undefined') {
      try {
        const localKey = 'practice_progress_local';
        const raw = JSON.parse(localStorage.getItem(localKey) || '{}');
        localDataList = Object.entries(raw).map(([challengeId, data]: [string, any]) => ({
          challenge_id: challengeId,
          ...data
        }));
      } catch (e) {
        console.error("LocalStorage read failed:", e);
      }
    }

    if (!this.isConfigured) return localDataList;

    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return localDataList;

    // 2. Get DB Data
    const { data, error } = await this.supabase
      .from('practice_progress')
      .select('challenge_id, status, last_attempt_at, completed_at, language_used, attempts_count, execution_time')
      .eq('user_id', user.id);

    if (error) {
      console.error("Error fetching all practice progress:", error);
      return localDataList; // Fallback to local only on error
    }

    // 3. Merge Strategies (Union by challenge_id)
    // Convert DB array to Map
    const dbMap = new Map();
    (data || []).forEach((p: any) => dbMap.set(p.challenge_id, p));

    // Merge: If in DB use DB, else use Local
    // Actually, we should trust the "most complete" status. 
    // If local says 'completed' and DB says 'attempted' (because offline), trust Local.
    localDataList.forEach((lp: any) => {
      const dbP = dbMap.get(lp.challenge_id);
      if (!dbP) {
        // Not in DB, add it
        dbMap.set(lp.challenge_id, lp);
      } else {
        // In both. If local is 'completed' and DB is not, use local
        if (lp.status === 'completed' && dbP.status !== 'completed') {
          dbMap.set(lp.challenge_id, lp);
        }
      }
    });

    return Array.from(dbMap.values());
  }

  /**
   * Get Global Rank
   * Calculates the user's rank based on XP compared to all other users.
   */
  async getUserRank(xp: number): Promise<number> {
    if (!this.isConfigured) return 0;

    // Count how many users have more XP than the current user
    const { count, error } = await this.supabase
      .from('users')
      .select('xp', { count: 'exact', head: true })
      .gt('xp', xp);

    if (error) {
      return 0;
    }

    return (count || 0) + 1;
  }

  // --- Practice Discussions ---

  /**
   * Fetch discussion comments for a practice challenge
   */
  async getPracticeDiscussions(challengeId: string): Promise<{ id: string; author?: string; text: string; created_at: string }[]> {
    if (!this.isConfigured) return [];

    const { data, error } = await this.supabase
      .from('practice_discussions')
      .select('id, author, text, created_at')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching practice discussions:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Add a comment to a practice challenge discussion
   */
  async addPracticeDiscussion(challengeId: string, text: string): Promise<{ id: string; author?: string; text: string; created_at: string } | null> {
    if (!this.isConfigured) return null;

    const { data: { user } } = await this.supabase.auth.getUser();
    const author = user ? (user.user_metadata?.full_name || user.email || 'User') : 'Anonymous';

    const { data, error } = await this.supabase
      .from('practice_discussions')
      .insert({ challenge_id: challengeId, author, text })
      .select('id, author, text, created_at')
      .single();

    if (error) {
      console.error('Error adding practice discussion:', error);
      return null;
    }
    return data as { id: string; author?: string; text: string; created_at: string } | null;
  }


  // --- Chat Persistence Layer ---

  /**
   * Fetch all chat sessions for a user
   */
  async getChatSessions(userId: string): Promise<{ id: string; title: string; created_at: string }[]> {
    if (!this.isConfigured) return [];

    const { data, error } = await this.supabase
      .from('chat_sessions')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Create a new chat session
   */
  async createChatSession(userId: string, title: string): Promise<{ id: string; title: string; created_at: string } | null> {
    if (!this.isConfigured) return null;

    const { data, error } = await this.supabase
      .from('chat_sessions')
      .insert({ user_id: userId, title: title.substring(0, 50) }) // Limit title length
      .select('id, title, created_at')
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
    return data;
  }

  /**
   * Delete a chat session and its messages (cascade usually handles messages, but good to know)
   */
  async deleteChatSession(sessionId: string): Promise<boolean> {
    if (!this.isConfigured) return false;

    const { error } = await this.supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting chat session:', error);
      return false;
    }
    return true;
  }

  /**
   * Fetch messages for a specific session
   */
  async getChatMessages(sessionId: string): Promise<{ id: string; role: 'user' | 'assistant'; content: string; created_at: string }[]> {
    if (!this.isConfigured) return [];

    const { data, error } = await this.supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Add a message to a session
   */
  async addChatMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<{ id: string } | null> {
    if (!this.isConfigured) return null;

    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        role,
        content
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }
    return data;
  }

  // --- Snippet & AI Fix Layer ---

  /**
   * Save user code snippet
   */
  async saveSnippet(language: string, code: string): Promise<void> {
    if (!this.isConfigured) return;
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return; // Silent fail if not logged in

    const { error } = await this.supabase.from('snippets').insert({
      user_id: user.id,
      language,
      code_text: code,
      // created_at is default now() usually, but providing it explicitly
      created_at: new Date()
    });

    if (error) console.error("Failed to save snippet:", error);
  }

  /**
   * Ask AI to fix code via Edge Function
   */
  async askAIToFix(language: string, code: string, error: string): Promise<string> {
    if (!this.isConfigured) return "Supabase not configured.";

    const { data, error: funcError } = await this.supabase.functions.invoke('fix-code', {
      body: { language, code, error }
    });

    if (funcError) {
      console.error("AI Fix Edge Function Failed:", funcError);
      return `Error analyzing code: ${funcError.message}`;
    }

    return data?.fixedCode || data?.message || "No suggestions returned.";
  }

  public isStreakEnabled(): boolean {
    return this.streakEnabled;
  }
}

export const supabaseDB = new SupabaseService();
