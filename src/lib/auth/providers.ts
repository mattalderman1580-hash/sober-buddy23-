/**
 * Social sign-in providers this app can offer (self-hosted deployment).
 *
 * Dependency-free so the client can import it without pulling the server-only
 * Better Auth instance into the browser bundle. Whether a provider is actually
 * ENABLED is decided server-side from env vars (see `server.ts` /
 * `auth-config.ts`); the UI only renders the ones the server reports.
 *
 * Google uses the app's own OAuth client: set GOOGLE_CLIENT_ID and
 * GOOGLE_CLIENT_SECRET. Redirect URI: `<BETTER_AUTH_URL>/api/auth/callback/google`.
 */
export type SocialProviderId = "google";

export type SocialProvider = {
  /** Better Auth social provider id; also the callback path segment. */
  providerId: SocialProviderId;
  /** Human label for the sign-in button. */
  label: string;
};

export const SOCIAL_PROVIDERS: readonly SocialProvider[] = [
  { providerId: "google", label: "Google" },
];
