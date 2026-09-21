import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { askCompanion } from "@/lib/companion";
import { labelsFor } from "@/lib/struggles";
import { personalContext, useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/slip")({ component: SlipPage });

function SlipPage() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const addSlip = useAppStore((s) => s.addSlip);
  const slips = useAppStore((s) => s.slips);
  const struggles = useAppStore((s) => s.struggles);
  const story = useAppStore((s) => s.story);
  const plan = useAppStore((s) => s.plan);
  const triggers = useAppStore((s) => s.triggers);
  const standingGoals = useAppStore((s) => s.standingGoals);
  const goal = useAppStore((s) => s.goal);
  const [whatHappened, setWhat] = useState("");
  const [learned, setLearned] = useState("");
  const [nextStep, setNext] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  async function processWithBuddy() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await askCompanion({
        data: {
          struggles: labelsFor(struggles),
          profile: personalContext({ story, plan, triggers, standingGoals, slips, goal }),
          action: "free",
          message: `I slipped. No shame — help me learn. What happened: ${whatHappened}. What I think I learned: ${learned}. Next step I wrote: ${nextStep}.`,
          history: [],
        },
      });
      setNote(res.text);
    } catch {
      setNote("You are not disqualified. Name the lesson, tell one safe person, and take the next right hour.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppFrame title="After a slip">
      <Card className="bg-muted">
        <CardContent className="space-y-1 p-5 text-sm leading-relaxed">
          <p className="font-medium">A slip is data, not a verdict.</p>
          <p className="text-muted-foreground">
            God is not surprised. We look at what happened, what it taught, and the next right step.
            No inventory of shame.
          </p>
        </CardContent>
      </Card>

      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="what">What happened — briefly</Label>
          <Textarea id="what" value={whatHappened} onChange={(e) => setWhat(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="learn">What did this show me?</Label>
          <Textarea id="learn" value={learned} onChange={(e) => setLearned(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="next">Next 24 hours</Label>
          <Textarea
            id="next"
            value={nextStep}
            onChange={(e) => setNext(e.target.value)}
            placeholder="Who I will tell, what I will do tonight…"
          />
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={!whatHappened.trim()}
          onClick={() => {
            addSlip({
              whatHappened: whatHappened.trim(),
              learned: learned.trim(),
              nextStep: nextStep.trim(),
            });
            toast("Logged. Get back on the path.");
            setWhat("");
            setLearned("");
            setNext("");
          }}
        >
          Save this lesson
        </Button>
        <Button variant="secondary" className="w-full" disabled={busy} onClick={() => void processWithBuddy()}>
          {busy ? "Working…" : "Process with Buddy"}
        </Button>
        {note ? (
          <p className="rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed">{note}</p>
        ) : null}
      </div>

      {slips.length ? (
        <section className="mt-8">
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">PRIOR LESSONS</p>
          <ul className="mt-2 space-y-2">
            {slips.slice(0, 6).map((s) => (
              <li key={s.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
                <p className="font-mono text-[10px] text-muted-foreground">
                  {new Date(s.at).toLocaleString()}
                </p>
                <p className="mt-1">{s.learned || s.whatHappened}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AppFrame>
  );
}
