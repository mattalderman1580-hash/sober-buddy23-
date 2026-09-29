import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ChatMessage,
  CheckIn,
  DailyGoal,
  JournalEntry,
  LifeGoals,
  LocalPrayer,
  RecoveryPlan,
  Slip,
  Sponsor,
  StandingGoal,
  Story,
  StruggleId,
  TriggerTag,
  UrgeWin,
} from "@/lib/types";
import { EMPTY_LIFE_GOALS, EMPTY_PLAN, EMPTY_STORY } from "@/lib/types";
import {
  DEFAULT_NOTIFY_HOUR,
  DEFAULT_NOTIFY_MINUTE,
} from "@/lib/daily-notifications";
import { todayKey, uid } from "@/lib/utils";

/** Persisted store version. Bump when the persisted shape changes. */
export const STORE_VERSION = 7;

interface AppState {
  onboarded: boolean;
  struggles: StruggleId[];
  plan: RecoveryPlan;
  checkins: CheckIn[];
  goal: DailyGoal;
  wins: UrgeWin[];
  chat: ChatMessage[];
  story: Story;
  triggers: TriggerTag[];
  standingGoals: StandingGoal[];
  slips: Slip[];
  localPrayers: LocalPrayer[];
  journal: JournalEntry[];
  amenedIds: number[];
  displayName: string;
  /** City, neighborhood, or ZIP. Used later for nearby meetings and stores. */
  place: string;
  lifeGoals: LifeGoals;
  dailyEncouragementEnabled: boolean;
  dailyNotifyHour: number;
  dailyNotifyMinute: number;
  lastDailyNotifyDate: string;
  /** The one person marked as sponsor (null when not set). */
  sponsor: Sponsor | null;
  /** Milestone keys already celebrated (see src/lib/milestones.ts). */
  celebratedMilestones: string[];
  setStruggles: (ids: StruggleId[]) => void;
  finishOnboarding: (ids: StruggleId[]) => void;
  savePlan: (plan: RecoveryPlan) => void;
  saveCheckin: (entry: Omit<CheckIn, "id" | "date">) => void;
  saveGoal: (text: string) => void;
  recordWin: () => void;
  addChat: (msg: Omit<ChatMessage, "id">) => void;
  resetChat: () => void;
  clearCheckins: () => void;
  saveStory: (story: Story) => void;
  setDisplayName: (name: string) => void;
  setPlace: (place: string) => void;
  saveLifeGoals: (goals: LifeGoals) => void;
  addTrigger: (label: string) => void;
  moveTrigger: (id: string, direction: "up" | "down") => void;
  removeTrigger: (id: string) => void;
  replaceTriggers: (labels: string[]) => void;
  addStandingGoal: (text: string) => void;
  toggleStandingGoal: (id: string) => void;
  removeStandingGoal: (id: string) => void;
  addSlip: (entry: Omit<Slip, "id" | "at">) => void;
  addLocalPrayer: (body: string) => void;
  addJournal: (body: string) => void;
  markAmen: (postId: number) => void;
  setDailyEncouragement: (enabled: boolean) => void;
  setDailyNotifyTime: (hour: number, minute: number) => void;
  markDailyNotified: (dateKey: string) => void;
  setSponsor: (sponsor: Sponsor | null) => void;
  markMilestonesCelebrated: (keys: string[]) => void;
  /** Replace all persisted data with a validated backup (runs migrate + merge). */
  restoreBackup: (data: Record<string, unknown>, version: number) => void;
  resetAll: () => void;
}

const OPENING: ChatMessage = {
  id: "opening",
  role: "assistant",
  content:
    "I'm here with you. You don't have to solve the rest of your life right now. Let's get through the next few minutes together. What happened right before the urge hit?",
};

const INITIAL = {
  onboarded: false,
  struggles: [] as StruggleId[],
  plan: EMPTY_PLAN,
  checkins: [] as CheckIn[],
  goal: { text: "", date: "" } as DailyGoal,
  wins: [] as UrgeWin[],
  chat: [OPENING] as ChatMessage[],
  story: EMPTY_STORY,
  triggers: [] as TriggerTag[],
  standingGoals: [] as StandingGoal[],
  slips: [] as Slip[],
  localPrayers: [] as LocalPrayer[],
  journal: [] as JournalEntry[],
  amenedIds: [] as number[],
  displayName: "",
  place: "",
  lifeGoals: EMPTY_LIFE_GOALS,
  dailyEncouragementEnabled: false,
  dailyNotifyHour: DEFAULT_NOTIFY_HOUR,
  dailyNotifyMinute: DEFAULT_NOTIFY_MINUTE,
  lastDailyNotifyDate: "",
  sponsor: null as Sponsor | null,
  celebratedMilestones: [] as string[],
};


