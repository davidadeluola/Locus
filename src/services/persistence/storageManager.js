const PREFIX = 'locus:';

const storage = {
  _getStorage(type) {
    if (type === 'session') return window.sessionStorage;
    return window.localStorage;
  },

  set(key, value, { type = 'local' } = {}) {
    try {
      const raw = JSON.stringify(value);
      this._getStorage(type).setItem(PREFIX + key, raw);
      return true;
    } catch (e) {
      console.warn('storage set failed', e);
      return false;
    }
  },

  get(key, { type = 'local', fallback = null } = {}) {
    try {
      const raw = this._getStorage(type).getItem(PREFIX + key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('storage get failed', e);
      return fallback;
    }
  },

  remove(key, { type = 'local' } = {}) {
    try {
      this._getStorage(type).removeItem(PREFIX + key);
      return true;
    } catch (e) {
      console.warn('storage remove failed', e);
      return false;
    }
  },

  clearAll({ type = 'local' } = {}) {
    try {
      const s = this._getStorage(type);
      const keys = [];
      for (let i = 0; i < s.length; i++) {
        const k = s.key(i);
        if (k && k.startsWith(PREFIX)) keys.push(k);
      }
      keys.forEach((k) => s.removeItem(k));
      return true;
    } catch (e) {
      console.warn('storage clear failed', e);
      return false;
    }
  },
};

export default storage;
// Abstraction over localStorage/sessionStorage
const StorageManager = {
  set(key, value, { session = false } = {}) {
    const serialized = JSON.stringify(value);
    if (session) sessionStorage.setItem(key, serialized);
    else localStorage.setItem(key, serialized);
  },
  get(key, { session = false } = {}) {
    const raw = session ? sessionStorage.getItem(key) : localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  remove(key, { session = false } = {}) {
    if (session) sessionStorage.removeItem(key);
    else localStorage.removeItem(key);
  },
};

export default StorageManager;
