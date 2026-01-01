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
  private async formatUserForApp(profile: any, preFetchedProgress?: any[]): Promise<User | null> {
    if (!profile) return null;

    let progressData = preFetchedProgress;

    // If not pre-fetched, fetch now (Scalable approach)
    if (!progressData) {
      const { data } = await this.supabase
        .from('user_progress')
        .select('lesson_id, status')
        .eq('user_id', profile.id);
      progressData = data || [];
    }

    const completedIds = progressData
      ?.filter((p: any) => p.status === 'completed')
      .map((p: any) => p.lesson_id) || [];

    const unlockedIds = progressData
      ?.filter((p: any) => p.status === 'unlocked' || p.status === 'completed')
      .map((p: any) => p.lesson_id) || ['c1']; // Default unlock first lesson

    return {
      _id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      name: profile.name || (profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'User'),
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
      provider: 'email', // simplified for UI
      onboardingCompleted: profile.onboarding_completed || false
    };
  }

  // --- Core Operations ---

  async findOne(query: { email?: string, _id?: string }): Promise<User | null> {
    if (!this.isConfigured) return null;

    // OPTIMIZATION: Parallel Fetching if ID is known
    if (query._id) {
      const profilePromise = this.supabase
        .from('users')
        .select('id, email, name, avatar, xp, streak, is_pro, subscription_tier, created_at')
        .eq('id', query._id)
        .single();

      const progressPromise = this.supabase
        .from('user_progress')
        .select('lesson_id, status')
        .eq('user_id', query._id);

      const [profileResult, progressResult] = await Promise.all([profilePromise, progressPromise]);

      if (profileResult.error || !profileResult.data) return null;

      return this.formatUserForApp(profileResult.data, progressResult.data || []);
    }

    // Fallback for Email query (Sequential)
    let builder = this.supabase.from('users').select('id, email, name, first_name, last_name, avatar, xp, streak, is_pro, subscription_tier, onboarding_completed, created_at');
    if (query.email) builder = builder.eq('email', query.email);
    else return null;

    const { data, error } = await builder.single();
    if (error || !data) return null;

    return this.formatUserForApp(data);
  }

  /**
   * Insert User (Utility function, primarily handled by Auth Trigger)
   */
  async insertOne(userData: Partial<User>): Promise<User> {
    if (!this.isConfigured) throw new Error("Database not configured");

    if (!userData._id) throw new Error("User ID is required for profile creation");

    const { data: profile, error } = await this.supabase
      .from('users')
      .insert({
        id: userData._id,
        email: userData.email,
        name: userData.name,
        first_name: userData.firstName,
        last_name: userData.lastName,
        avatar: userData.avatar,
        xp: userData.xp || 0,
        created_at: userData.createdAt || new Date()
      })
      .select('id, email, name, first_name, last_name, avatar, xp, streak, is_pro, subscription_tier, onboarding_completed, created_at')
      .single();

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
    if (!this.isConfigured) throw new Error("Database not configured");

    // 1. Update Profile Fields
    const profileUpdates: any = {};
    if (updates.xp !== undefined) profileUpdates.xp = updates.xp;
    if (updates.streak !== undefined) profileUpdates.streak = updates.streak;
    if (updates.isPro !== undefined) profileUpdates.is_pro = updates.isPro;
    if (updates.avatar !== undefined) profileUpdates.avatar = updates.avatar;
    if (updates.firstName !== undefined) profileUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) profileUpdates.last_name = updates.lastName;
    if (updates.onboardingCompleted !== undefined) profileUpdates.onboarding_completed = updates.onboardingCompleted;

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
      .select('xp', { count: 'exact', head: true })
      .gt('xp', xp);

    if (error) {
      return 0;
    }

    return (count || 0) + 1;
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
}

export const supabaseDB = new SupabaseService();
