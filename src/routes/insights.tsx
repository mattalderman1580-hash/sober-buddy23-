import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Sparkline } from "@/components/sparkline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";
import { daysSince, todayKey } from "@/lib/utils";

export const Route = createFileRoute("/insights")({ component: Insights });

function Insights() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const plan = useAppStore((s) => s.plan);
  const checkins = useAppStore((s) => s.checkins);
  const wins = useAppStore((s) => s.wins);
  const triggers = useAppStore((s) => s.triggers);
  const slips = useAppStore((s) => s.slips);
  const standing = useAppStore((s) => s.standingGoals);
  const goal = useAppStore((s) => s.goal);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  const days = plan.startDate ? daysSince(plan.startDate) : null;
  const series = [...checkins].slice(0, 21).reverse().map((c) => c.urge);
  const avg =
    series.length > 0 ? (series.reduce((a, b) => a + b, 0) / series.length).toFixed(1) : "—";
  const high = series.length ? Math.max(...series) : 0;
  const ranked = [...triggers].sort((a, b) => b.hits - a.hits).slice(0, 6);
  const maxHits = Math.max(1, ...ranked.map((t) => t.hits));
  const openGoals = standing.filter((g) => !g.done).length;
  const today = goal.date === todayKey() ? goal.text : "Not set";

  const byHour = new Array(24).fill(0) as number[];
  for (const c of checkins) {
    const h = new Date(c.date).getHours();
    if (c.urge >= 6) byHour[h] += 1;
  }
  const peakHour = byHour.indexOf(Math.max(...byHour));
  const peakLabel =
    checkins.some((c) => c.urge >= 6) ? `${String(peakHour).padStart(2, "0")}:00 window` : "Not enough high-urge logs";

  return (
    <AppFrame title="Data">
      <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
        DEVICE-LOCAL · NOT A CLINICAL SCORE
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat k="Streak days" v={days === null ? "—" : String(days)} />
        <Stat k="Mean urge" v={String(avg)} />
        <Stat k="Peak urge" v={String(high)} />
        <Stat k="Wins" v={String(wins.length)} />
        <Stat k="Slips logged" v={String(slips.length)} />
        <Stat k="Open goals" v={String(openGoals)} />
      </div>

      <Card className="mt-3">
        <CardContent className="p-4">
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">URGE SERIES</p>
          <Sparkline values={series} />
        </CardContent>
      </Card>

      <Card className="mt-3">
        <CardContent className="space-y-1 p-4">
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">HIGH-URGE HOUR</p>
          <p className="font-display text-xl font-medium">{peakLabel}</p>
          <p className="text-xs text-muted-foreground">Based on check-ins with urge 6 or higher.</p>
        </CardContent>
      </Card>

      <Card className="mt-3">
        <CardContent className="space-y-1 p-4">
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">TODAY'S GOAL</p>
          <p className="text-sm">{today}</p>
        </CardContent>
      </Card>

      <section className="mt-4">
        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">TRIGGER RANK</p>
        <div className="mt-2 space-y-2">
          {ranked.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tag triggers to rank them.</p>
          ) : (
            ranked.map((t) => (
              <div key={t.id}>
                <div className="flex justify-between text-sm">
                  <span>{t.label}</span>
                  <span className="font-mono text-xs tabular-nums">{t.hits}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${(t.hits / maxHits) * 100}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Button asChild variant="outline" className="mt-6 w-full">
        <Link to="/patterns">Open trigger log</Link>
      </Button>
    </AppFrame>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3">
      <p className="font-display text-2xl font-medium tabular-nums leading-none">{v}</p>
      <p className="mt-1 font-mono text-[10px] tracking-[0.12em] text-muted-foreground">{k}</p>
    </div>
  );
}
