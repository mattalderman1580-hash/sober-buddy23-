/**
 * Sign-in providers the UI can offer.
 *
 * `grok-google` goes through the Grok auth broker (live preview and Grok
 * publish). `google` is this app's own Google OAuth client, used only when
 * GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set (self-hosted Vercel).
 */
export type SocialProviderId = "google" | "grok-google";

export type SocialProvider = {
  providerId: SocialProviderId;
  label: string;
};

export const SOCIAL_PROVIDERS: readonly SocialProvider[] = [
  { providerId: "grok-google", label: "Google" },
  { providerId: "google", label: "Google" },
];
