import { createClient } from '@supabase/supabase-js';

// These environment variables are loaded from the project's .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Log error if keys are missing
  console.error("Supabase environment variables are missing. Check your .env.local file.");
  // Use throw new Error in non-client files if you want to enforce configuration.
}

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (supabaseUrl && supabaseAnonKey) {
    console.log("Supabase client initialized.");
}