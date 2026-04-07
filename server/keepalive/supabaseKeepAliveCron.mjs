import "dotenv/config";
import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "[keepalive] Missing server env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY). Do not use VITE_* for server secrets."
  );
  process.exit(1);
}

const DAILY_CRON = process.env.KEEPALIVE_CRON || "0 3 * * *";
const PING_INTERVAL_SECONDS = Number(
  process.env.KEEPALIVE_PING_INTERVAL_SECONDS || 10
);
const RUN_WINDOW_SECONDS = Number(process.env.KEEPALIVE_RUN_WINDOW_SECONDS || 60);
const PING_TABLE = process.env.KEEPALIVE_TABLE || "classes";
const KEEPALIVE_TRANSPORT =
  process.env.KEEPALIVE_TRANSPORT?.toLowerCase() || "database";
const REALTIME_CHANNEL = process.env.KEEPALIVE_REALTIME_CHANNEL || "keepalive-heartbeat";
const REALTIME_EVENT = process.env.KEEPALIVE_REALTIME_EVENT || "heartbeat";
const SUBSCRIBE_TIMEOUT_MS = Number(process.env.KEEPALIVE_SUBSCRIBE_TIMEOUT_MS || 10000);

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

async function subscribeChannel(channel) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Realtime subscribe timed out after ${SUBSCRIBE_TIMEOUT_MS}ms`));
    }, SUBSCRIBE_TIMEOUT_MS);

    channel.subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timeout);
        resolve();
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        clearTimeout(timeout);
        reject(err || new Error(`Realtime channel status: ${status}`));
      }
    });
  });
}

async function pingRealtime() {
  const startedAt = Date.now();
  const channelName = `${REALTIME_CHANNEL}-${Date.now()}`;
  const channel = supabase.channel(channelName);

  try {
    await subscribeChannel(channel);

    const sendStatus = await channel.send({
      type: "broadcast",
      event: REALTIME_EVENT,
      payload: {
        source: "keepalive-cron",
        at: new Date().toISOString(),
      },
    });

    if (sendStatus !== "ok") {
      throw new Error(`Realtime heartbeat send failed with status: ${sendStatus}`);
    }

    const elapsed = Date.now() - startedAt;
    console.log(`[keepalive] Realtime heartbeat succeeded in ${elapsed}ms`);
  } finally {
    await supabase.removeChannel(channel);
  }
}

async function pingOnce() {
  if (KEEPALIVE_TRANSPORT === "realtime" || KEEPALIVE_TRANSPORT === "websocket") {
    await pingRealtime();
    return;
  }

  await pingDatabase();
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
    await pingOnce();

    while (Date.now() < endAt) {
      await new Promise((resolve) =>
        setTimeout(resolve, PING_INTERVAL_SECONDS * 1000)
      );

      if (Date.now() >= endAt) {
        break;
      }

      await pingOnce();
    }
  } catch (error) {
    console.error(`[keepalive] Run failed: ${error.message}`);
  } finally {
    runInProgress = false;
    console.log("[keepalive] Daily keep-alive window complete.");
  }
}

console.log(`[keepalive] Cron scheduled with expression: ${DAILY_CRON}`);
console.log(
  `[keepalive] Transport: ${KEEPALIVE_TRANSPORT}, table: ${PING_TABLE}, channel: ${REALTIME_CHANNEL}, interval: ${PING_INTERVAL_SECONDS}s, window: ${RUN_WINDOW_SECONDS}s`
);

cron.schedule(DAILY_CRON, runKeepAliveWindow, { timezone: process.env.TZ });
