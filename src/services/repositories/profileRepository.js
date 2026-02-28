import BaseRepository from './baseRepository.js';
import { supabase } from '../../api/supabase.js';

export default class ProfileRepository extends BaseRepository {
  constructor({ supabaseClient } = {}) {
    super();
    this.client = supabaseClient || supabase;
  }

  async findByUserId(userId) {
    const { data, error } = await this.client.from('profiles').select('*').eq('user_id', userId).single();
    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await this.client.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async updateByUserId(userId, payload) {
    const { data, error } = await this.client.from('profiles').update(payload).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  }
}
