class CacheManager {
  constructor() {
    this.map = new Map();
  }

  set(key, value, ttlMs = 0) {
    const expiresAt = ttlMs > 0 ? Date.now() + ttlMs : 0;
    const entry = { value, expiresAt };
    this.map.set(key, entry);
    if (ttlMs > 0) {
      setTimeout(() => {
        const e = this.map.get(key);
        if (e && e.expiresAt && e.expiresAt <= Date.now()) this.map.delete(key);
      }, ttlMs + 50);
    }
  }

  get(key, fallback = null) {
    const entry = this.map.get(key);
    if (!entry) return fallback;
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.map.delete(key);
      return fallback;
    }
    return entry.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    return this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}

const cacheManager = new CacheManager();
export default cacheManager;
