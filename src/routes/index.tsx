import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { CrossGlyph } from "@/components/cross-glyph";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/")({ component: Welcome });

function Welcome() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);

  if (hydrated && onboarded) return <Navigate to="/home" />;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col items-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <CrossGlyph className="size-7" />
        </div>
        <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground">
          GOD FIRST · RECOVERY · PURPOSE
        </p>
        <h1 className="mt-3 font-display text-[2.05rem] font-medium leading-[1.12] tracking-tight">
          When the urge hits,
          <br />
          you don't have to face it alone.
        </h1>
        <p className="mt-4 max-w-sm text-[0.975rem] leading-relaxed text-muted-foreground">
          A faith-based companion for the moments when you need strength, prayer, Scripture, or a
          next right step.
        </p>

        <Card className="mt-8 w-full text-left">
          <CardContent className="space-y-2 p-5">
            <p className="font-medium">Jesus Christ is at the center.</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              God the Father, Jesus Christ our Lord and Savior, and a life of faith come first.
              Sober Buddy points you toward God, Scripture, healthy choices, trusted people, and
              real-world support.
            </p>
          </CardContent>
        </Card>
      </div>

      <Button asChild size="lg" className="mt-8 w-full">
        <Link to="/onboarding">Begin</Link>
      </Button>
      <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
        Support for the moment — not a replacement for professional or emergency care.
      </p>
    </main>
  );
}
