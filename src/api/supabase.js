import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail fast if env variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Locus Error: Check your .env file for Supabase credentials."
  );
}

const lock = async (_name, _acquireTimeout, fn) => fn();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    lock,
  },
});
