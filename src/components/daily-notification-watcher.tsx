import { useEffect } from "react";
import { maybeShowDailyNotification } from "@/lib/daily-notifications";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

/**
 * Runs the lightweight daily-reminder check whenever the app is open or
 * becomes visible again. Safe on SSR (no-ops until hydrated).
 */
export function DailyNotificationWatcher() {
  const hydrated = useHasHydrated();
  const enabled = useAppStore((s) => s.dailyEncouragementEnabled);
  const hour = useAppStore((s) => s.dailyNotifyHour);
  const minute = useAppStore((s) => s.dailyNotifyMinute);
  const lastNotifyDate = useAppStore((s) => s.lastDailyNotifyDate);
  const markDailyNotified = useAppStore((s) => s.markDailyNotified);

  useEffect(() => {
    if (!hydrated || !enabled) return;

    const run = () => {
      maybeShowDailyNotification({
        enabled,
        hour,
        minute,
        lastNotifyDate: useAppStore.getState().lastDailyNotifyDate,
        onNotified: markDailyNotified,
      });
    };

    run();
    const onVis = () => {
      if (document.visibilityState === "visible") run();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", run);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", run);
    };
  }, [hydrated, enabled, hour, minute, lastNotifyDate, markDailyNotified]);

  return null;
}
