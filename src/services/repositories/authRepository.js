import { supabase } from '../../api/supabase.js';

const authRepository = {
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  async signInWithOAuth(provider, options = {}) {
    const { error } = await supabase.auth.signInWithOAuth({ provider }, options);
    if (error) throw error;
    return true;
  },

  async updateUser(updates) {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data;
  },

  // Wrapper for auth state change - returns unsubscribe
  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      try {
        callback(event, session);
      } catch (e) {
        // swallow handler errors
        // consumer should handle errors internally
        // but do not crash the listener
      }
    });
    return () => {
      try {
        data.subscription.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  },
};

export default authRepository;
