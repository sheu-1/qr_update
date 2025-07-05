import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration');
}

// Initialize Supabase client with enhanced options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'qr-code-app/expo',
    },
  },
});

// Database types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface QRCode {
  id: string;
  account_number: string;
  user_id: string;
  created_at: string;
  last_used: string | null;
}

// Authentication helper functions
export const auth = {
  async signUp(email: string, password: string) {
    // Password validation
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    // Email validation
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:19006/verify-email',
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    // Rate limiting
    const rateLimitKey = `login_${email}`;
    const rateLimit = 5; // max 5 attempts per hour
    const timeWindow = 3600000; // 1 hour in milliseconds

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if user exists
      if (user) {
        const { data: loginAttempts, error: attemptsError } = await supabase
          .from('login_attempts')
          .select('created_at')
          .eq('email', email)
          .gte('created_at', new Date(Date.now() - timeWindow).toISOString())
          .order('created_at', { ascending: false })
          .limit(rateLimit);

        if (attemptsError) throw attemptsError;

        if (loginAttempts && loginAttempts.length >= rateLimit) {
          throw new Error('Too many login attempts. Please try again later.');
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Record failed attempt
        await supabase
          .from('login_attempts')
          .insert({
            email,
            created_at: new Date().toISOString(),
          });
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async sendResetPasswordEmail(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:19006/reset-password',
    });
    if (error) throw error;
    return data;
  },

  async sendVerificationEmail(email: string) {
    const { data, error } = await supabase.auth.updateUser({
      email,
    });
    if (error) throw error;
    return data;
  },
};

// Error handling
export const handleError = (error: any) => {
  if (error instanceof Error) {
    if (error.message.includes('auth.expired_token')) {
      return 'Your session has expired. Please log in again.';
    }
    if (error.message.includes('auth.invalid_password')) {
      return 'Invalid password. Please try again.';
    }
    if (error.message.includes('auth.invalid_email')) {
      return 'Invalid email address. Please try again.';
    }
    if (error.message.includes('auth.user_already_exists')) {
      return 'An account with this email already exists.';
    }
    if (error.message.includes('auth.user_not_found')) {
      return 'No account found with this email.';
    }
    if (error.message.includes('auth.email_not_verified')) {
      return 'Please verify your email address first.';
    }
    if (error.message.includes('Too many login attempts')) {
      return 'Too many login attempts. Please try again later.';
    }
    if (error.message.includes('Password must be')) {
      return error.message;
    }
  }
  return error.message || 'An unexpected error occurred.';
};
