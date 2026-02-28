import { supabase } from '../../api/supabase.js';

class SubscriptionManager {
  constructor() {
    this.subscriptions = new Map();
  }

  // Store a channel by key. If a channel exists, it's unsubscribed first.
  add(key, channel) {
    this.unsubscribe(key);
    this.subscriptions.set(key, channel);
    return key;
  }

  get(key) {
    return this.subscriptions.get(key);
  }

  unsubscribe(key) {
    const channel = this.subscriptions.get(key);
    if (channel) {
      try {
        // supabase client exposes removeChannel API
        supabase.removeChannel(channel);
      } catch (e) {
        // best-effort
      }
      this.subscriptions.delete(key);
    }
  }

  unsubscribeAll() {
    for (const key of Array.from(this.subscriptions.keys())) {
      this.unsubscribe(key);
    }
  }
}

const subscriptionManager = new SubscriptionManager();
export default subscriptionManager;
