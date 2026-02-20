import { Capacitor } from '@capacitor/core';
import { supabaseDB } from './supabaseService';
import { User } from '../types';
import { StreakService } from './streakService';

/**
 * Auth Service - Powered by Supabase Auth (GoTrue)
 * 
 * Replaces Firebase. Uses Supabase native authentication handling.
 * Integrates directly with the 'users' table via supabaseService.
 */
class AuthService {

  // Helper to sanitize email
  private sanitizeEmail(email: string): string {
    if (!email) throw new Error("Email is required");

    // Aggressive sanitization:
    // 1. Trim whitespace
    // 2. Convert to lowercase
    // 3. Normalize characters (handles homoglyphs/accents)
    // 4. Remove ALL non-printable characters and control characters
    return email
      .trim()
      .toLowerCase()
      .normalize('NFKC')
      .replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, '');
  }

  // --- OAuth (Google / GitHub) ---
  async signInWithOAuth(provider: 'google' | 'github'): Promise<void> {
    // FIXED: Use window.location.origin for Web, but Custom Scheme for Mobile
    let redirectUrl = window.location.origin;

    // Check if we are running in a Capacitor app
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      // Use the scheme defined in AndroidManifest.xml
      redirectUrl = 'genspark://auth';
    } else {
      console.log("⚠️ [AuthService] Not native platform, utilizing origin:", redirectUrl);
    }

    console.log("🔐 [AuthService] Initiating OAuth with Redirect URL:", redirectUrl);

    if (isNative) {
      // For Native: Get the URL but don't redirect in the WebView
      const { data, error } = await supabaseDB.supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Use the Capacitor Browser plugin to open the URL in the system browser
        const { Browser } = await import('@capacitor/browser');
        await Browser.open({ url: data.url, windowName: '_self' });
      }
    } else {
      // For Web: Standard redirect flow
      const { error } = await supabaseDB.supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false
        }
      });

      if (error) {
        console.error("Supabase OAuth Error:", error);

        const msg = error.message?.toLowerCase() || '';
        const errorString = JSON.stringify(error).toLowerCase();

        if (msg.includes('apikey')) {
          throw new Error("Supabase is not configured correctly. Missing API Key.");
        }

        if (msg.includes('provider is not enabled') || errorString.includes('provider is not enabled')) {
          const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
          throw new Error(`${providerName} Login is not enabled in this database. Please use "Create Account" or "Log In" with Email.`);
        }

        throw error;
      }
    }
  }

  async signInWithGoogle(): Promise<void> {
    return this.signInWithOAuth('google');
  }

  async signInWithGithub(): Promise<void> {
    return this.signInWithOAuth('github');
  }

  // --- Email / Password ---
  async signUp(email: string, password: string, name: string): Promise<Partial<User>> {
    const cleanEmail = this.sanitizeEmail(email);
    const cleanName = name.trim();

    // Diagnostic logging for invisible characters
    const charCodes = Array.from(cleanEmail).map(c => c.charCodeAt(0));
    console.log("Signup Debug:", {
      email: cleanEmail,
      length: cleanEmail.length,
      charCodes,
      name: cleanName
    });

    // Attempt Sign Up
    const { data, error } = await supabaseDB.supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: cleanName }
      }
    });

    if (error) {
      // Remove aggressive error masking to see the real issue
      throw error;
    }

    return {
      _id: data.user?.id || 'pending',
      email: cleanEmail,
      name: cleanName
    };
  }

  async signIn(email: string, password?: string): Promise<User> {
    if (!password) throw new Error("Password required");
    const cleanEmail = this.sanitizeEmail(email);

    const { data, error } = await supabaseDB.supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error("Login failed");

    // OPTIMIZATION: Do not block login with profile fetching.
    // AuthContext's onAuthStateChange listener will fetch the profile in the background.
    return {
      _id: data.user.id,
      email: cleanEmail,
      name: data.user.user_metadata?.full_name || 'User'
    } as User;
  }

  async signOut(): Promise<void> {
    await supabaseDB.supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<void> {
    const cleanEmail = this.sanitizeEmail(email);
    const { error } = await supabaseDB.supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
  }

  async verifyOtp(email: string, token: string, type: 'signup' | 'recovery' | 'invite' | 'magiclink'): Promise<void> {
    const { error } = await supabaseDB.supabase.auth.verifyOtp({
      email,
      token,
      type
    });
    if (error) throw error;
  }

  async resendOtp(email: string, type: 'signup' | 'email_change'): Promise<void> {
    const { error } = await supabaseDB.supabase.auth.resend({
      type,
      email
    });
    if (error) throw error;
  }

  async deleteAccount(): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("No user logged in");

    // 1. Delete profile data (User table)
    // We cannot delete from auth.users (requires service role), 
    // but we can clean up our app's 'users' table if RLS allows self-deletion.
    const { error } = await supabaseDB.supabase
      .from('users')
      .delete()
      .eq('id', user._id);

    if (error) {
      console.error("Failed to delete user profile:", error);
      throw new Error("Failed to delete account data");
    }

    // 2. Sign out
    await this.signOut();
  }

  // --- Session State ---

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session }, error } = await supabaseDB.supabase.auth.getSession();
      if (error || !session?.user) return null;

      return await supabaseDB.findOne({ _id: session.user.id });
    } catch (e) {
      return null;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabaseDB.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("authService: Auth event", { event, userId: session?.user?.id });

      if (!session?.user) {
        console.log("authService: No session, returning null");
        callback(null);
        return;
      }

      const userId = session.user.id;

      // FETCH PROFILE OPTIMIZATION:
      // We check if we have a valid backup in localStorage for an INSTANT return
      if (typeof localStorage !== 'undefined') {
        const backup = localStorage.getItem('genspark_user_backup');
        if (backup) {
          try {
            const parsed = JSON.parse(backup);
            if (parsed._id === userId) {
              console.log("authService: Fast-path cache hit for", userId);
              callback(parsed); // Immediate unblock
            }
          } catch (e) { }
        }
      }

      // BACKGROUND SYNC: Fetch full profile without blocking initialization
      // Note: We use findOne which is already parallelized
      supabaseDB.findOne({ _id: userId }).then(async (user) => {
        if (!user) {
          console.log("authService: Profile not found for existing session. Creating one...");
          try {
            const profileData = {
              _id: userId,
              email: session.user.email!,
              name: session.user.user_metadata.full_name || session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
              avatar: session.user.user_metadata.avatar_url || session.user.user_metadata.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
              onboardingCompleted: false
            };
            callback(profileData as User);
            const newUser = await supabaseDB.insertOne(profileData);
            callback(newUser);
          } catch (e) {
            console.error("authService: Failed to create profile", e);
          }
        } else {
          callback(user);
        }
      }).catch(err => {
        console.error("authService: Background profile sync failed", err);
      });
    });

    return () => subscription.unsubscribe();
  }
}

export const authService = new AuthService();