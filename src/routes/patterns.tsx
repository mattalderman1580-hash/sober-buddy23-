import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { personalize } from "@/lib/personalize";
import { useAppStore } from "@/lib/store";
import { COMMON_TRIGGERS } from "@/lib/types";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/patterns")({ component: Patterns });

function Patterns() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const struggles = useAppStore((s) => s.struggles);
  const triggers = useAppStore((s) => s.triggers);
  const checkins = useAppStore((s) => s.checkins);
  const addTrigger = useAppStore((s) => s.addTrigger);
  const moveTrigger = useAppStore((s) => s.moveTrigger);
  const removeTrigger = useAppStore((s) => s.removeTrigger);
  const [custom, setCustom] = useState("");

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  const ranked = [...triggers].sort((a, b) => a.rank - b.rank);
  const fromCheckins = checkins.filter((c) => c.trigger.trim()).slice(0, 8);
  const empty = personalize(struggles).empty.triggers;

  return (
    <AppFrame title="Triggers & patterns">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Write the conditions that show up before an urge. Rank them highest to lowest — this order is
        how the app understands your priorities.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {COMMON_TRIGGERS.map((label) => (
          <Button key={label} type="button" size="sm" variant="outline" onClick={() => addTrigger(label)}>
            {label}
          </Button>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addTrigger(custom);
          setCustom("");
        }}
      >
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Add a personal trigger"
          aria-label="Custom trigger"
        />
        <Button type="submit">Add</Button>
      </form>

      <div className="mt-5 space-y-2">
        {ranked.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          ranked.map((t, index) => (
            <Card key={t.id}>
              <CardContent className="flex items-center gap-2 p-3">
                <span className="w-6 font-mono text-xs tabular-nums text-muted-foreground">
                  #{index + 1}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{t.label}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Move higher"
                  disabled={index === 0}
                  onClick={() => moveTrigger(t.id, "up")}
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Move lower"
                  disabled={index === ranked.length - 1}
                  onClick={() => moveTrigger(t.id, "down")}
                >
                  <ChevronDown className="size-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removeTrigger(t.id)}>
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {fromCheckins.length ? (
        <section className="mt-8">
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">FROM CHECK-INS</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Mentions from check-ins stay as notes — they do not change your ranking.
          </p>
          <ul className="mt-2 space-y-2">
            {fromCheckins.map((c) => (
              <li key={c.id} className="rounded-xl border border-border bg-card px-3 py-2 text-sm">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {new Date(c.date).toLocaleDateString()} · {c.urge}/10
                </span>
                <p className="mt-0.5">{c.trigger}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AppFrame>
  );
}
