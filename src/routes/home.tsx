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
import { Sparkline } from "@/components/sparkline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { verseForDay } from "@/lib/scripture";
import { labelsFor } from "@/lib/struggles";
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
  const onboarded = useAppStore((s) => s.onboarded);
  const struggles = useAppStore((s) => s.struggles);
  const plan = useAppStore((s) => s.plan);
  const wins = useAppStore((s) => s.wins);
  const goal = useAppStore((s) => s.goal);
  const checkins = useAppStore((s) => s.checkins);
  const story = useAppStore((s) => s.story);
  const recordWin = useAppStore((s) => s.recordWin);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  const days = plan.startDate ? daysSince(plan.startDate) : null;
  const verse = verseForDay();
  const labels = labelsFor(struggles);
  const goalToday = goal.date === todayKey() ? goal.text : "";
  const series = [...checkins].slice(0, 14).reverse().map((c) => c.urge);
  const avg =
    series.length > 0 ? (series.reduce((a, b) => a + b, 0) / series.length).toFixed(1) : "—";

  return (
    <AppFrame brand showSettings>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="Days" value={days === null ? "—" : String(days)} />
        <Metric label="Chk-in" value={String(checkins.length)} />
        <Metric label="Wins" value={String(wins.length)} />
      </div>

      <Card className="mt-3">
        <CardContent className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">URGE · 14 SAMPLES</p>
            <p className="font-mono text-xs tabular-nums text-muted-foreground">AVG {avg}</p>
          </div>
          <Sparkline values={series} />
          <p className="mt-2 text-xs text-muted-foreground">
            {labels.length ? labels.join(" · ") : "Select struggles to tailor support."}
          </p>
        </CardContent>
      </Card>

      {!story.narrative ? (
        <Link
          to="/story"
          className="mt-3 rounded-lg border border-border bg-muted px-4 py-3 text-sm"
        >
          Story module empty. Fill it so Buddy can speak to your actual life.
        </Link>
      ) : null}

      <Button asChild variant="crisis" size="xl" className="mt-4 w-full font-semibold">
        <Link to="/urge">I'm thinking about using</Link>
      </Button>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button asChild variant="secondary" className="h-11">
          <Link to="/wall">Prayer circle</Link>
        </Button>
        <Button asChild variant="outline" className="h-11">
          <Link to="/people">Send to people</Link>
        </Button>
      </div>

      {goalToday ? (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Today · <span className="text-foreground">{goalToday}</span>
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {LINKS.map(({ to, label, blurb, Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex min-h-[6.25rem] flex-col items-start gap-2 rounded-xl border border-border bg-card p-3.5 text-left"
          >
            <Icon className="size-4 text-primary" strokeWidth={1.75} />
            <span className="text-sm font-medium leading-snug">{label}</span>
            <span className="text-xs text-muted-foreground">{blurb}</span>
          </Link>
        ))}
      </div>

      <Card className="mt-4">
        <CardContent className="space-y-2 p-4">
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">DAILY WORD</p>
          <p className="text-sm leading-relaxed">“{verse.text}”</p>
          <p className="font-mono text-[10px] tracking-wide text-muted-foreground">{verse.ref}</p>
        </CardContent>
      </Card>

      <div className="mt-4 rounded-xl border border-border bg-card p-4 text-center">
        <p className="text-sm font-medium">Made it through an urge?</p>
        <Button
          className="mt-3 w-full"
          onClick={() => {
            recordWin();
            toast("Logged. One urge at a time. Keep God first.");
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
    <div className="rounded-lg border border-border bg-card px-2 py-3 text-center">
      <p className="text-2xl font-medium tabular-nums leading-none tracking-tight">{value}</p>
      <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-muted-foreground">{label}</p>
    </div>
  );
}
