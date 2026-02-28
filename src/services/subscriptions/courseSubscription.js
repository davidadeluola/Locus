import { supabase } from '../../api/supabase.js';
import subscriptionManager from './subscriptionManager.js';

export function subscribeToCourses({ onChange } = {}) {
  const key = 'courses:all';
  const channel = supabase
    .channel(key)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, (payload) => onChange?.(payload))
    .subscribe();

  subscriptionManager.add(key, channel);
  return () => subscriptionManager.unsubscribe(key);
}
import { subscribeToTableChanges } from '../realtimeSubscriptionManager.js';

export function subscribeToCourseChanges({ onDataChange }) {
  return subscribeToTableChanges({
    channelName: 'courses_changes',
    table: 'courses',
    event: '*',
    onDataChange,
  });
}
