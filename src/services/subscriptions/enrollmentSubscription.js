import { subscribeToTableChanges } from '../realtimeSubscriptionManager.js';

export function subscribeToEnrollmentChanges({ onDataChange }) {
  return subscribeToTableChanges({
    channelName: 'enrollments_changes',
    table: 'enrollments',
    event: '*',
    onDataChange,
  });
}
