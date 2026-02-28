import { supabase } from '../../api/supabase.js';
import subscriptionManager from './subscriptionManager.js';

export function subscribeToAttendance(sessionId, { onInsert, onUpdate, onDelete } = {}) {
  if (!sessionId) throw new Error('sessionId required');
  const key = `attendance:session:${sessionId}`;

  const channel = supabase
    .channel(key)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_logs', filter: `session_id=eq.${sessionId}` }, (payload) => onInsert?.(payload))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'attendance_logs', filter: `session_id=eq.${sessionId}` }, (payload) => onUpdate?.(payload))
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'attendance_logs', filter: `session_id=eq.${sessionId}` }, (payload) => onDelete?.(payload))
    .subscribe();

  subscriptionManager.add(key, channel);
  return () => subscriptionManager.unsubscribe(key);
}
import { subscribeToTableChanges } from '../realtimeSubscriptionManager.js';

export function subscribeToAttendanceChanges({ onDataChange }) {
  return subscribeToTableChanges({
    channelName: 'attendance_changes',
    table: 'attendance_logs',
    event: '*',
    onDataChange,
  });
}
