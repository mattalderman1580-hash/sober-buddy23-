import { createMiddleware } from "@tanstack/react-start";

/**
 * Optional identity for Prayer Wall server functions. Unlike `authMiddleware`
 * this never throws: it resolves the signed-in user id when there is a valid
 * session, and otherwise leaves `userId` null so the caller can fall back to an
 * anonymous device id. The user id is only ever taken from server-side session
 * verification, never from the client.
 */
export const wallIdentityMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("./auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    let userId: string | null = null;
    try {
      const { getSessionUser } = await import("./auth/verify.server");
      const user = await getSessionUser(context.bearerToken);
      userId = user?.id ?? null;
    } catch {
      userId = null;
    }
    return next({ context: { userId } });
  });

const DEVICE_KEY = "sober-buddy-device";

/** Stable random id for this browser (not personal data; used for wall limits/reports). */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server-render-device";
  try {
    const existing = window.localStorage.getItem(DEVICE_KEY);
    if (existing && /^[a-z0-9-]{16,64}$/i.test(existing)) return existing;
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const id = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    window.localStorage.setItem(DEVICE_KEY, id);
    return id;
  } catch {
    return "no-storage-device-0000";
  }
}
