import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { Bell, LifeBuoy, Shield, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AI_PAYLOAD_BLURB } from "@/components/ai-disclosure";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserButton } from "@/lib/auth/gates";
import { COMPANION_SENT_SUMMARY } from "@/lib/companion";
import {
  formatNotifyTime,
  getNotificationPermission,
  maybeShowDailyNotification,
  notificationsSupported,
  requestNotificationPermission,
  type NotificationPermissionState,
} from "@/lib/daily-notifications";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const resetAll = useAppStore((s) => s.resetAll);
  const resetChat = useAppStore((s) => s.resetChat);
  const clearCheckins = useAppStore((s) => s.clearCheckins);
  const enabled = useAppStore((s) => s.dailyEncouragementEnabled);
  const hour = useAppStore((s) => s.dailyNotifyHour);
  const minute = useAppStore((s) => s.dailyNotifyMinute);
  const lastNotifyDate = useAppStore((s) => s.lastDailyNotifyDate);
  const setDailyEncouragement = useAppStore((s) => s.setDailyEncouragement);
  const setDailyNotifyTime = useAppStore((s) => s.setDailyNotifyTime);
  const markDailyNotified = useAppStore((s) => s.markDailyNotified);
  const navigate = useNavigate();

  const [permission, setPermission] = useState<NotificationPermissionState>("default");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setPermission(getNotificationPermission());
  }, [hydrated, enabled]);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  const supported = notificationsSupported();
  const denied = permission === "denied";
  const unsupported = permission === "unsupported" || !supported;
  const timeValue = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  async function onToggle(next: boolean) {
    if (busy) return;
    if (!next) {
      setDailyEncouragement(false);
      toast("Daily encouragement turned off.");
      return;
    }

    if (unsupported) {
      setDailyEncouragement(false);
      toast("This browser does not support notifications.");
      return;
    }

    setBusy(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result !== "granted") {
        setDailyEncouragement(false);
        if (result === "denied") {
          toast("Notifications blocked — enable them in your browser settings.");
        } else {
          toast("Permission needed to send daily reminders.");
        }
        return;
      }
      setDailyEncouragement(true);
      toast(`Daily encouragement on — around ${formatNotifyTime(hour, minute)}.`);
      // If we're already past the reminder time today, surface one now.
      maybeShowDailyNotification({
        enabled: true,
        hour,
        minute,
        lastNotifyDate: useAppStore.getState().lastDailyNotifyDate,
        onNotified: markDailyNotified,
      });
    } finally {
      setBusy(false);
    }
  }

  function onTimeChange(value: string) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value);
    if (!match) return;
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    setDailyNotifyTime(h, m);
  }

  function sendTest() {
    if (permission !== "granted") {
      toast("Turn on daily encouragement first so permission is granted.");
      return;
    }
    const result = maybeShowDailyNotification({
      enabled: true,
      hour,
      minute,
      lastNotifyDate,
      onNotified: markDailyNotified,
      force: true,
    });
    if (result.status === "shown") {
      toast("Test encouragement sent.");
    } else {
      toast("Could not show a notification right now.");
    }
  }

  return (
    <AppFrame title="Settings">
      <Card className="mb-4">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-medium">Account</p>
            <p className="text-xs text-muted-foreground">Sign out when you are done on a shared device.</p>
          </div>
          <UserButton />
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Bell className="size-4 shrink-0" />
                Daily encouragement
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                One day at a time — a gentle morning reminder to keep your head up, stay clean, and
                celebrate this day.
              </p>
            </div>
            <Switch
              checked={enabled}
              disabled={busy || unsupported}
              onCheckedChange={(v) => void onToggle(v)}
              aria-label="Daily encouragement"
            />
          </div>

          {unsupported ? (
            <p className="rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              Notifications are not available in this browser. Try Chrome or Edge on your phone, or
              add Sober Buddy to your home screen.
            </p>
          ) : null}

          {denied ? (
            <p className="rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              Notifications are blocked. In your browser settings, allow notifications for this site,
              then turn the toggle back on. On Chrome: lock icon or site settings → Notifications →
              Allow.
            </p>
          ) : null}

          {enabled && !denied && !unsupported ? (
            <div className="space-y-3 border-t border-border pt-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="daily-notify-time">Reminder time</Label>
                  <Input
                    id="daily-notify-time"
                    type="time"
                    value={timeValue}
                    onChange={(e) => onTimeChange(e.target.value)}
                    className="w-[9.5rem]"
                  />
                </div>
                <p className="pb-2 text-xs text-muted-foreground">
                  Local time · defaults to {formatNotifyTime(8, 0)}
                </p>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Reminder fires the next time you open or return to the app after that time (no
                push server). Keep the tab or home-screen app handy.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={sendTest}>
                Send a test encouragement
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mb-4 border-crisis/20">
        <CardContent className="space-y-3 p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <LifeBuoy className="size-4 shrink-0 text-crisis" />
            Get help now · Talk to a real person
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            In an emergency, call local emergency services (911 in the U.S.). Sober Buddy does not
            provide therapy or crisis counseling.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild variant="crisis" className="w-full">
              <a href="tel:911">Call 911 — emergency</a>
            </Button>
            <Button asChild className="w-full">
              <a href="tel:988">Call 988 — Suicide &amp; Crisis Lifeline</a>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <a href="sms:988">Text 988</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="tel:18006624357">SAMHSA 1-800-662-HELP (4357)</a>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link to="/help">More options &amp; your saved contacts</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="space-y-3 p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Shield className="size-4 shrink-0" />
            Privacy &amp; AI
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Sober Buddy&apos;s AI is a support tool, not a therapist, sponsor, clergy, doctor, or
            emergency service. It does not replace professional care, a recovery fellowship, or
            people who know you. If you are in danger, reach a real person and local emergency
            services.
          </p>
          <p className="text-xs font-medium text-foreground">What we store on this device</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Your story, check-ins, triggers, recovery plan, slips, journal, local prayers, goals,
            wins, and notification preferences stay in this browser&apos;s local storage. Urge AI
            chat is kept only for the current session and is not saved long-term. Account sign-in
            uses your auth provider. The prayer circle is a public board (first names / handles you
            choose) stored on the server when you post.
          </p>
          <p className="text-xs font-medium text-foreground">What is sent to a model (when AI is on)</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {COMPANION_SENT_SUMMARY.whenConfigured}
          </p>
          <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
            {AI_PAYLOAD_BLURB.sent.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="text-xs font-medium text-foreground">Not sent</p>
          <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
            {AI_PAYLOAD_BLURB.notSent.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link to="/story">Your story</Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link to="/onboarding">Change setup (name, struggles, triggers)</Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link to="/patterns">Edit trigger ranking</Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link to="/recovery">Edit recovery plan</Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link to="/wall">Prayer circle</Link>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            resetChat();
            toast("Urge chat cleared for this session.");
          }}
        >
          Clear Urge AI chat
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            clearCheckins();
            toast("Check-in history cleared.");
          }}
        >
          Clear check-in history
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-destructive"
          onClick={() => {
            resetAll();
            toast("Local data cleared.");
            navigate({ to: "/" });
          }}
        >
          Reset all local data
        </Button>
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-2 p-5">
          <p className="flex items-center gap-2 font-medium">
            <Smartphone className="size-4" />
            Update on your phone
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Publish this version, open it in Chrome on Android, then Add to Home screen again so
            the new pages replace the old shortcut.
          </p>
        </CardContent>
      </Card>
    </AppFrame>
  );
}
