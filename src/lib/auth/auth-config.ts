import { createServerFn } from "@tanstack/react-start";
import type { SocialProviderId } from "./providers";

/** Which sign-in methods the server has enabled (read from env at runtime). */
export type AuthConfig = {
  emailPassword: boolean;
  google: boolean;
  googleProviderId: SocialProviderId | null;
};

/** Public, non-secret: tells the sign-in screen whether Google is available. */
export const getAuthConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthConfig> => {
    const { googleEnabled, grokGoogleEnabled, authConfigured } = await import("./server");
    const { emailAndPasswordEnabled } = await import("./email-password");
    const googleProviderId: SocialProviderId | null = grokGoogleEnabled
      ? "grok-google"
      : googleEnabled
        ? "google"
        : null;
    return {
      emailPassword: authConfigured && emailAndPasswordEnabled,
      google: googleProviderId !== null,
      googleProviderId,
    };
  },
);
