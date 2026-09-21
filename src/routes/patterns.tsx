import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { COMMON_TRIGGERS } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/patterns")({ component: Patterns });

function Patterns() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const triggers = useAppStore((s) => s.triggers);
  const checkins = useAppStore((s) => s.checkins);
  const addTrigger = useAppStore((s) => s.addTrigger);
  const hitTrigger = useAppStore((s) => s.hitTrigger);
  const removeTrigger = useAppStore((s) => s.removeTrigger);
  const [custom, setCustom] = useState("");

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  const ranked = [...triggers].sort((a, b) => b.hits - a.hits);
  const maxHits = Math.max(1, ...ranked.map((t) => t.hits));
  const fromCheckins = checkins.filter((c) => c.trigger.trim()).slice(0, 8);

  return (
    <AppFrame title="Triggers & patterns">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Tag the conditions that show up before an urge. Hits are a count, not a verdict.
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
          <p className="text-sm text-muted-foreground">No tags yet. Add the ones you actually see.</p>
        ) : (
          ranked.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium">{t.label}</p>
                    <p className="font-mono text-xs tabular-nums text-muted-foreground">{t.hits}</p>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(t.hits / maxHits) * 100}%` }}
                    />
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => hitTrigger(t.id)}>
                  Hit
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
