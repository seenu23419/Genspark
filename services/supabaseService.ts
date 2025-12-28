import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from '../types';

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
      // Simple lightweight query to check connection
      const { error } = await this.supabase.from('users').select('count', { count: 'exact', head: true });

      // If error is 401 (Unauthorized), the key is wrong.
      if (error && (error.code === 'PGRST301' || error.message?.includes('JWT'))) {
        return { server: true, db: false, mode: 'SUPABASE' };
      }

      // If table doesn't exist yet but we connected, that's "connected" but "not setup". 
      // For Splash screen purposes, we count it as DB success if we didn't get a connection error.
      return { server: true, db: !error || error.code === '42P01', mode: 'SUPABASE' };
    } catch (e) {
      return { server: false, db: false, mode: 'SUPABASE' };
    }
  }

  // --- Data Transformation Layer ---
  // Converts SQL Normalized Data -> React Application State
  private async formatUserForApp(profile: any): Promise<User | null> {
    if (!profile) return null;

    // Fetch Progress separately (Scalable approach)
    const { data: progressData } = await this.supabase
      .from('user_progress')
      .select('lesson_id, status')
      .eq('user_id', profile.id);

    const completedIds = progressData
      ?.filter((p: any) => p.status === 'completed')
      .map((p: any) => p.lesson_id) || [];

    const unlockedIds = progressData
      ?.filter((p: any) => p.status === 'unlocked' || p.status === 'completed')
      .map((p: any) => p.lesson_id) || ['c1']; // Default unlock first lesson

    return {
      _id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
      xp: profile.xp || 0,
      streak: profile.streak || 0,
      isPro: profile.is_pro || false,
      subscriptionTier: profile.subscription_tier,
      billingCycle: profile.billing_cycle,
      nextBillingDate: profile.next_billing_date ? new Date(profile.next_billing_date) : undefined,
      lessonsCompleted: completedIds.length,
      completedLessonIds: completedIds,
      unlockedLessonIds: unlockedIds,
      createdAt: new Date(profile.created_at),
      provider: 'email' // simplified for UI
    };
  }

  // --- Core Operations ---

  async findOne(query: { email?: string, _id?: string }): Promise<User | null> {
    if (!this.isConfigured) return null;

    let builder = this.supabase.from('users').select('*');

    if (query._id) builder = builder.eq('id', query._id);
    else if (query.email) builder = builder.eq('email', query.email);
    else return null;

    const { data, error } = await builder.single();
    if (error || !data) return null;

    return this.formatUserForApp(data);
  }

  /**
   * Insert User (Usually handled by Auth Trigger, but here for manual fallback)
   */
  async insertOne(userData: Partial<User>): Promise<User> {
    if (!this.isConfigured) throw new Error("Database not configured");

    // 1. Insert Profile
    const { data: profile, error } = await this.supabase
      .from('users')
      .upsert({
        id: userData._id, // Ideally passed from Auth
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        xp: 0,
        created_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Initialize First Lesson
    await this.supabase.from('user_progress').insert({
      user_id: profile.id,
      lesson_id: 'c1',
      status: 'unlocked'
    });

    return (await this.formatUserForApp(profile))!;
  }

  /**
   * Update User & Progress
   * Handles complex logic to split updates between 'users' table and 'user_progress' table
   */
  async updateOne(id: string, updates: Partial<User>): Promise<User> {
    if (!this.isConfigured) throw new Error("Database not configured");

    // 1. Update Profile Fields
    const profileUpdates: any = {};
    if (updates.xp !== undefined) profileUpdates.xp = updates.xp;
    if (updates.streak !== undefined) profileUpdates.streak = updates.streak;
    if (updates.isPro !== undefined) profileUpdates.is_pro = updates.isPro;
    if (updates.avatar !== undefined) profileUpdates.avatar = updates.avatar;

    if (Object.keys(profileUpdates).length > 0) {
      await this.supabase.from('users').update(profileUpdates).eq('id', id);
    }

    // 2. Update Progress (If lessons changed)
    // We check unlocked/completed arrays to upsert rows in `user_progress`
    if (updates.completedLessonIds) {
      for (const lessonId of updates.completedLessonIds) {
        await this.supabase.from('user_progress').upsert({
          user_id: id,
          lesson_id: lessonId,
          status: 'completed',
          completed_at: new Date()
        }, { onConflict: 'user_id, lesson_id' });
      }
    }

    if (updates.unlockedLessonIds) {
      for (const lessonId of updates.unlockedLessonIds) {
        // Only unlock if not already completed
        const { data: existing } = await this.supabase
          .from('user_progress')
          .select('status')
          .eq('user_id', id)
          .eq('lesson_id', lessonId)
          .single();

        if (!existing || existing.status === 'locked') {
          await this.supabase.from('user_progress').upsert({
            user_id: id,
            lesson_id: lessonId,
            status: 'unlocked'
          }, { onConflict: 'user_id, lesson_id' });
        }
      }
    }

    // Return fresh state
    const freshUser = await this.findOne({ _id: id });
    if (!freshUser) throw new Error("Update failed");
    return freshUser;
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
      .select('*', { count: 'exact', head: true })
      .gt('xp', xp);

    if (error) {
      return 0;
    }

    // Rank is number of people above you + 1
    return (count || 0) + 1;
  }
}

export const supabaseDB = new SupabaseService();
