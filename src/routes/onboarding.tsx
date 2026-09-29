import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { personalize } from "@/lib/personalize";
import { ALL_STRUGGLES } from "@/lib/struggles";
import { useAppStore } from "@/lib/store";
import type { StruggleId } from "@/lib/types";
import { useHasHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

type Step = 1 | 2 | 3;

function Onboarding() {
  const hydrated = useHasHydrated();
  const { user, isPending } = useCurrentUserState();
  const onboarded = useAppStore((s) => s.onboarded);
  const savedStruggles = useAppStore((s) => s.struggles);
  const savedName = useAppStore((s) => s.displayName);
  const savedPlace = useAppStore((s) => s.place);
  const setDisplayName = useAppStore((s) => s.setDisplayName);
  const setPlace = useAppStore((s) => s.setPlace);
  const finishOnboarding = useAppStore((s) => s.finishOnboarding);
  const setStruggles = useAppStore((s) => s.setStruggles);
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState(savedName);
  const [selected, setSelected] = useState<StruggleId[]>(savedStruggles);
  const [where, setWhere] = useState(savedPlace);

  const hint = useMemo(() => personalize(selected).setupHint, [selected]);

  if (!hydrated || isPending) return <LoadingScreen />;
  if (!user) return <RedirectToSignIn />;

  function toggle(id: StruggleId) {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function nextFromName() {
    const clean = name.trim();
    if (clean.length < 2) {
      toast("Add a first name or short handle.");
      return;
    }
    setDisplayName(clean);
    setStep(2);
  }

  function nextFromStruggles() {
    if (!selected.length) {
      toast("Choose at least one area you want help with.");
      return;
    }
    setStruggles(selected);
    setStep(3);
  }

  function finish(skipPlace: boolean) {
    if (!selected.length) {
      toast("Choose at least one area you want help with.");
      setStep(2);
      return;
    }
    setDisplayName(name.trim());
    if (!skipPlace) setPlace(where);
    finishOnboarding(selected);
    toast(onboarded ? "Saved. Your home is updated." : "You are set. Welcome home.");
    navigate({ to: "/home" });
  }

  return (
    <AppFrame
      title={onboarded ? "Your setup" : "First-time setup"}
      backTo={onboarded ? "/home" : "/"}
      nav={onboarded}
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Step {step} of 3
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{hint}</p>

      {step === 1 ? (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-2xl font-medium leading-tight">What should we call you?</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A first name or short handle is enough. It stays on this device and helps the prayer
            circle know who you are.
          </p>
          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Matt"
              autoComplete="nickname"
            />
          </div>
          <Button size="lg" className="w-full" onClick={nextFromName}>
            Continue
          </Button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6">
          <h2 className="font-display text-2xl font-medium leading-tight">What are you working on?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Choose one or more. Home, urge mode, and quick actions will follow what you select.
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
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button className="flex-1" onClick={nextFromStruggles}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6">
          <h2 className="font-display text-2xl font-medium leading-tight">Where are you?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A city or ZIP is enough. It stays on this device and is only used later to open nearby
            meetings and health food stores. You can skip this and set it whenever you are ready.
          </p>
          <div className="mt-5 space-y-2">
            <Label htmlFor="place">City, neighborhood, or ZIP</Label>
            <Input
              id="place"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="e.g. Tulsa, OK or 74103"
              autoComplete="postal-code"
            />
          </div>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button className="flex-1" onClick={() => finish(false)}>
              {onboarded ? "Save and continue" : "Finish setup"}
            </Button>
          </div>
          <Button variant="ghost" className="mt-1 w-full" onClick={() => finish(true)}>
            Set location later
          </Button>
          {!onboarded ? (
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/">Back to welcome</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </AppFrame>
  );
}