function migrateTriggers(raw: unknown): TriggerTag[] {
  if (!Array.isArray(raw)) return [];
  type Row = { id: string; label: string; rank?: number; hits?: number };
  const rows: Row[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const t = item as Record<string, unknown>;
    const label = typeof t.label === "string" ? t.label.trim() : "";
    if (!label) continue;
    rows.push({
      id: typeof t.id === "string" ? t.id : uid(),
      label,
      rank: typeof t.rank === "number" ? t.rank : undefined,
      hits: typeof t.hits === "number" ? t.hits : 0,
    });
  }
  const hasRank = rows.some((r) => typeof r.rank === "number");
  const sorted = hasRank
    ? [...rows].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    : [...rows].sort((a, b) => (b.hits ?? 0) - (a.hits ?? 0));
  return sorted.slice(0, 24).map((t, i) => ({ id: t.id, label: t.label, rank: i }));
}

function stringFields<T extends object>(defaults: T, raw: unknown): T {
  const out = { ...defaults } as Record<string, unknown>;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (k in out && typeof v === "string") out[k] = v;
    }
  }
  return out as T;
}

function migrateSponsor(raw: unknown): Sponsor | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === "string" ? r.name.trim().slice(0, 60) : "";
  const phone = typeof r.phone === "string" ? r.phone.trim().slice(0, 32) : "";
  if (!name && !phone) return null;
  return { name: name || "Sponsor", phone };
}

function arr<T>(raw: unknown): T[] {
  return Array.isArray(raw) ? (raw as T[]) : [];
}

/** Persisted data fields only (no functions, no session chat). */
function partializeState(s: AppState) {
  return {
    onboarded: s.onboarded,
    struggles: s.struggles,
    plan: s.plan,
    checkins: s.checkins,
    goal: s.goal,
    wins: s.wins,
    // chat intentionally omitted — AI transcripts stay session-only
    story: s.story,
    triggers: s.triggers,
    standingGoals: s.standingGoals,
    slips: s.slips,
    localPrayers: s.localPrayers,
    journal: s.journal,
    amenedIds: s.amenedIds,
    displayName: s.displayName,
    place: s.place,
    lifeGoals: s.lifeGoals,
    dailyEncouragementEnabled: s.dailyEncouragementEnabled,
    dailyNotifyHour: s.dailyNotifyHour,
    dailyNotifyMinute: s.dailyNotifyMinute,
    lastDailyNotifyDate: s.lastDailyNotifyDate,
    sponsor: s.sponsor,
    celebratedMilestones: s.celebratedMilestones,
  };
}

/** Upgrade persisted data from an older store version (also used for backups). */
function migratePersisted(persisted: unknown, version: number): Record<string, unknown> {
  const p = { ...((persisted ?? {}) as Record<string, unknown>) };
  p.triggers = migrateTriggers(p.triggers);
  if (version < 6) {
    // v6: sponsor + celebrated milestones. Safe defaults.
    if (!("sponsor" in p)) p.sponsor = null;
    if (!Array.isArray(p.celebratedMilestones)) p.celebratedMilestones = [];
  }
  if (version < 7) {
    if (typeof p.place !== "string") p.place = "";
    if (!p.lifeGoals || typeof p.lifeGoals !== "object") p.lifeGoals = { ...EMPTY_LIFE_GOALS };
  }
  return p;
}

