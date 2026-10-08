import { createServerFn } from "@tanstack/react-start";

/** Which sign-in methods the server has enabled (read from env at runtime). */
export type AuthConfig = { emailPassword: boolean; google: boolean };

/**
 * Public, non-secret: lets the sign-in UI show the Google button only when
 * GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET are configured on the server.
 */
export const getAuthConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthConfig> => {
    const { googleEnabled, authConfigured } = await import("./server");
    const { emailAndPasswordEnabled } = await import("./email-password");
    return {
      emailPassword: authConfigured && emailAndPasswordEnabled,
      google: googleEnabled,
    };
  },
);
