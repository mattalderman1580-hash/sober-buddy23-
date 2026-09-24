/**
 * Local backup file format. Pure (no store / DOM imports) so it can be tested
 * with plain node. The store wires these into download/restore.
 *
 *   { app: "sober-buddy", version: <store version>, exportedAt, data: {...} }
 */

export const BACKUP_APP = "sober-buddy";

/** Persisted fields a backup may carry, with the basic JSON type each must be. */
const FIELD_TYPES = {
  onboarded: "boolean",
  struggles: "array",
  plan: "object",
  checkins: "array",
  goal: "object",
  wins: "array",
  story: "object",
  triggers: "array",
  standingGoals: "array",
  slips: "array",
  localPrayers: "array",
  journal: "array",
  amenedIds: "array",
  displayName: "string",
  dailyEncouragementEnabled: "boolean",
  dailyNotifyHour: "number",
  dailyNotifyMinute: "number",
  lastDailyNotifyDate: "string",
  sponsor: "object-or-null",
  celebratedMilestones: "array",
} as const;

type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

export const BACKUP_FIELDS = Object.keys(FIELD_TYPES) as (keyof typeof FIELD_TYPES)[];

export interface BackupFile {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

export function backupFileName(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `sober-buddy-backup-${y}-${m}-${d}.json`;
}

export function buildBackup(
  data: Record<string, unknown>,
  version: number,
  now = new Date(),
): BackupFile {
  const clean: Record<string, unknown> = {};
  for (const key of BACKUP_FIELDS) {
    if (key in data && typeof data[key] !== "function") clean[key] = data[key];
  }
  return { app: BACKUP_APP, version, exportedAt: now.toISOString(), data: clean };
}

function matches(value: unknown, type: FieldType): boolean {
  switch (type) {
    case "array":
      return Array.isArray(value);
    case "object":
      return !!value && typeof value === "object" && !Array.isArray(value);
    case "object-or-null":
      return value === null || (!!value && typeof value === "object" && !Array.isArray(value));
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    default:
      return typeof value === type;
  }
}

export type ParsedBackup =
  | { ok: true; version: number; exportedAt: string; data: Record<string, unknown> }
  | { ok: false; error: string };

const NOT_OURS =
  "That file doesn't look like a Sober Buddy backup. Choose the .json file you downloaded from Settings.";

/**
 * Parse and validate a backup file's text. Unknown keys are dropped; known keys
 * with the wrong type are dropped. Rejects anything that isn't recognisably ours.
 */
export function parseBackup(text: string, currentVersion: number): ParsedBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: NOT_OURS };
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, error: NOT_OURS };
  const file = raw as Record<string, unknown>;
  if (file.app !== BACKUP_APP) return { ok: false, error: NOT_OURS };
  const version = file.version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 0) {
    return { ok: false, error: NOT_OURS };
  }
  if (version > currentVersion) {
    return {
      ok: false,
      error: "This backup came from a newer version of Sober Buddy. Update the app, then try again.",
    };
  }
  const data = file.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, error: NOT_OURS };
  }
  const src = data as Record<string, unknown>;
  const clean: Record<string, unknown> = {};
  for (const key of BACKUP_FIELDS) {
    if (key in src && matches(src[key], FIELD_TYPES[key])) clean[key] = src[key];
  }
  if (Object.keys(clean).length === 0) {
    return { ok: false, error: "That backup is empty or damaged, so nothing was changed." };
  }
  // Array entries must be objects (or numbers for amenedIds, strings for keys).
  for (const key of ["checkins", "wins", "triggers", "standingGoals", "slips", "localPrayers", "journal"] as const) {
    if (Array.isArray(clean[key])) {
      clean[key] = (clean[key] as unknown[]).filter(
        (item) => !!item && typeof item === "object" && !Array.isArray(item),
      );
    }
  }
  if (Array.isArray(clean.amenedIds)) {
    clean.amenedIds = (clean.amenedIds as unknown[]).filter((n) => typeof n === "number");
  }
  for (const key of ["struggles", "celebratedMilestones"] as const) {
    if (Array.isArray(clean[key])) {
      clean[key] = (clean[key] as unknown[]).filter((s) => typeof s === "string");
    }
  }
  return {
    ok: true,
    version,
    exportedAt: typeof file.exportedAt === "string" ? file.exportedAt : "",
    data: clean,
  };
}
