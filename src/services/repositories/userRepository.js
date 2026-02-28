import BaseRepository from './baseRepository.js';
import { supabase } from '../../api/supabase.js';

export default class UserRepository extends BaseRepository {
  constructor({ supabaseClient } = {}) {
    super();
    this.client = supabaseClient || supabase;
  }

  async findById(id) {
    const { data, error } = await this.client.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async findByEmail(email) {
    const { data, error } = await this.client.from('users').select('*').ilike('email', email).single();
    if (error) throw error;
    return data;
  }
}
