import StorageManager from '../../services/persistence/storageManager.js';

export default function useSessionsPersistence() {
  const KEY = 'locus:sessions';

  function save(sessions) {
    StorageManager.set(KEY, sessions);
  }

  function load() {
    return StorageManager.get(KEY) || [];
  }

  return { save, load };
}
