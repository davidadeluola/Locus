import { createClient } from "@supabase/supabase-js";
import notify from '../services/notify.jsx';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Fail fast if env variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Locus setup error: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to .env in the project root and restart the Vite dev server."
  );
}

const lock = async (_name, _acquireTimeout, fn) => fn();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    lock,
    flowType: "pkce",
    detectSessionInUrl: true,
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
    throw new Error(e)
  }
}
