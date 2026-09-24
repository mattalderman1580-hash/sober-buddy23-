/**
 * Lightweight daily encouragement notifications (client / PWA).
 *
 * Approach: no push server and no scheduled service-worker alarms.
 * When the preference is on and Notification permission is granted, we fire
 * at most one local Notification per calendar day once the local time is at
 * or past the chosen reminder hour — checked on app open, focus, and
 * document visibility changes. The browser / installed PWA must be opened
 * (or foregrounded) for the reminder to appear.
 */

import { todayKey } from "@/lib/utils";

export const DEFAULT_NOTIFY_HOUR = 8;
export const DEFAULT_NOTIFY_MINUTE = 0;

export interface DailyMessage {
  title: string;
  body: string;
}

/** Warm, faith-friendly — one day at a time, keep head up, stay clean. */
export const DAILY_MESSAGES: readonly DailyMessage[] = [
  {
    title: "One day at a time",
    body: "You only have to walk today. Keep your head up — this day is a gift.",
  },
  {
    title: "Keep your head up",
    body: "Stay clean for this next stretch. Small faithfulness still counts.",
  },
  {
    title: "Celebrate this day",
    body: "Another sunrise sober. Breathe, thank God for the chance, and take the next right step.",
  },
  {
    title: "Stay clean today",
    body: "You do not have to finish the whole journey this morning. Just this day — one moment at a time.",
  },
  {
    title: "Steady and present",
    body: "God is near. Keep your chin up and stay with what is true for today.",
  },
  {
    title: "A clean start",
    body: "Celebrate the choice to stay free today. Your future self will thank you.",
  },
];

export type NotificationPermissionState = NotificationPermission | "unsupported";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return Notification.permission;
  }
}

export function pickDailyMessage(dateKey = todayKey()): DailyMessage {
  // Stable rotation by calendar day so the same day always shows the same copy.
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return DAILY_MESSAGES[hash % DAILY_MESSAGES.length]!;
}

export function formatNotifyTime(hour: number, minute: number): string {
  const h = Math.min(23, Math.max(0, Math.floor(hour)));
  const m = Math.min(59, Math.max(0, Math.floor(minute)));
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function pastNotifyTime(
  hour: number,
  minute: number,
  now = new Date(),
): boolean {
  const target = hour * 60 + minute;
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= target;
}

export interface MaybeNotifyArgs {
  enabled: boolean;
  hour: number;
  minute: number;
  lastNotifyDate: string;
  onNotified: (dateKey: string) => void;
  /** Force a notification even if already shown today (settings test). */
  force?: boolean;
}

export type MaybeNotifyResult =
  | { status: "shown"; message: DailyMessage }
  | { status: "skipped"; reason: string };

export function maybeShowDailyNotification(args: MaybeNotifyArgs): MaybeNotifyResult {
  if (!args.enabled && !args.force) {
    return { status: "skipped", reason: "disabled" };
  }
  if (!notificationsSupported()) {
    return { status: "skipped", reason: "unsupported" };
  }
  if (Notification.permission !== "granted") {
    return { status: "skipped", reason: "permission" };
  }

  const dateKey = todayKey();
  if (!args.force && args.lastNotifyDate === dateKey) {
    return { status: "skipped", reason: "already-today" };
  }
  if (!args.force && !pastNotifyTime(args.hour, args.minute)) {
    return { status: "skipped", reason: "before-time" };
  }

  const message = pickDailyMessage(dateKey);
  try {
    const notification = new Notification(message.title, {
      body: message.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "sober-buddy-daily",
    });
    notification.onclick = () => {
      try {
        window.focus();
      } catch {
        /* ignore */
      }
      notification.close();
    };
  } catch {
    return { status: "skipped", reason: "fire-failed" };
  }

  if (!args.force) {
    args.onNotified(dateKey);
  }
  return { status: "shown", message };
}
