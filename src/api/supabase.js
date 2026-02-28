import { createClient } from "@supabase/supabase-js";
import notify from '../services/notify.jsx';

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

export function handleSupabaseError(err) {
  try {
    const status = err?.status;
    const code = err?.code?.toString?.() || '';
    const message = err?.message || String(err);
    // Known Postgres/HTTP error statuses to surface
    if ([400, 403, 406].includes(Number(status)) || ['42703'].includes(code)) {
      notify.error(message);
    }
  } catch (e) {
    // no-op
  }
}
