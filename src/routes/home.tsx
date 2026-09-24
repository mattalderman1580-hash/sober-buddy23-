import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  Activity,
  BookMarked,
  BookOpen,
  ClipboardList,
  Flag,
  Heart,
  LifeBuoy,
  ListTree,
  NotebookPen,
  ScrollText,
  Send,
  ShieldAlert,
  Target,
  Users,
  Waypoints,
} from "lucide-react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { NeedHelpNow } from "@/components/need-help-now";
import { Sparkline } from "@/components/sparkline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { orderLinks, personalize } from "@/lib/personalize";
import { verseForDay } from "@/lib/scripture";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";
import { daysSince, todayKey } from "@/lib/utils";

export const Route = createFileRoute("/home")({ component: Home });

const LINKS = [
  { to: "/wall", label: "Circle", blurb: "Prayer feed", Icon: Users },
  { to: "/people", label: "People", blurb: "Text a request", Icon: Send },
  { to: "/urge", label: "Urge mode", blurb: "Stay with me", Icon: ShieldAlert },
  { to: "/story", label: "Story", blurb: "Identity & faith", Icon: ScrollText },
  { to: "/patterns", label: "Triggers", blurb: "Behavior map", Icon: Waypoints },
  { to: "/checkin", label: "Check-in", blurb: "Daily signal", Icon: ClipboardList },
  { to: "/goals", label: "Goals", blurb: "Today + standing", Icon: Target },
  { to: "/faith", label: "God First", blurb: "Pray & hear it", Icon: BookOpen },
  { to: "/scripture", label: "Scripture", blurb: "KJV library", Icon: BookMarked },
  { to: "/journal", label: "Journal", blurb: "Private log", Icon: NotebookPen },
  { to: "/slip", label: "After a slip", blurb: "Learn, no shame", Icon: Flag },
  { to: "/log", label: "Event log", blurb: "Merged timeline", Icon: ListTree },
  { to: "/recovery", label: "Plan", blurb: "Date & contacts", Icon: Heart },
  { to: "/insights", label: "Telemetry", blurb: "Urge trends", Icon: Activity },
  { to: "/help", label: "Get help", blurb: "Call someone", Icon: LifeBuoy },
] as const;

function Home() {
  const hydrated = useHasHydrated();
  const { user, isPending } = useCurrentUserState();
  const onboarded = useAppStore((s) => s.onboarded);
  const struggles = useAppStore((s) => s.struggles);
  const plan = useAppStore((s) => s.plan);
  const wins = useAppStore((s) => s.wins);
  const goal = useAppStore((s) => s.goal);
  const checkins = useAppStore((s) => s.checkins);
  const story = useAppStore((s) => s.story);
  const displayName = useAppStore((s) => s.displayName);
  const recordWin = useAppStore((s) => s.recordWin);

  if (!hydrated || isPending) return <LoadingScreen />;
  if (!user) return <RedirectToSignIn />;
  if (!onboarded) return <Navigate to="/onboarding" />;

  const persona = personalize(struggles);
  const links = orderLinks(LINKS, persona.emphasize);
  const days = plan.startDate ? daysSince(plan.startDate) : null;
  const verse = verseForDay();
  const goalToday = goal.date === todayKey() ? goal.text : "";
  const series = [...checkins].slice(0, 14).reverse().map((c) => c.urge);
  const avg =
    series.length > 0 ? (series.reduce((a, b) => a + b, 0) / series.length).toFixed(1) : "—";
  const greeting = displayName || story.called;

  return (
    <AppFrame brand showSettings>
      {greeting ? (
        <p className="mb-3 text-sm text-muted-foreground">
          Welcome back, <span className="text-foreground">{greeting}</span>
        </p>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        <Metric label="Days" value={days === null ? "—" : String(days)} />
        <Metric label="Chk-in" value={String(checkins.length)} />
        <Metric label="Wins" value={String(wins.length)} />
      </div>

      <Card className="mt-3">
        <CardContent className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {persona.primaryFocus}
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">Avg urge {avg}</p>
          </div>
          <Sparkline values={series} />
          <p className="mt-2 text-xs text-muted-foreground">{persona.homeSubtitle}</p>
        </CardContent>
      </Card>

      {!story.narrative ? (
        <Link
          to="/story"
          className="mt-3 rounded-xl bg-secondary px-4 py-3 text-sm text-secondary-foreground"
        >
          {persona.empty.story}
        </Link>
      ) : null}

      <Button asChild variant="crisis" size="xl" className="mt-4 w-full font-semibold">
        <Link to="/urge">{persona.crisisCta}</Link>
      </Button>

      <NeedHelpNow variant="banner" className="mt-3" />

      <div className="mt-3 grid grid-cols-2 gap-2">
        {persona.faithFirst ? (
          <>
            <Button asChild variant="secondary" className="h-11">
              <Link to="/faith">God First</Link>
            </Button>
            <Button asChild variant="outline" className="h-11">
              <Link to="/scripture">Scripture</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="secondary" className="h-11">
              <Link to="/people">Reach people</Link>
            </Button>
            <Button asChild variant="outline" className="h-11">
              <Link to="/help">Get help</Link>
            </Button>
          </>
        )}
      </div>

      {goalToday ? (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Today · <span className="text-foreground">{goalToday}</span>
        </p>
      ) : (
        <p className="mt-3 text-center text-xs text-muted-foreground">{persona.empty.goals}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {links.map(({ to, label, blurb, Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex min-h-[6.25rem] flex-col items-start gap-2 rounded-xl bg-card p-3.5 text-left shadow-border"
          >
            <Icon className="size-4 text-primary" strokeWidth={1.75} />
            <span className="text-sm font-medium leading-snug">{label}</span>
            <span className="text-xs text-muted-foreground">{blurb}</span>
          </Link>
        ))}
      </div>

      <Card className="mt-4">
        <CardContent className="space-y-2 p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Daily word</p>
          <p className="text-sm leading-relaxed">“{verse.text}”</p>
          <p className="text-xs text-muted-foreground">{verse.ref}</p>
        </CardContent>
      </Card>

      <div className="mt-4 rounded-xl bg-card p-4 text-center shadow-border">
        <p className="text-sm font-medium">Made it through a hard moment?</p>
        <Button
          className="mt-3 w-full"
          onClick={() => {
            recordWin();
            toast("Logged. One moment at a time. Keep God first.");
          }}
        >
          I made it through
        </Button>
      </div>
    </AppFrame>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card px-2 py-3 text-center shadow-border">
      <p className="font-display text-2xl font-medium tabular-nums leading-none tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    </div>
  );
}
