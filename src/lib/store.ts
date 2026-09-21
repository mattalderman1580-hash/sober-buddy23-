import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ChatMessage,
  CheckIn,
  DailyGoal,
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
  displayName: string;
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
  hitTrigger: (id: string) => void;
  removeTrigger: (id: string) => void;
  addStandingGoal: (text: string) => void;
  toggleStandingGoal: (id: string) => void;
  removeStandingGoal: (id: string) => void;
  addSlip: (entry: Omit<Slip, "id" | "at">) => void;
  addLocalPrayer: (body: string) => void;
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
  displayName: "",
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      setStruggles: (ids) => set({ struggles: ids }),
      finishOnboarding: (ids) => set({ struggles: ids, onboarded: true }),
      savePlan: (plan) => set({ plan }),
      saveCheckin: (entry) => {
        const row: CheckIn = { ...entry, id: uid(), date: new Date().toISOString() };
        const triggerLabel = entry.trigger.trim();
        let triggers = get().triggers;
        if (triggerLabel) {
          const existing = triggers.find(
            (t) => t.label.toLowerCase() === triggerLabel.toLowerCase(),
          );
          if (existing) {
            triggers = triggers.map((t) =>
              t.id === existing.id ? { ...t, hits: t.hits + 1, lastAt: row.date } : t,
            );
          }
        }
        set({
          checkins: [row, ...get().checkins].slice(0, 90),
          triggers,
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
        set({
          triggers: [
            { id: uid(), label: clean, hits: 0, lastAt: "" },
            ...get().triggers,
          ].slice(0, 24),
        });
      },
      hitTrigger: (id) =>
        set({
          triggers: get().triggers.map((t) =>
            t.id === id ? { ...t, hits: t.hits + 1, lastAt: new Date().toISOString() } : t,
          ),
        }),
      removeTrigger: (id) => set({ triggers: get().triggers.filter((t) => t.id !== id) }),
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
      resetAll: () => set({ ...INITIAL, chat: [OPENING] }),
    }),
    {
      name: "sober-buddy",
      version: 2,
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
        displayName: s.displayName,
      }),
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
          triggers: p.triggers ?? [],
          standingGoals: p.standingGoals ?? [],
          slips: p.slips ?? [],
          localPrayers: p.localPrayers ?? [],
          displayName: p.displayName ?? "",
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
  const top = [...s.triggers].sort((a, b) => b.hits - a.hits).slice(0, 5);
  if (top.length) bits.push(`Known triggers: ${top.map((t) => t.label).join(", ")}.`);
  const open = s.standingGoals.filter((g) => !g.done).slice(0, 4);
  if (open.length) bits.push(`Goals: ${open.map((g) => g.text).join("; ")}`);
  if (s.goal.text) bits.push(`Today's goal: ${s.goal.text}`);
  if (s.slips[0]?.learned) bits.push(`Last lesson from a slip: ${s.slips[0].learned.slice(0, 160)}`);
  return bits.join(" ");
}
