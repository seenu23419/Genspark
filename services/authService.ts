import { supabaseDB } from './supabaseService';
import { User } from '../types';

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

    // STRICT SANITIZATION:
    // Remove quotes, spaces, and any non-ASCII characters.
    // We only allow: a-z, A-Z, 0-9, @, ., +, -, _, %
    let clean = email.replace(/[^a-zA-Z0-9@.+_%\-]/g, '').toLowerCase();

    // Ensure no leading/trailing dots or special chars (basic cleanup)
    clean = clean.trim();

    // Basic structure check
    if (!clean.includes('@') || !clean.includes('.')) {
      throw new Error(`Invalid email format. Please check "${clean}"`);
    }

    return clean;
  }

  // --- OAuth (Google / GitHub) ---
  async signInWithOAuth(provider: 'google' | 'github'): Promise<void> {
    // FIXED: Explicitly set redirect URL to http://localhost:3000
    // This matches the "Authorized Redirect URI" typically set in Google Cloud Console for development.
    // Using window.location.origin can cause mismatches if running on 127.0.0.1 or random ports.
    const redirectUrl = 'http://localhost:3000';

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

    // Manually ensure profile exists in our public table
    if (data.user) {
      try {
        await supabaseDB.insertOne({
          _id: data.user.id,
          email: cleanEmail,
          name: cleanName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanName}`
        });
      } catch (dbError) {
        console.warn("Profile creation handled by DB trigger or failed:", dbError);
      }
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

    const profile = await supabaseDB.findOne({ _id: data.user.id });
    if (!profile) throw new Error("Profile not found in database.");

    return profile;
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
      if (session?.user) {
        const user = await supabaseDB.findOne({ _id: session.user.id });

        if (!user && event === 'SIGNED_IN') {
          try {
            const newUser = await supabaseDB.insertOne({
              _id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata.full_name || 'User',
              avatar: session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
            });
            callback(newUser);
          } catch (e) {
            console.error("Failed to create user profile on auth change:", e);
            callback(null);
          }
        } else {
          callback(user);
        }
      } else {
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  }
}

export const authService = new AuthService();