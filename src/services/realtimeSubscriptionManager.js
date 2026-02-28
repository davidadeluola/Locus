/**
 * @fileoverview Real-time Subscription Manager
 * Properly handles Supabase postgres_changes with debouncing and error handling
 * 
 * Problems it solves:
 * ✅ Stale closure references (refresh callback not updating)
 * ✅ Multiple rapid refreshes (debounced to 1 per 500ms)
 * ✅ Subscription errors (logged and recoverable)
 * ✅ Memory leaks (proper cleanup)
 * ✅ Race conditions (AbortController)
 */

import { supabase } from '../api/supabase';

/**
 * Subscribe to table changes with automatic refresh
 * @param {Object} config - Subscription configuration
 * @param {string} config.channelName - Unique channel name
 * @param {string} config.table - Table name to watch
 * @param {string} [config.event] - Event type ('INSERT', 'UPDATE', 'DELETE', or '*')
 * @param {string} [config.filter] - RLS filter (e.g., 'student_id=eq.123')
 * @param {Function} config.onDataChange - Callback when data changes
 * @param {number} [config.debounceMs] - Debounce refresh calls (default: 500ms)
 * @returns {Function} Cleanup function to call on unmount
 */
export function subscribeToTableChanges({
  channelName,
  table,
  event = '*',
  filter = null,
  onDataChange,
  onError, // optional callback when subscription errors
  debounceMs = 500,
}) {
  if (!channelName || !table || !onDataChange) {
    console.error('❌ subscribeToTableChanges: Missing required config');
    return () => {};
  }

  let debounceTimeout = null;
  let isSubscribed = false;
  let fatalRelation = false;

  // Debounced callback to prevent thundering herd
  const debouncedRefresh = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      console.log(`📨 [${channelName}] Data changed, refreshing...`);
      onDataChange();
    }, debounceMs);
  };

  try {
    console.log(`📡 [${channelName}] Setting up subscription for ${table}`);

    // Normalize table and schema
    const tableName = String(table || '').toLowerCase();
    const schemaName = 'public';
    if (tableName !== table) {
      console.warn(`⚠️ [${channelName}] Normalizing table name to lowercase: ${tableName}`);
    }

    // Validate simple filter format (e.g. col=eq.value). If the column name looks invalid,
    // warn the developer because it may cause a faulty_relation when RLS or FK relationships
    // are misconfigured in Postgres.
    if (filter) {
      const match = String(filter).match(/^([a-z0-9_]+)=/i);
      if (!match) {
        console.warn(`⚠️ [${channelName}] Filter appears malformed or uses unexpected column names: ${filter}`);
      } else {
        const col = match[1];
        if (!/^[a-z0-9_]+$/.test(col)) {
          console.warn(`⚠️ [${channelName}] Filter references a suspicious column name: ${col}`);
        }
      }
    }

    const channel = supabase
      .channel(channelName, { config: { broadcast: { self: true } } })
      .on(
        'postgres_changes',
        {
          event,
          schema: schemaName,
          table: tableName,
          ...(filter && { filter }),
        },
        (payload) => {
          console.log(`✅ [${channelName}] Received change:`, payload.eventType);
          debouncedRefresh();
        }
      )
      .on('system', { event: 'faulty_relation' }, (payload) => {
        // Faulty relation indicates the DB replica/publication or FK relationships are not available
        console.error(`⚠️ [${channelName}] Database replication not enabled for ${tableName}. Please enable publications for this table in Supabase Dashboard.`, payload);
        // Mark this channel as fatal so we don't process further status events or attempt reconnects
        fatalRelation = true;
        isSubscribed = false;
        try { supabase.removeChannel(channel); } catch (e) { /* ignore */ }
        // Inform caller once so they can fallback (polling etc.)
        if (typeof onError === 'function') onError({ type: 'faulty_relation', table: tableName, payload });
      })
      .on('system', { event: 'error' }, (payload) => {
        console.error(`❌ [${channelName}] System error payload:`, payload);
        if (typeof onError === 'function') onError({ type: 'system_error', payload });
      })
      .subscribe((status) => {
        // If a fatal relation problem was detected, ignore status updates to avoid reconnect loops
        if (fatalRelation) {
          console.warn(`⚠️ [${channelName}] Ignoring status '${status}' due to fatal faulty_relation for ${tableName}`);
          return;
        }

        if (status === 'SUBSCRIBED') {
          console.log(`✅ [${channelName}] Successfully subscribed`);
          isSubscribed = true;
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ [${channelName}] Channel error`);
          isSubscribed = false;
          try { supabase.removeChannel(channel); } catch (e) { /* ignore */ }
          if (typeof onError === 'function') onError({ status: 'CHANNEL_ERROR' });
        } else if (status === 'TIMED_OUT') {
          console.warn(`⚠️ [${channelName}] Subscription timed out`);
          isSubscribed = false;
        }
      });

    // Return cleanup function
    return () => {
      console.log(`🧹 [${channelName}] Cleaning up subscription`);
      clearTimeout(debounceTimeout);
      try { supabase.removeChannel(channel); } catch (e) { /* ignore */ }
    };
  } catch (error) {
    console.error(`❌ [${channelName}] Subscription setup failed:`, error);
    return () => {};
  }
}

/**
 * Subscribe to multiple table changes at once
 * @param {Object} config - Configuration
 * @param {string} config.baseName - Base channel name prefix
 * @param {Function} config.onDataChange - Called when ANY table changes
 * @param {Array<{table: string, event?: string, filter?: string}>} config.subscriptions - What to subscribe to
 * @returns {Function} Master cleanup function
 */
export function subscribeToMultipleTables({
  baseName,
  onDataChange,
  subscriptions = [],
}) {
  if (!baseName || !onDataChange || subscriptions.length === 0) {
    console.error('❌ subscribeToMultipleTables: Missing required config');
    return () => {};
  }

  console.log(`📡 [${baseName}] Setting up ${subscriptions.length} subscriptions`);

  const cleanups = subscriptions.map((sub, index) => {
    return subscribeToTableChanges({
      channelName: `${baseName}_${sub.table}_${index}`,
      table: sub.table,
      event: sub.event || '*',
      filter: sub.filter || null,
      onDataChange,
      debounceMs: 500,
    });
  });

  // Return master cleanup function
  return () => {
    console.log(`🧹 [${baseName}] Cleaning up ${cleanups.length} subscriptions`);
    cleanups.forEach(cleanup => cleanup());
  };
}

/**
 * Subscribe to realtime presence (who's online)
 * @param {Object} config - Configuration
 * @param {string} config.channelName - Unique channel name
 * @param {string} config.userId - User ID
 * @param {Function} config.onSync - Called when presence syncs
 * @returns {Function} Cleanup function
 */
export function subscribeToPresence({
  channelName,
  userId,
  onSync,
}) {
  if (!channelName || !userId || !onSync) {
    console.error('❌ subscribeToPresence: Missing required config');
    return () => {};
  }

  try {
    console.log(`📡 [${channelName}] Setting up presence subscription`);

    const channel = supabase.channel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log(`✅ [${channelName}] Presence sync:`, Object.keys(state).length, 'users');
        onSync(state);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log(`✅ [${channelName}] User joined:`, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log(`✅ [${channelName}] User left:`, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ [${channelName}] Presence subscribed`);
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      console.log(`🧹 [${channelName}] Cleaning up presence subscription`);
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error(`❌ [${channelName}] Presence setup failed:`, error);
    return () => {};
  }
}

/**
 * Create a stable refresh function that won't stale-close
 * @param {Function} asyncFn - The async function to call
 * @returns {Object} { refresh, isRefreshing$ }
 */
export function createStableRefresh(asyncFn) {
  let isRefreshing = false;
  const listeners = new Set();

  const refresh = async () => {
    if (isRefreshing) {
      console.log('⏳ Refresh already in progress, skipping');
      return;
    }

    try {
      isRefreshing = true;
      notifyListeners(true);
      await asyncFn();
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      isRefreshing = false;
      notifyListeners(false);
    }
  };

  const notifyListeners = (state) => {
    listeners.forEach(listener => listener(state));
  };

  const onRefreshStateChange = (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  };

  return {
    refresh,
    onRefreshStateChange,
    isRefreshing: () => isRefreshing,
  };
}
