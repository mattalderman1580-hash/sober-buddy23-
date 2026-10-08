import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CrossGlyph } from "@/components/cross-glyph";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SOCIAL_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { getAuthConfig } from "@/lib/auth/auth-config";
import type { SocialProviderId } from "@/lib/auth/providers";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/login")({ component: Login });

const BEARER_KEY = "grok-auth.bearer-token";

function rememberBearer(response: Response) {
  const token = response.headers.get("set-auth-token");
  if (!token || typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(BEARER_KEY, token);
  } catch {
    /* storage unavailable */
  }
}

function Login() {
  const hydrated = useHasHydrated();
  const { user, isPending } = useCurrentUserState();
  const onboarded = useAppStore((s) => s.onboarded);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleProviderId, setGoogleProviderId] = useState<SocialProviderId | null>(null);
  useEffect(() => {
    let cancelled = false;
    const sandbox =
      typeof window !== "undefined" && window.location.hostname.endsWith(".grok-sandbox.com");
    if (sandbox) setGoogleProviderId("grok-google");
    getAuthConfig()
      .then((c) => {
        if (cancelled) return;
        if (c.googleProviderId) setGoogleProviderId(c.googleProviderId);
        else if (!sandbox) setGoogleProviderId(null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  const googleEnabled = googleProviderId !== null;
  const socialProviders = SOCIAL_PROVIDERS.filter((p) => p.providerId === googleProviderId);

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

  async function submitEmail(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const cleanEmail = email.trim();
    if (!cleanEmail.includes("@")) {
      setError("Enter a real email address.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for the password.");
      return;
    }
    if (mode === "up" && name.trim().length < 2) {
      setError("Add the name you want on your account.");
      return;
    }
    setBusy(true);
    try {
      const options = {
        onSuccess(ctx: { response: Response }) {
          rememberBearer(ctx.response);
        },
      };
      const result =
        mode === "up"
          ? await authClient.signUp.email(
              { email: cleanEmail, password, name: name.trim(), callbackURL: "/" },
              options,
            )
          : await authClient.signIn.email(
              { email: cleanEmail, password, callbackURL: "/" },
              options,
            );
      if (result.error) {
        setError(result.error.message || "Could not sign in. Check the email and password.");
        return;
      }
      await authClient.getSession();
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
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
          {googleEnabled
            ? "Continue with Google, or use an email and password."
            : "Use an email and password to open your companion."}
        </p>

        {authEnabled ? (
          <div className="mt-8 space-y-3">
            {socialProviders.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                size="lg"
                className="w-full"
                onClick={() => {
                  void signIn(p.providerId, { callbackURL: "/" }).catch((err: unknown) => {
                    toast(err instanceof Error ? err.message : "Sign-in failed. Try again.");
                  });
                }}
              >
                Continue with {p.label}
              </Button>
            ))}

            {socialProviders.length > 0 ? (
              <p className="pt-2 text-center text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Or use email
              </p>
            ) : null}

            <form className="space-y-3" onSubmit={submitEmail}>
              {mode === "up" ? (
                <div className="space-y-2">
                  <Label htmlFor="account-name">Name</Label>
                  <Input
                    id="account-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="First name"
                  />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="account-email">Email</Label>
                <Input
                  id="account-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-password">Password</Label>
                <Input
                  id="account-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                  placeholder="At least 8 characters"
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" size="lg" variant="secondary" className="w-full" disabled={busy}>
                {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in with email"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMode(mode === "up" ? "in" : "up");
                  setError("");
                }}
              >
                {mode === "up" ? "I already have an account" : "Create an account"}
              </Button>
            </form>
          </div>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">Sign-in is disabled.</p>
        )}
      </div>

      <Button asChild variant="ghost" className="mt-6 w-full">
        <Link to="/">Back</Link>
      </Button>
    </main>
  );
}
