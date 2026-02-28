import { toast } from 'sonner';

const DEDUPE_WINDOW_MS = 1200;
const shownAt = new Map();

function canShow(type, message) {
  const text = String(message || '').trim();
  if (!text) return false;
  const key = `${type}:${text}`;
  const now = Date.now();
  const last = shownAt.get(key) || 0;
  if (now - last < DEDUPE_WINDOW_MS) return false;
  shownAt.set(key, now);
  return true;
}

function notifyOnce(type, message) {
  const text = String(message || '').trim();
  if (!canShow(type, text)) return;

  const options = {
    id: `${type}:${text}`,
    duration: 2500,
  };

  if (type === 'success') {
    toast.success(text, options);
    return;
  }
  if (type === 'error') {
    toast.error(text, options);
    return;
  }
  toast(text, options);
}

const notify = {
  success(message) {
    notifyOnce('success', message);
  },
  error(message) {
    notifyOnce('error', message);
  },
  info(message) {
    notifyOnce('info', message);
  },
};

export default notify;
