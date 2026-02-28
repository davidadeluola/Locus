import cache from '../persistence/cacheManager.js';

const KEY = 'session:';

export default {
  get(sessionId) {
    return cache.get(KEY + sessionId, null);
  },
  set(sessionId, value, ttlMs = 1000 * 60) {
    return cache.set(KEY + sessionId, value, ttlMs);
  },
  delete(sessionId) {
    return cache.delete(KEY + sessionId);
  },
};
