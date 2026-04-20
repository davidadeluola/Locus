import { useEffect } from "react";

const DEFAULT_GUARD_MESSAGE =
  "You have an active attendance flow. Leave this page anyway?";

export default function useBackNavigationGuard(enabled, message = DEFAULT_GUARD_MESSAGE) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;

    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const onPopState = () => {
      const shouldLeave = window.confirm(message);
      if (!shouldLeave) {
        window.history.pushState({ locusGuard: true }, "", window.location.href);
      }
    };

    window.history.pushState({ locusGuard: true }, "", window.location.href);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPopState);
    };
  }, [enabled, message]);
}
