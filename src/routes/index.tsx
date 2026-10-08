import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CrossGlyph } from "@/components/cross-glyph";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthConfig } from "@/lib/auth/auth-config";
import { signIn } from "@/lib/auth/client";
import type { SocialProviderId } from "@/lib/auth/providers";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/")({ component: Welcome });

function Welcome() {
  const hydrated = useHasHydrated();
  const { user, isPending } = useCurrentUserState();
  const onboarded = useAppStore((s) => s.onboarded);
  const [googleProviderId, setGoogleProviderId] = useState<SocialProviderId | null>(null);

  useEffect(() => {
    let cancelled = false;
    const sandbox = window.location.hostname.endsWith(".grok-sandbox.com");
    if (sandbox) setGoogleProviderId("grok-google");
    getAuthConfig()
      .then((config) => {
        if (cancelled) return;
        if (config.googleProviderId) setGoogleProviderId(config.googleProviderId);
        else if (!sandbox) setGoogleProviderId(null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!hydrated) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background p-6">
        <p className="text-sm text-muted-foreground">Sober Buddy</p>
      </main>
    );
  }

  if (!isPending && user && onboarded) return <Navigate to="/home" />;
  if (!isPending && user && !onboarded) return <Navigate to="/onboarding" />;

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
          Prayer, Scripture, a 15-minute timer, and a circle that can encourage you — for the next
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

      {googleProviderId ? (
        <Button
          size="lg"
          className="mt-8 w-full"
          onClick={() => {
            void signIn(googleProviderId, { callbackURL: "/" }).catch((err: unknown) => {
              toast(err instanceof Error ? err.message : "Google sign-in failed. Try again.");
            });
          }}
        >
          Continue with Google
        </Button>
      ) : (
        <Button asChild size="lg" className="mt-8 w-full">
          <Link to="/login">Sign in</Link>
        </Button>
      )}
      <Button asChild variant="ghost" className="mt-2 w-full">
        <Link to="/login">Email or other sign-in</Link>
      </Button>
      <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
        Support for the moment — not a replacement for professional or emergency care.
      </p>
    </main>
  );
}
