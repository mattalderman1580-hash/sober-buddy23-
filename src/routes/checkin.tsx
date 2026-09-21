import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/checkin")({ component: Checkin });

function Checkin() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const save = useAppStore((s) => s.saveCheckin);
  const history = useAppStore((s) => s.checkins);
  const navigate = useNavigate();
  const [mood, setMood] = useState("");
  const [urge, setUrge] = useState(0);
  const [trigger, setTrigger] = useState("");
  const [win, setWin] = useState("");

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  function submit() {
    save({ mood, urge, trigger, win });
    toast("Check-in saved. Keep going.");
    navigate({ to: "/home" });
  }

  return (
    <AppFrame title="Daily check-in">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="mood">How are you feeling?</Label>
          <Input
            id="mood"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="hopeful, stressed, tired…"
          />
        </div>
        <div className="space-y-3">
          <Label>
            Urge level: <span className="tabular-nums">{urge}</span>/10
          </Label>
          <Slider value={[urge]} min={0} max={10} step={1} onValueChange={(v) => setUrge(v[0] ?? 0)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="trigger">What triggered you?</Label>
          <Textarea id="trigger" value={trigger} onChange={(e) => setTrigger(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="win">What went well today?</Label>
          <Textarea id="win" value={win} onChange={(e) => setWin(e.target.value)} />
        </div>
        <Button className="w-full" size="lg" onClick={submit}>
          Save check-in
        </Button>
      </div>

      {history.length ? (
        <section className="mt-8">
          <h2 className="font-display text-lg font-medium">Recent check-ins</h2>
          <ul className="mt-3 space-y-2">
            {history.slice(0, 6).map((c) => (
              <li key={c.id} className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {new Date(c.date).toLocaleString()} · urge {c.urge}/10
                </p>
                <p className="mt-1 text-sm">{c.mood || c.win || c.trigger || "Saved."}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AppFrame>
  );
}
