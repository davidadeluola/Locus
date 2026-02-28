import { supabase } from '../api/supabase';

export const SessionRepository = {
  async findByLecturer(lecturerId, options = {}) {
    const { limit = 10, orderBy = 'created_at' } = options;

    const { data, error } = await supabase
      .from('sessions')
      .select('*, classes(course_code, course_title)')
      .eq('lecturer_id', lecturerId)
      .order(orderBy, { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching sessions:', error);
      throw new Error('Failed to fetch sessions');
    }

    return data || [];
  },

  async getById(sessionId) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('❌ Error fetching session:', error);
      throw new Error(`Failed to fetch session ${sessionId}`);
    }

    return data;
  },

  async create(data) {
    const { data: session, error } = await supabase
      .from('sessions')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating session:', error);
      throw new Error('Failed to create session');
    }

    return session;
  },

  async getActiveByLecturer(lecturerId) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('lecturer_id', lecturerId)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching active session:', error);
      return null;
    }

    return data || null;
  },
};
