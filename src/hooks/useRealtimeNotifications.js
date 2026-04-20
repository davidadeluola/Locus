import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../api/supabase";

const MAX_NOTIFICATIONS = 20;
const LOCAL_NOTIFICATION_EVENT = "locus:local-notification";

function makeNotification({ title, message, type = "info", createdAt = new Date().toISOString() }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    message,
    type,
    createdAt,
  };
}

export function emitLocalNotification(notificationInput) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(LOCAL_NOTIFICATION_EVENT, {
      detail: notificationInput,
    })
  );
}

export default function useRealtimeNotifications({ userId, role, activeSessionId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const pushNotification = useCallback((notificationInput) => {
    const next = makeNotification(notificationInput);
    setNotifications((prev) => [next, ...prev].slice(0, MAX_NOTIFICATIONS));
    setUnreadCount((prev) => prev + 1);
  }, []);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    const onLocalNotification = (event) => {
      const detail = event?.detail;
      if (!detail?.title || !detail?.message) return;
      pushNotification(detail);
    };

    if (typeof window === "undefined") return undefined;
    window.addEventListener(LOCAL_NOTIFICATION_EVENT, onLocalNotification);
    return () => {
      window.removeEventListener(LOCAL_NOTIFICATION_EVENT, onLocalNotification);
    };
  }, [pushNotification]);

  useEffect(() => {
    if (!userId || !role) return undefined;

    const channels = [];

    if (role === "lecturer") {
      const sessionsChannel = supabase
        .channel(`notif_sessions_${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "sessions",
            filter: `lecturer_id=eq.${userId}`,
          },
          (payload) => {
            pushNotification({
              title: "Session Created",
              message: `A new attendance session is now live (${payload.new?.otp_secret || "OTP ready"}).`,
              type: "success",
              createdAt: payload.new?.created_at,
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "sessions",
            filter: `lecturer_id=eq.${userId}`,
          },
          (payload) => {
            const isExpired = payload.new?.expires_at && new Date(payload.new.expires_at).getTime() <= Date.now();
            pushNotification({
              title: isExpired ? "Session Ended" : "Session Updated",
              message: isExpired
                ? "A session expired or was terminated."
                : "Session OTP or expiry time was updated.",
              type: isExpired ? "warning" : "info",
              createdAt: payload.new?.expires_at || payload.new?.updated_at,
            });
          }
        )
        .subscribe();

      channels.push(sessionsChannel);

      if (activeSessionId) {
        const attendanceChannel = supabase
          .channel(`notif_attendance_${activeSessionId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "attendance_logs",
              filter: `session_id=eq.${activeSessionId}`,
            },
            (payload) => {
              const distance = payload.new?.distance_meters;
              pushNotification({
                title: "New Check-In",
                message:
                  typeof distance === "number"
                    ? `A student checked in (${Math.round(distance)}m from class center).`
                    : "A student checked in to your active session.",
                type: "success",
                createdAt: payload.new?.signed_at,
              });
            }
          )
          .subscribe();

        channels.push(attendanceChannel);
      }
    }

    if (role === "student") {
      const studentChannel = supabase
        .channel(`notif_student_attendance_${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "attendance_logs",
            filter: `student_id=eq.${userId}`,
          },
          (payload) => {
            pushNotification({
              title: "Attendance Recorded",
              message: "Your attendance was recorded successfully.",
              type: "success",
              createdAt: payload.new?.signed_at,
            });
          }
        )
        .subscribe();

      channels.push(studentChannel);
    }

    return () => {
      channels.forEach((channel) => {
        try {
          supabase.removeChannel(channel);
        } catch (_error) {
          // Ignore cleanup errors from stale channels.
        }
      });
    };
  }, [activeSessionId, pushNotification, role, userId]);

  const hasUnread = unreadCount > 0;

  return useMemo(
    () => ({ notifications, unreadCount, hasUnread, markAllRead }),
    [notifications, unreadCount, hasUnread, markAllRead]
  );
}
