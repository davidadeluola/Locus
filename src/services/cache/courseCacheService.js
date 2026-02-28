import cache from '../persistence/cacheManager.js';

const KEY = 'courses:all';

export default {
  getAll() {
    return cache.get(KEY, null);
  },
  setAll(payload, ttlMs = 1000 * 60 * 2) {
    return cache.set(KEY, payload, ttlMs);
  },
  clear() {
    return cache.delete(KEY);
  },
};
