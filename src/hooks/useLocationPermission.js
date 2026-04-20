import { useCallback, useEffect, useState } from "react";

const DEFAULT_STATE = "unknown";

export default function useLocationPermission() {
  const [permissionState, setPermissionState] = useState(DEFAULT_STATE);
  const [permissionsSupported, setPermissionsSupported] = useState(true);
  const [isSecure, setIsSecure] = useState(typeof window !== "undefined" ? window.isSecureContext : true);

  const refreshPermission = useCallback(async () => {
    if (typeof window !== "undefined") {
      setIsSecure(window.isSecureContext);
    }

    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      setPermissionsSupported(false);
      setPermissionState(DEFAULT_STATE);
      return;
    }

    try {
      const status = await navigator.permissions.query({ name: "geolocation" });
      setPermissionsSupported(true);
      setPermissionState(status.state || DEFAULT_STATE);

      status.onchange = () => {
        setPermissionState(status.state || DEFAULT_STATE);
      };
    } catch (_error) {
      setPermissionsSupported(false);
      setPermissionState(DEFAULT_STATE);
    }
  }, []);

  useEffect(() => {
    refreshPermission();
  }, [refreshPermission]);

  return {
    permissionState,
    permissionsSupported,
    isSecure,
    refreshPermission,
  };
}
