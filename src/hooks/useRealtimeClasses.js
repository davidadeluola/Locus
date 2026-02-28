import { useEffect, useState, useRef } from 'react';
import repos from '../services/repositories/index.js';
import { subscribeToTableChanges } from '../services/realtimeSubscriptionManager.js';

// Hook: subscribe to classes for a lecturer; on subscription error fall back to polling every 30s
export default function useRealtimeClasses(lecturerId) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionFailed, setSubscriptionFailed] = useState(false);
  const pollingRef = useRef(null);
  const cleanupRef = useRef(null);
  const mountedRef = useRef(true);
  const hasErroredRef = useRef(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const data = await repos.courseRepository.findByLecturer(lecturerId);
      if (!mountedRef.current) return;
      setCourses(data || []);
      setError(null);
    } catch (e) {
      if (!mountedRef.current) return;
      console.error('useRealtimeClasses.fetch error', e);
      setError(e instanceof Error ? e : new Error('Failed to fetch classes'));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    if (!lecturerId) {
      setCourses([]);
      setLoading(false);
      return;
    }

    // initial load
    fetch();

    // onError handler: unsubscribe immediately and start polling fallback
    const onError = (payload) => {
      if (hasErroredRef.current) return; // already handled
      hasErroredRef.current = true;
      // Log a warning to prompt DB replication checks
      if (payload && payload.type === 'faulty_relation') {
        console.warn(`useRealtimeClasses: Database replication not enabled for ${payload.table}. Falling back to polling.`);
      } else if (payload && payload.type === 'system_error') {
        console.warn('useRealtimeClasses: Realtime system error encountered. Falling back to polling.', payload);
      } else {
        console.warn('useRealtimeClasses: Subscription error, falling back to polling', payload);
      }

      setSubscriptionFailed(true);

      // Ensure we remove any existing subscription to stop websocket retries
      try {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      } catch (e) {
        // ignore
      }

      // clear existing polling if any
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        fetch();
      }, 30_000);
    };

    // Setup subscription. subscribeToTableChanges returns a cleanup function
    try {
      // If we've already seen a fatal error, skip subscribing and start polling
      if (hasErroredRef.current) {
        onError({ type: 'previous_error' });
      } else {
        const cleanup = subscribeToTableChanges({
          channelName: `realtime_classes_${lecturerId}`,
          table: 'classes',
          event: '*',
          filter: `lecturer_id=eq.${lecturerId}`,
          onDataChange: fetch,
          onError,
          debounceMs: 500,
        });
        cleanupRef.current = cleanup;
      }
    } catch (e) {
      console.warn('useRealtimeClasses: subscribe failed, starting polling', e);
      onError({ type: 'subscribe_exception', payload: e });
    }

    return () => {
      mountedRef.current = false;
      // cleanup subscription
      try {
        if (cleanupRef.current) cleanupRef.current();
      } catch (e) {}
      // cleanup polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [lecturerId]);

  return { courses, loading, error, subscriptionFailed, refresh: fetch };
}
