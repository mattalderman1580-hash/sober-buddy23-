/**
 * Self-hosted Better Auth for THIS app (server-only).
 *
 * Self-hosted (Vercel) configuration — the Grok auth broker / Grok X + Google
 * federation is NOT used here. Sign-in methods:
 *   - Email/password (this app's own DB) — toggled in `./email-password`.
 *   - Google, with the app owner's OWN Google OAuth client, enabled only when
 *     GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set. Redirect URI to
 *     register in Google Cloud: `<BETTER_AUTH_URL>/api/auth/callback/google`.
 *
 * Database: real Postgres when DATABASE_URL is set (production), else the
 * embedded PGLite (local `npm run dev`). Schema: `migrations/0001_auth.sql`.
 *
 * `VITE_AUTH_ENABLED=false` still turns auth off entirely (dev user, no DB).
 *
 * NEVER import this from client code. The client uses `@/lib/auth/client`.
 */
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { ensureDbReady, getPglite } from "../db";
import { emailAndPasswordEnabled } from "./email-password";
import { GATE_PROVIDER_ID, gateIdentitySessions } from "./gate-session.server";
import { pgliteDialect } from "./pglite-dialect";

// Kick (and share) PGLite bootstrap as soon as the auth server module loads.
void ensureDbReady();

/**
 * Local-dev secret must outlive module reloads (PGLite + its session rows live
 * on `globalThis`). Production always sets BETTER_AUTH_SECRET.
 */
const globalAuthRef = globalThis as typeof globalThis & {
  __grokAuthPreviewSecret__?: string;
};
function devAuthSecret(): string {
  globalAuthRef.__grokAuthPreviewSecret__ ??= randomBytes(32).toString("hex");
  return globalAuthRef.__grokAuthPreviewSecret__;
}

/** Read an env var, treating empty/whitespace as unset. */
const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

// Explicit off-switch: VITE_AUTH_ENABLED=false forces auth off (dev user).
const authDisabled = env("VITE_AUTH_ENABLED") === "false";

/** True when real sign-in is enforced. */
export const authConfigured = !authDisabled;

const googleClientId = env("GOOGLE_CLIENT_ID");
const googleClientSecret = env("GOOGLE_CLIENT_SECRET");

/** True when the Google social provider is wired (both env vars present). */
export const googleEnabled = authConfigured && Boolean(googleClientId && googleClientSecret);

// Local `npm run dev` (port 8080 contract). Browsers may send Origin as any of
// these for the same server.
const LOCAL_DEV_ORIGINS: string[] = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
];

// Public origin. Production sets BETTER_AUTH_URL; Vercel preview deployments
// fall back to their per-deployment VERCEL_URL; local dev derives it per request.
const vercelUrl = env("VERCEL_URL") ? `https://${env("VERCEL_URL")}` : undefined;
const vercelBranchUrl = env("VERCEL_BRANCH_URL") ? `https://${env("VERCEL_BRANCH_URL")}` : undefined;
const explicitBaseURL = env("BETTER_AUTH_URL")?.replace(/\/+$/, "") ?? vercelUrl;
const baseURL = explicitBaseURL ?? {
  allowedHosts: ["localhost:*", "127.0.0.1:*", "[::1]:*", "localhost", "127.0.0.1", "[::1]"],
  protocol: "auto" as const,
  fallback: "http://localhost:8080",
};

// Origins Better Auth accepts on credentialed POSTs (sign-up/sign-in, etc.).
const trustedOrigins: string[] = [
  ...(explicitBaseURL ? [explicitBaseURL] : []),
  ...(vercelUrl ? [vercelUrl] : []),
  ...(vercelBranchUrl ? [vercelBranchUrl] : []),
  ...LOCAL_DEV_ORIGINS,
];

const databaseUrl = env("DATABASE_URL");

// Real Postgres when DATABASE_URL is set, else the embedded PGLite via a
// Kysely dialect — the SAME DB as app data.
const database = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

/** Session token cookie name. */
export const SESSION_TOKEN_COOKIE = "__Host-grok-auth.session_token";

export const auth = betterAuth({
  baseURL,
  secret: env("BETTER_AUTH_SECRET") ?? devAuthSecret(),
  database,
  trustedOrigins,

  // Google emails are verified, so a Google sign-in may link to an existing
  // user with the same email only when that local email is verified too
  // (Better Auth's default) — prevents pre-account-takeover via an unverified
  // email/password sign-up.
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", GATE_PROVIDER_ID],
    },
  },

  session: { cookieCache: { enabled: true, maxAge: 300 } },

  ...(emailAndPasswordEnabled && authConfigured
    ? { emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true } }
    : {}),

  ...(googleEnabled
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId as string,
            clientSecret: googleClientSecret as string,
            prompt: "select_account" as const,
          },
        },
      }
    : {}),

  // `__Host-` prefixed cookies (Secure + Path=/ + no Domain).
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: SESSION_TOKEN_COOKIE },
      session_data: { name: "__Host-grok-auth.session_data" },
      account_data: { name: "__Host-grok-auth.account_data" },
      dont_remember: { name: "__Host-grok-auth.dont_remember" },
    },
  },

  plugins: [
    // No-op on self-hosted deployments (gateIdentityEnabled() is false there).
    gateIdentitySessions(),
    bearer(),
    // MUST be last.
    tanstackStartCookies(),
  ],
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}

export { SOCIAL_PROVIDERS } from "./providers";
