import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppFrame } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { ALL_STRUGGLES } from "@/lib/struggles";
import { useAppStore } from "@/lib/store";
import type { StruggleId } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

function Onboarding() {
  const saved = useAppStore((s) => s.struggles);
  const finish = useAppStore((s) => s.finishOnboarding);
  const onboarded = useAppStore((s) => s.onboarded);
  const [selected, setSelected] = useState<StruggleId[]>(saved);
  const navigate = useNavigate();

  function toggle(id: StruggleId) {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function done() {
    if (!selected.length) {
      toast("Choose at least one area you want help with.");
      return;
    }
    finish(selected);
    navigate({ to: "/home" });
  }

  return (
    <AppFrame title="Your journey" backTo={onboarded ? "/home" : "/"} nav={onboarded}>
      <h2 className="font-display text-2xl font-medium leading-tight">What are you struggling with?</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Choose one or more. Support will follow what you select. You can change this later.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {ALL_STRUGGLES.map(({ id, label, blurb, Icon }) => {
          const on = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={cn(
                "flex min-h-[7.5rem] flex-col items-start gap-2 rounded-xl border bg-card p-3.5 text-left transition-[border-color,background-color] duration-150",
                on ? "border-primary bg-muted" : "border-border",
              )}
            >
              <Icon className="size-5 text-primary" strokeWidth={1.75} />
              <span className="text-sm font-medium leading-snug">{label}</span>
              <span className="text-xs leading-snug text-muted-foreground">{blurb}</span>
            </button>
          );
        })}
      </div>

      <Button size="lg" className="mt-6 w-full" onClick={done}>
        {onboarded ? "Save and continue" : "Build my Sober Buddy"}
      </Button>
      {!onboarded ? (
        <Button variant="ghost" className="mt-1 w-full" asChild>
          <Link to="/">Back</Link>
        </Button>
      ) : null}
    </AppFrame>
  );
}
