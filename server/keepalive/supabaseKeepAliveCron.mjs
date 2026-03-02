import "dotenv/config";
import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "[keepalive] Missing SUPABASE_URL and/or SUPABASE key. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)."
  );
  process.exit(1);
}

const DAILY_CRON = process.env.KEEPALIVE_CRON || "0 3 * * *";
const PING_INTERVAL_SECONDS = Number(
  process.env.KEEPALIVE_PING_INTERVAL_SECONDS || 10
);
const RUN_WINDOW_SECONDS = Number(process.env.KEEPALIVE_RUN_WINDOW_SECONDS || 60);
const PING_TABLE = process.env.KEEPALIVE_TABLE || "classes";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let runInProgress = false;

async function pingDatabase() {
  const startedAt = Date.now();
  const { error } = await supabase
    .from(PING_TABLE)
    .select("id", { head: true, count: "exact" })
    .limit(1);

  if (error) {
    console.error(`[keepalive] Ping failed: ${error.message}`);
    return;
  }

  const elapsed = Date.now() - startedAt;
  console.log(`[keepalive] Ping succeeded in ${elapsed}ms`);
}

async function runKeepAliveWindow() {
  if (runInProgress) {
    console.log("[keepalive] Previous run still active, skipping this trigger.");
    return;
  }

  runInProgress = true;
  console.log(
    `[keepalive] Starting daily keep-alive window for ${RUN_WINDOW_SECONDS}s (every ${PING_INTERVAL_SECONDS}s).`
  );

  const endAt = Date.now() + RUN_WINDOW_SECONDS * 1000;

  try {
    await pingDatabase();

    while (Date.now() < endAt) {
      await new Promise((resolve) =>
        setTimeout(resolve, PING_INTERVAL_SECONDS * 1000)
      );

      if (Date.now() >= endAt) {
        break;
      }

      await pingDatabase();
    }
  } finally {
    runInProgress = false;
    console.log("[keepalive] Daily keep-alive window complete.");
  }
}

console.log(`[keepalive] Cron scheduled with expression: ${DAILY_CRON}`);
console.log(
  `[keepalive] Table: ${PING_TABLE}, interval: ${PING_INTERVAL_SECONDS}s, window: ${RUN_WINDOW_SECONDS}s`
);

cron.schedule(DAILY_CRON, runKeepAliveWindow, { timezone: process.env.TZ });
