/**
 * Sobriety milestones. Pure date math (no store / React imports) so it can be
 * unit-tested with plain node.
 *
 * Keys are stable strings stored in `celebratedMilestones`:
 *   d1, d7, d30, d60, d90, d180, y1, y2, y3, …
 */

export interface Milestone {
  key: string;
  /** Short label, e.g. "30 days" or "1 year". */
  label: string;
  /** Calendar date (local) the milestone is reached. */
  date: Date;
}

const DAY_MILESTONES: { days: number; label: string }[] = [
  { days: 1, label: "24 hours" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 60, label: "60 days" },
  { days: 90, label: "90 days" },
  { days: 180, label: "6 months" },
];

const DAY_MS = 86_400_000;

/** Parse a `YYYY-MM-DD` start date as local midnight, or null if invalid. */
export function parseStartDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function addYears(d: Date, years: number): Date {
  const next = new Date(d);
  next.setFullYear(next.getFullYear() + years);
  // Feb 29 start → Mar 1 in non-leap years is acceptable.
  return next;
}

/** Milestone #index in the infinite sequence (6 day-based, then yearly). */
function milestoneAt(start: Date, index: number): Milestone {
  if (index < DAY_MILESTONES.length) {
    const m = DAY_MILESTONES[index]!;
    return { key: `d${m.days}`, label: m.label, date: addDays(start, m.days) };
  }
  const years = index - DAY_MILESTONES.length + 1;
  return {
    key: `y${years}`,
    label: years === 1 ? "1 year" : `${years} years`,
    date: addYears(start, years),
  };
}

/** All milestones reached on or before `now`, oldest first. */
export function reachedMilestones(startIso: string, now = new Date()): Milestone[] {
  const start = parseStartDate(startIso);
  if (!start) return [];
  const out: Milestone[] = [];
  for (let i = 0; i < 200; i++) {
    const m = milestoneAt(start, i);
    if (m.date.getTime() > now.getTime()) break;
    out.push(m);
  }
  return out;
}

export interface NextMilestone extends Milestone {
  /** Whole days until the milestone (≥ 1). */
  daysAway: number;
  /** 0–1 progress from the previous milestone (or the start date). */
  progress: number;
}

export function nextMilestone(startIso: string, now = new Date()): NextMilestone | null {
  const start = parseStartDate(startIso);
  if (!start) return null;
  let prevDate = start;
  for (let i = 0; i < 200; i++) {
    const m = milestoneAt(start, i);
    if (m.date.getTime() > now.getTime()) {
      const span = m.date.getTime() - prevDate.getTime();
      const done = now.getTime() - prevDate.getTime();
      return {
        ...m,
        daysAway: Math.max(1, Math.ceil((m.date.getTime() - now.getTime()) / DAY_MS)),
        progress: span > 0 ? Math.min(1, Math.max(0, done / span)) : 0,
      };
    }
    prevDate = m.date;
  }
  return null;
}

/**
 * Decide what to celebrate. Only the most recent reached milestone is ever
 * shown; everything reached is marked seen so we never flood the user with a
 * backlog of past milestones.
 */
export function pendingCelebration(
  startIso: string,
  celebrated: readonly string[],
  now = new Date(),
): { celebrate: Milestone | null; markSeen: string[] } {
  const reached = reachedMilestones(startIso, now);
  if (!reached.length) return { celebrate: null, markSeen: [] };
  const seen = new Set(celebrated);
  const latest = reached[reached.length - 1]!;
  const unseen = reached.filter((m) => !seen.has(m.key)).map((m) => m.key);
  return {
    celebrate: seen.has(latest.key) ? null : latest,
    markSeen: unseen,
  };
}

/**
 * Days since the most recent slip recorded AFTER the start date, or null when
 * there is none. Never changes the user's start date.
 */
export function daysSinceLastSlip(
  startIso: string,
  slips: readonly { at: string }[],
  now = new Date(),
): number | null {
  const start = parseStartDate(startIso);
  if (!start) return null;
  let latest: number | null = null;
  for (const s of slips) {
    const t = new Date(s.at).getTime();
    if (Number.isNaN(t) || t < start.getTime()) continue;
    if (latest === null || t > latest) latest = t;
  }
  if (latest === null) return null;
  const slipDay = new Date(latest);
  slipDay.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((now.getTime() - slipDay.getTime()) / DAY_MS));
}
