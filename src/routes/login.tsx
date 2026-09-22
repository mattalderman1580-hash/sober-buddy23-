import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { CrossGlyph } from "@/components/cross-glyph";
import { Button } from "@/components/ui/button";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const hydrated = useHasHydrated();
  const { user, isPending } = useCurrentUserState();
  const onboarded = useAppStore((s) => s.onboarded);

  if (!hydrated || isPending) {
    return (
      <main className="grid min-h-dvh place-items-center p-6">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (user) {
    return <Navigate to={onboarded ? "/home" : "/onboarding"} />;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Sign in
        </p>
        <div className="mt-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <CrossGlyph className="size-7" />
        </div>
        <h1 className="mt-6 font-display text-[2rem] font-medium leading-tight tracking-tight">
          Welcome back
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Sign in to keep your recovery companion with you. After signing in, we will finish setup if
          this is your first time.
        </p>

        <div className="mt-8 space-y-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                size="lg"
                variant={p.providerId === "google" ? "default" : "outline"}
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Sign-in is disabled.</p>
          )}
        </div>
      </div>

      <Button asChild variant="ghost" className="mt-6 w-full">
        <Link to="/">Back</Link>
      </Button>
    </main>
  );
}
