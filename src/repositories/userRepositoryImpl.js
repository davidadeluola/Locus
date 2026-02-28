import { supabase } from '../api/supabase';

export const UserRepository = {
  async getProfileById(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching profile:', error);
      throw new Error(`Failed to fetch profile for user ${userId}`);
    }

    return data || null;
  },

  async fetchUserWithProfile(userId) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      throw new Error('Failed to fetch authenticated user');
    }

    const profile = await this.getProfileById(userId);

    return {
      user: user || { id: userId },
      profile,
    };
  },

  async fetchProfilesByIds(userIds) {
    if (!userIds || userIds.length === 0) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return [];
    }

    return data || [];
  },
};
