import { createClient } from '@supabase/supabase-js';

// Use placeholder strings during build/compile if actual env variables are not present.
// This prevents Supabase client initialization from throwing errors during Next.js build.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url-for-build.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key-for-build-purposes-only';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    'Warning: Supabase credentials are missing! Using fallback placeholders for build compilation.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
