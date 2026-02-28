import cache from '../persistence/cacheManager.js';

const KEY = 'profile:';

export default {
  get(userId) {
    return cache.get(KEY + userId, null);
  },
  set(userId, profile, ttlMs = 1000 * 60 * 5) {
    return cache.set(KEY + userId, profile, ttlMs);
  },
  delete(userId) {
    return cache.delete(KEY + userId);
  },
};
