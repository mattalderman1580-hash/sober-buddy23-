export function env(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

/**
 * Self-hosted outside Grok (e.g. the user's own Vercel project). Vercel sets
 * `VERCEL=1` at build and runtime; `SELF_HOSTED=true` forces it elsewhere.
 * When true, every Grok-platform integration (edge gate identity, connector
 * tokens, the Grok auth broker) is off.
 */
export function isSelfHosted(): boolean {
  return env("VERCEL") === "1" || env("SELF_HOSTED") === "true";
}

/**
 * Workspace preview vs deployed app. The Grok deployer writes GROK_PROJECT_ID on
 * every publish; the sandbox preview never has it. Self-hosted deployments are
 * never the workspace preview (they also have no GROK_PROJECT_ID).
 */
export function isWorkspacePreview(): boolean {
  if (isSelfHosted()) return false;
  return !env("GROK_PROJECT_ID");
}
