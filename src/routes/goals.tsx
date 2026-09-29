import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";
import { cn, todayKey } from "@/lib/utils";

export const Route = createFileRoute("/goals")({ component: Goals });

function Goals() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const goal = useAppStore((s) => s.goal);
  const saveGoal = useAppStore((s) => s.saveGoal);
  const standing = useAppStore((s) => s.standingGoals);
  const life = useAppStore((s) => s.lifeGoals);
  const saveLifeGoals = useAppStore((s) => s.saveLifeGoals);
  const addStandingGoal = useAppStore((s) => s.addStandingGoal);
  const toggleStandingGoal = useAppStore((s) => s.toggleStandingGoal);
  const removeStandingGoal = useAppStore((s) => s.removeStandingGoal);
  const existing = goal.date === todayKey() ? goal.text : "";
  const [today, setToday] = useState(existing);
  const [next, setNext] = useState("");
  const [family, setFamily] = useState(life.family);
  const [health, setHealth] = useState(life.health);
  const [faith, setFaith] = useState(life.faith);
  const [relationships, setRelationships] = useState(life.relationships);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  return (
    <AppFrame title="Goals">
      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">TODAY</p>
          <p className="text-sm text-muted-foreground">One thing that supports recovery, faith, or future.</p>
          <Input
            value={today}
            onChange={(e) => setToday(e.target.value)}
            placeholder="My goal today is…"
            aria-label="Today's goal"
          />
          <Button
            className="w-full"
            onClick={() => {
              saveGoal(today.trim());
              toast("Today's goal saved.");
            }}
            disabled={!today.trim()}
          >
            Save today
          </Button>
        </CardContent>
      </Card>

      <section className="mt-6">
        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">STANDING</p>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addStandingGoal(next);
            setNext("");
          }}
        >
          <Input
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="Add a longer goal"
            aria-label="Standing goal"
          />
          <Button type="submit">Add</Button>
        </form>
        <ul className="mt-3 space-y-2">
          {standing.map((g) => (
            <li
              key={g.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
            >
              <button
                type="button"
                onClick={() => toggleStandingGoal(g.id)}
                className={cn(
                  "size-5 shrink-0 rounded-sm border border-primary",
                  g.done ? "bg-primary" : "bg-card",
                )}
                aria-label={g.done ? "Mark incomplete" : "Mark complete"}
              />
              <span className={cn("flex-1 text-sm", g.done && "text-muted-foreground line-through")}>
                {g.text}
              </span>
              <Button size="sm" variant="ghost" onClick={() => removeStandingGoal(g.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 space-y-3">
        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
          LONGER AIMS
        </p>
        <p className="text-sm text-muted-foreground">
          Family, health, faith, and the relationships you are rebuilding. These stay on this device.
        </p>
        <Input
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          placeholder="Family goal"
          aria-label="Family goal"
        />
        <Input
          value={health}
          onChange={(e) => setHealth(e.target.value)}
          placeholder="Health goal"
          aria-label="Health goal"
        />
        <Input
          value={faith}
          onChange={(e) => setFaith(e.target.value)}
          placeholder="Faith goal"
          aria-label="Faith goal"
        />
        <Input
          value={relationships}
          onChange={(e) => setRelationships(e.target.value)}
          placeholder="Relationship goal"
          aria-label="Relationship goal"
        />
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => {
            saveLifeGoals({ family, health, faith, relationships });
            toast("Longer goals saved.");
          }}
        >
          Save longer goals
        </Button>
      </section>
    </AppFrame>
  );
}
