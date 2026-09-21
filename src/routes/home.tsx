import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  BookOpen,
  ClipboardList,
  Flag,
  Heart,
  LifeBuoy,
  Activity,
  ScrollText,
  Target,
  Users,
  Waypoints,
} from "lucide-react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Sparkline } from "@/components/sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { verseForDay } from "@/lib/scripture";
import { labelsFor } from "@/lib/struggles";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";
import { daysSince, todayKey } from "@/lib/utils";

export const Route = createFileRoute("/home")({ component: Home });

const LINKS = [
  { to: "/story", label: "Your Story", blurb: "Identity & faith", Icon: ScrollText },
  { to: "/patterns", label: "Triggers", blurb: "Behavior patterns", Icon: Waypoints },
  { to: "/checkin", label: "Check-In", blurb: "Daily signal", Icon: ClipboardList },
  { to: "/goals", label: "Goals", blurb: "Today + standing", Icon: Target },
  { to: "/faith", label: "God First", blurb: "Pray & hear it", Icon: BookOpen },
  { to: "/wall", label: "Prayer Circle", blurb: "Ask & encourage", Icon: Users },
  { to: "/slip", label: "After a Slip", blurb: "Learn, don't shame", Icon: Flag },
  { to: "/recovery", label: "Plan", blurb: "Date & contacts", Icon: Heart },
  { to: "/insights", label: "Data", blurb: "Trends", Icon: Activity },
  { to: "/help", label: "Get Help", blurb: "Call someone", Icon: LifeBuoy },
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
        <Metric label="Check-ins" value={String(checkins.length)} />
        <Metric label="Wins" value={String(wins.length)} />
      </div>

      <Card className="mt-3">
        <CardContent className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">URGE · LAST 14</p>
            <p className="font-mono text-xs tabular-nums text-muted-foreground">AVG {avg}</p>
          </div>
          <Sparkline values={series} />
          <p className="mt-1 text-xs text-muted-foreground">
            {labels.length ? labels.join(" · ") : "Select struggles to tailor support."}
          </p>
        </CardContent>
      </Card>

      {!story.narrative ? (
        <Link
          to="/story"
          className="mt-3 rounded-xl border border-border bg-muted px-4 py-3 text-sm"
        >
          Your Story is empty. Fill it so Buddy can speak to your actual life.
        </Link>
      ) : null}

      <Button asChild variant="crisis" size="xl" className="mt-4 w-full font-semibold">
        <Link to="/urge">I'm thinking about using</Link>
      </Button>

      {goalToday ? (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Today · <span className="text-foreground">{goalToday}</span>
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {LINKS.map(({ to, label, blurb, Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex min-h-[6.5rem] flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left"
          >
            <Icon className="size-4 text-primary" strokeWidth={1.75} />
            <span className="text-sm font-medium leading-snug">{label}</span>
            <span className="text-xs text-muted-foreground">{blurb}</span>
          </Link>
        ))}
      </div>

      <Card className="mt-4">
        <CardContent className="space-y-2 p-5">
          <Badge variant="secondary">Scripture</Badge>
          <p className="font-display text-lg font-medium leading-snug">“{verse.text}”</p>
          <p className="font-mono text-[10px] tracking-wide text-muted-foreground">{verse.ref}</p>
        </CardContent>
      </Card>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5 text-center">
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
    <div className="rounded-xl border border-border bg-card px-2 py-3 text-center">
      <p className="font-display text-2xl font-medium tabular-nums leading-none">{value}</p>
      <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-muted-foreground">{label}</p>
    </div>
  );
}
