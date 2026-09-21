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
      <div className="flex flex-1 flex-col">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          God first · Recovery companion
        </p>
        <div className="mt-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <CrossGlyph className="size-7" />
        </div>
        <h1 className="mt-6 text-[2.15rem] font-medium leading-[1.12] tracking-tight">
          When the urge hits,
          <br />
          you don’t have to face it alone.
        </h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
          Prayer, Scripture, a 10-minute timer, and a circle that can encourage you — for the next
          right step, not the whole rest of your life.
        </p>

        <Card className="mt-8">
          <CardContent className="space-y-2 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              At the center
            </p>
            <p className="text-sm font-medium">Jesus Christ is at the center.</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              God the Father, Jesus Christ our Lord and Savior, and a life of faith come first.
              Sober Buddy points you toward God, Scripture, trusted people, and the next right step.
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
