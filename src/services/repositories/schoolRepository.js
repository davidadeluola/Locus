import BaseRepository from './baseRepository.js';

export default class SchoolRepository extends BaseRepository {
  constructor({ supabaseClient } = {}) {
    super();
    this.client = supabaseClient;
  }

  async findById(id) {
    const { data, error } = await this.client.from('schools').select('id, name').eq('id', id).maybeSingle();
    if (error) throw error;
    return data || null;
  }
}