/** Merge persisted data onto a base state (also used for backups). */
function mergePersisted(persisted: unknown, current: AppState): AppState {
  const p = (persisted ?? {}) as Partial<AppState>;
  return {
    ...current,
    ...p,
    onboarded: typeof p.onboarded === "boolean" ? p.onboarded : current.onboarded,
    plan: stringFields(EMPTY_PLAN, p.plan),
    story: stringFields(EMPTY_STORY, p.story),
    goal: p.goal ? stringFields({ text: "", date: "" }, p.goal) : current.goal,
    struggles: arr<StruggleId>(p.struggles),
    checkins: arr<CheckIn>(p.checkins),
    wins: arr<UrgeWin>(p.wins),
    // Prefer session chat; drop any legacy persisted transcripts
    chat: current.chat,
    triggers: migrateTriggers(p.triggers ?? []),
    standingGoals: arr<StandingGoal>(p.standingGoals),
    slips: arr<Slip>(p.slips),
    localPrayers: arr<LocalPrayer>(p.localPrayers),
    journal: arr<JournalEntry>(p.journal),
    amenedIds: arr<number>(p.amenedIds),
    displayName: typeof p.displayName === "string" ? p.displayName : "",
    place: typeof p.place === "string" ? p.place.slice(0, 80) : "",
    lifeGoals: stringFields(EMPTY_LIFE_GOALS, p.lifeGoals),
    dailyEncouragementEnabled: p.dailyEncouragementEnabled === true,
    dailyNotifyHour:
      typeof p.dailyNotifyHour === "number" ? p.dailyNotifyHour : DEFAULT_NOTIFY_HOUR,
    dailyNotifyMinute:
      typeof p.dailyNotifyMinute === "number" ? p.dailyNotifyMinute : DEFAULT_NOTIFY_MINUTE,
    lastDailyNotifyDate: typeof p.lastDailyNotifyDate === "string" ? p.lastDailyNotifyDate : "",
    sponsor: migrateSponsor(p.sponsor),
    celebratedMilestones: arr<unknown>(p.celebratedMilestones).filter(
      (k): k is string => typeof k === "string",
    ),
  };
}

/** Snapshot of the persisted data fields, for "Download a backup". */
export function exportableState(): Record<string, unknown> {
  return partializeState(useAppStore.getState());
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      setStruggles: (ids) => set({ struggles: ids }),
      finishOnboarding: (ids) => set({ struggles: ids, onboarded: true }),
      savePlan: (plan) => set({ plan }),
      saveCheckin: (entry) => {
        const row: CheckIn = { ...entry, id: uid(), date: new Date().toISOString() };
        // Trigger text stays on the check-in only — it does not change ranking.
        set({
          checkins: [row, ...get().checkins].slice(0, 90),
        });
      },
      saveGoal: (text) => set({ goal: { text, date: todayKey() } }),
      recordWin: () =>
        set({
          wins: [{ id: uid(), at: new Date().toISOString() }, ...get().wins].slice(0, 100),
        }),
      addChat: (msg) =>
        set({
          chat: [...get().chat, { ...msg, id: uid() }].slice(-40),
        }),
      resetChat: () => set({ chat: [{ ...OPENING, id: uid() }] }),
      clearCheckins: () => set({ checkins: [] }),
      saveStory: (story) => set({ story }),
      setDisplayName: (name) => set({ displayName: name }),
      setPlace: (place) => set({ place: place.trim().slice(0, 80) }),
      saveLifeGoals: (goals) => set({ lifeGoals: stringFields(EMPTY_LIFE_GOALS, goals) }),
      addTrigger: (label) => {
        const clean = label.trim();
        if (!clean) return;
        if (get().triggers.some((t) => t.label.toLowerCase() === clean.toLowerCase())) return;
        const next = [
          ...get().triggers,
          { id: uid(), label: clean, rank: get().triggers.length },
        ].slice(0, 24);
        set({ triggers: next.map((t, i) => ({ ...t, rank: i })) });
      },
      moveTrigger: (id, direction) => {
        const list = [...get().triggers];
        const i = list.findIndex((t) => t.id === id);
        if (i < 0) return;
        const j = direction === "up" ? i - 1 : i + 1;
        if (j < 0 || j >= list.length) return;
        const tmp = list[i]!;
        list[i] = list[j]!;
        list[j] = tmp;
        set({ triggers: list.map((t, idx) => ({ ...t, rank: idx })) });
      },
      removeTrigger: (id) =>
        set({
          triggers: get()
            .triggers.filter((t) => t.id !== id)
            .map((t, i) => ({ ...t, rank: i })),
        }),
      replaceTriggers: (labels) => {
        const seen = new Set<string>();
        const next: TriggerTag[] = [];
        for (const raw of labels) {
          const clean = raw.trim();
          if (!clean) continue;
          const key = clean.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          const existing = get().triggers.find((t) => t.label.toLowerCase() === key);
          next.push({ id: existing?.id ?? uid(), label: clean, rank: next.length });
          if (next.length >= 24) break;
        }
        set({ triggers: next.map((t, i) => ({ ...t, rank: i })) });
      },
      addStandingGoal: (text) => {
        const clean = text.trim();
        if (!clean) return;
        set({
          standingGoals: [
            { id: uid(), text: clean, done: false },
            ...get().standingGoals,
          ].slice(0, 20),
        });
      },
      toggleStandingGoal: (id) =>
        set({
          standingGoals: get().standingGoals.map((g) =>
            g.id === id ? { ...g, done: !g.done } : g,
          ),
        }),
      removeStandingGoal: (id) =>
        set({ standingGoals: get().standingGoals.filter((g) => g.id !== id) }),
      addSlip: (entry) =>
        set({
          slips: [
            { ...entry, id: uid(), at: new Date().toISOString() },
            ...get().slips,
          ].slice(0, 40),
        }),
      addLocalPrayer: (body) => {
        const clean = body.trim();
        if (!clean) return;
        set({
          localPrayers: [
            { id: uid(), at: new Date().toISOString(), body: clean },
            ...get().localPrayers,
          ].slice(0, 40),
        });
      },
      addJournal: (body) => {
        const clean = body.trim();
        if (!clean) return;
        set({
          journal: [
            { id: uid(), at: new Date().toISOString(), body: clean },
            ...get().journal,
          ].slice(0, 80),
        });
      },
      markAmen: (postId) => {
        if (get().amenedIds.includes(postId)) return;
        set({ amenedIds: [...get().amenedIds, postId].slice(-200) });
      },
      setDailyEncouragement: (enabled) => set({ dailyEncouragementEnabled: enabled }),
      setDailyNotifyTime: (hour, minute) =>
        set({
          dailyNotifyHour: Math.min(23, Math.max(0, Math.floor(hour))),
          dailyNotifyMinute: Math.min(59, Math.max(0, Math.floor(minute))),
        }),
      markDailyNotified: (dateKey) => set({ lastDailyNotifyDate: dateKey }),
      setSponsor: (sponsor) => set({ sponsor: migrateSponsor(sponsor) }),
      markMilestonesCelebrated: (keys) => {
        const cur = get().celebratedMilestones;
        const add = keys.filter((k) => !cur.includes(k));
        if (!add.length) return;
        set({ celebratedMilestones: [...cur, ...add].slice(-200) });
      },
      restoreBackup: (data, version) => {
        const migrated = version < STORE_VERSION ? migratePersisted(data, version) : data;
        // Start from a clean slate so nothing from this device leaks into the restore.
        const base: AppState = { ...get(), ...INITIAL, chat: get().chat };
        set(mergePersisted(migrated, base));
      },
      resetAll: () => set({ ...INITIAL, chat: [OPENING] }),
    }),
    {
      name: "sober-buddy",
      version: STORE_VERSION,
      partialize: partializeState,
      migrate: (persisted, version) => migratePersisted(persisted, version) as never,
      merge: (persisted, current) => mergePersisted(persisted, current),
    },
  ),
);

