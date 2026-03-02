const memoryStore = new Map();

function getLocalStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }

  return null;
}

function nowMs() {
  return Date.now();
}

function storageKey(key) {
  return `locus:rate-limit:${key}`;
}

function readTimestamps(key) {
  const namespacedKey = storageKey(key);
  const localStorageRef = getLocalStorage();

  try {
    if (!localStorageRef) {
      return memoryStore.get(namespacedKey) || [];
    }

    const raw = localStorageRef.getItem(namespacedKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => Number.isFinite(item)) : [];
  } catch {
    return memoryStore.get(namespacedKey) || [];
  }
}

function writeTimestamps(key, timestamps) {
  const namespacedKey = storageKey(key);
  const localStorageRef = getLocalStorage();

  try {
    if (!localStorageRef) {
      memoryStore.set(namespacedKey, timestamps);
      return;
    }

    localStorageRef.setItem(namespacedKey, JSON.stringify(timestamps));
  } catch {
    memoryStore.set(namespacedKey, timestamps);
  }
}

export function resetRateLimit(key) {
  writeTimestamps(key, []);
}

export function consumeRateLimit(key, { maxAttempts, windowMs }) {
  const currentTime = nowMs();
  const cutoff = currentTime - windowMs;
  const timestamps = readTimestamps(key).filter((item) => item > cutoff);

  if (timestamps.length >= maxAttempts) {
    const oldestInWindow = timestamps[0];
    const retryAfterMs = Math.max(0, oldestInWindow + windowMs - currentTime);
    return {
      allowed: false,
      retryAfterMs,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  const updated = [...timestamps, currentTime];
  writeTimestamps(key, updated);

  return {
    allowed: true,
    retryAfterMs: 0,
    retryAfterSeconds: 0,
  };
}
