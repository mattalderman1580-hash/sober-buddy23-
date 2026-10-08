import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SOCIAL_PROVIDERS, authClient, signIn } from "@/lib/auth/client";
import { getAuthConfig, type AuthConfig } from "@/lib/auth/auth-config";

type Mode = "sign-in" | "sign-up";

/** Loads which sign-in methods the server has enabled (Google only when configured). */
function useAuthConfig(): AuthConfig | null {
  const [config, setConfig] = useState<AuthConfig | null>(null);
  useEffect(() => {
    let cancelled = false;
    getAuthConfig()
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch(() => {
        // Fall back to email/password only if the config call fails.
        if (!cancelled) setConfig({ emailPassword: true, google: false, googleProviderId: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return config;
}

/** Email/password sign-in + sign-up, plus Google when the server enables it. */
export function AuthForm({ callbackURL = "/" }: { callbackURL?: string }) {
  const config = useAuthConfig();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!config) {
    return <p className="text-sm text-muted-foreground">Loading sign-in options…</p>;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res =
        mode === "sign-up"
          ? await authClient.signUp.email({
              name: name.trim() || email.split("@")[0] || "Friend",
              email: email.trim(),
              password,
            })
          : await authClient.signIn.email({ email: email.trim(), password });
      if (res.error) {
        setError(res.error.message ?? "Something went wrong. Please try again.");
        return;
      }
      // Session store refreshes automatically; the page redirects when the user appears.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const enabledSocial = SOCIAL_PROVIDERS.filter(
    (p) => p.providerId === config.googleProviderId,
  );

  return (
    <div className="w-full space-y-5">
      {enabledSocial.length > 0 && (
        <div className="space-y-3">
          {enabledSocial.map((p) => (
            <Button
              key={p.providerId}
              type="button"
              size="lg"
              className="w-full"
              onClick={() =>
                signIn(p.providerId, { callbackURL }).catch((err: unknown) =>
                  setError(err instanceof Error ? err.message : "Sign-in failed"),
                )
              }
            >
              Continue with {p.label}
            </Button>
          ))}
        </div>
      )}

      {config.emailPassword && (
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          {mode === "sign-up" && (
            <div className="space-y-1.5">
              <Label htmlFor="auth-name">First name or nickname</Label>
              <Input
                id="auth-name"
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === "sign-up" && (
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>
            )}
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "sign-up" ? "Create account" : "Sign in"}
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => {
              setError(null);
              setMode(mode === "sign-up" ? "sign-in" : "sign-up");
            }}
          >
            {mode === "sign-up"
              ? "Already have an account? Sign in"
              : "New here? Create an account"}
          </button>
        </form>
      )}

      {!config.emailPassword && enabledSocial.length === 0 && (
        <p className="text-sm text-muted-foreground">Sign-in is not configured.</p>
      )}
    </div>
  );
}
