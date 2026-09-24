import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ChatMessage,
  CheckIn,
  DailyGoal,
  JournalEntry,
  LocalPrayer,
  RecoveryPlan,
  Slip,
  StandingGoal,
  Story,
  StruggleId,
  TriggerTag,
  UrgeWin,
} from "@/lib/types";
import { EMPTY_PLAN, EMPTY_STORY } from "@/lib/types";
import {
  DEFAULT_NOTIFY_HOUR,
  DEFAULT_NOTIFY_MINUTE,
} from "@/lib/daily-notifications";
import { todayKey, uid } from "@/lib/utils";

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
  dailyEncouragementEnabled: boolean;
  dailyNotifyHour: number;
  dailyNotifyMinute: number;
  lastDailyNotifyDate: string;
  setStruggles: (ids: StruggleId[]) => void;
  finishOnboarding: (ids: StruggleId[]) => void;
  savePlan: (plan: RecoveryPlan) => void;
  saveCheckin: (entry: Omit<CheckIn, "id" | "date">) => void;
  saveGoal: (text: string) => void;
  recordWin: () => void;
  addChat: (msg: Omit<ChatMessage, "id">) => void;
  resetChat: () => void;
  saveStory: (story: Story) => void;
  setDisplayName: (name: string) => void;
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
  dailyEncouragementEnabled: false,
  dailyNotifyHour: DEFAULT_NOTIFY_HOUR,
  dailyNotifyMinute: DEFAULT_NOTIFY_MINUTE,
  lastDailyNotifyDate: "",
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
      saveStory: (story) => set({ story }),
      setDisplayName: (name) => set({ displayName: name }),
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
      resetAll: () => set({ ...INITIAL, chat: [OPENING] }),
    }),
    {
      name: "sober-buddy",
      version: 4,
      partialize: (s) => ({
        onboarded: s.onboarded,
        struggles: s.struggles,
        plan: s.plan,
        checkins: s.checkins,
        goal: s.goal,
        wins: s.wins,
        chat: s.chat,
        story: s.story,
        triggers: s.triggers,
        standingGoals: s.standingGoals,
        slips: s.slips,
        localPrayers: s.localPrayers,
        journal: s.journal,
        amenedIds: s.amenedIds,
        displayName: s.displayName,
        dailyEncouragementEnabled: s.dailyEncouragementEnabled,
        dailyNotifyHour: s.dailyNotifyHour,
        dailyNotifyMinute: s.dailyNotifyMinute,
        lastDailyNotifyDate: s.lastDailyNotifyDate,
      }),
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Record<string, unknown>;
        p.triggers = migrateTriggers(p.triggers);
        return p as never;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...p,
          plan: { ...EMPTY_PLAN, ...p.plan },
          story: { ...EMPTY_STORY, ...p.story },
          goal: p.goal ?? current.goal,
          struggles: p.struggles ?? [],
          checkins: p.checkins ?? [],
          wins: p.wins ?? [],
          chat: p.chat?.length ? p.chat : current.chat,
          triggers: migrateTriggers(p.triggers ?? []),
          standingGoals: p.standingGoals ?? [],
          slips: p.slips ?? [],
          localPrayers: p.localPrayers ?? [],
          journal: p.journal ?? [],
          amenedIds: p.amenedIds ?? [],
          displayName: p.displayName ?? "",
          dailyEncouragementEnabled: p.dailyEncouragementEnabled ?? false,
          dailyNotifyHour:
            typeof p.dailyNotifyHour === "number" ? p.dailyNotifyHour : DEFAULT_NOTIFY_HOUR,
          dailyNotifyMinute:
            typeof p.dailyNotifyMinute === "number"
              ? p.dailyNotifyMinute
              : DEFAULT_NOTIFY_MINUTE,
          lastDailyNotifyDate: p.lastDailyNotifyDate ?? "",
        };
      },
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
}): string {
  const bits: string[] = [];
  if (s.story.called) bits.push(`They go by ${s.story.called}.`);
  if (s.story.narrative) bits.push(`Their story: ${s.story.narrative.slice(0, 280)}`);
  if (s.story.faith) bits.push(`Faith: ${s.story.faith.slice(0, 180)}`);
  if (s.story.protecting) bits.push(`They are protecting: ${s.story.protecting.slice(0, 160)}`);
  if (s.plan.reasons) bits.push(`Reasons: ${s.plan.reasons.slice(0, 220)}`);
  const top = [...s.triggers].sort((a, b) => a.rank - b.rank).slice(0, 5);
  if (top.length) bits.push(`Known triggers (highest first): ${top.map((t) => t.label).join(", ")}.`);
  const open = s.standingGoals.filter((g) => !g.done).slice(0, 4);
  if (open.length) bits.push(`Goals: ${open.map((g) => g.text).join("; ")}`);
  if (s.goal.text) bits.push(`Today's goal: ${s.goal.text}`);
  if (s.slips[0]?.learned) bits.push(`Last lesson from a slip: ${s.slips[0].learned.slice(0, 160)}`);
  return bits.join(" ");
}