export function personalContext(s: {
  story: Story;
  plan: RecoveryPlan;
  triggers: TriggerTag[];
  standingGoals: StandingGoal[];
  slips: Slip[];
  goal: DailyGoal;
  lifeGoals?: LifeGoals;
}): string {
  // Minimum needed for a helpful reply — no journal, prayers, contacts, full story, or slip history.
  const bits: string[] = [];
  if (s.story.called) bits.push(`They go by ${s.story.called}.`);
  if (s.story.protecting) {
    bits.push(`They are protecting: ${s.story.protecting.slice(0, 120)}`);
  } else if (s.plan.reasons) {
    // Fallback only when protecting is empty
    bits.push(`Reasons: ${s.plan.reasons.slice(0, 120)}`);
  }
  const top = [...s.triggers].sort((a, b) => a.rank - b.rank).slice(0, 3);
  if (top.length) {
    bits.push(`Top triggers: ${top.map((t) => t.label).join(", ")}.`);
  }
  if (s.goal.text) bits.push(`Today's goal: ${s.goal.text.slice(0, 80)}`);
  if (s.story.family) bits.push(`Family: ${s.story.family.slice(0, 80)}`);
  if (s.lifeGoals?.family) bits.push(`Family goal: ${s.lifeGoals.family.slice(0, 80)}`);
  return bits.join(" ");
}

/** Human-readable list of fields included in personalContext (for Privacy UI). */
export const COMPANION_PROFILE_FIELDS = [
  "preferred name (if set)",
  "what you are protecting (short), or reasons if protecting is empty",
  "up to 3 highest-ranked triggers (labels only)",
  "today's goal (short, if set)",
  "family you named (short, if set)",
  "family goal (short, if set)",
] as const;
