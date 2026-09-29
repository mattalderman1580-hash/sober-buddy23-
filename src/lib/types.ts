export const STRUGGLE_IDS = [
  "substances",
  "gambling",
  "purity",
  "food",
  "mental",
  "faith",
  "nicotine",
  "phone",
  "anger",
  "other",
] as const;

export type StruggleId = (typeof STRUGGLE_IDS)[number];

export type CompanionAction =
  | "talk"
  | "calm"
  | "distract"
  | "reasons"
  | "pray"
  | "scripture"
  | "free";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export interface RecoveryPlan {
  startDate: string;
  reasons: string;
  contacts: string;
  goals: string;
}

/** Minimal sponsor record: just who to call or text in a hard moment. */
export interface Sponsor {
  name: string;
  phone: string;
}

export interface CheckIn {
  id: string;
  date: string;
  mood: string;
  urge: number;
  trigger: string;
  win: string;
}

export interface UrgeWin {
  id: string;
  at: string;
}

export interface DailyGoal {
  text: string;
  date: string;
}

export interface Story {
  called: string;
  narrative: string;
  faith: string;
  protecting: string;
  goodDay: string;
  howItStarted: string;
  hope: string;
  turningPoint: string;
  family: string;
  familySupport: string;
  familyNeed: string;
}

export interface TriggerTag {
  id: string;
  label: string;
  /** 0 = highest priority. Array order stays in sync. */
  rank: number;
}

export interface StandingGoal {
  id: string;
  text: string;
  done: boolean;
}

export interface Slip {
  id: string;
  at: string;
  whatHappened: string;
  learned: string;
  nextStep: string;
}

export interface LocalPrayer {
  id: string;
  at: string;
  body: string;
}

export interface JournalEntry {
  id: string;
  at: string;
  body: string;
}

export interface LifeGoals {
  family: string;
  health: string;
  faith: string;
  relationships: string;
}

export const EMPTY_LIFE_GOALS: LifeGoals = {
  family: "",
  health: "",
  faith: "",
  relationships: "",
};

export const EMPTY_STORY: Story = {
  called: "",
  narrative: "",
  faith: "",
  protecting: "",
  goodDay: "",
  howItStarted: "",
  hope: "",
  turningPoint: "",
  family: "",
  familySupport: "",
  familyNeed: "",
};

export const EMPTY_PLAN: RecoveryPlan = {
  startDate: "",
  reasons: "",
  contacts: "",
  goals: "",
};

export const COMMON_TRIGGERS = [
  "Late night",
  "Alone",
  "Stress",
  "Conflict",
  "Boredom",
  "After work",
  "Phone in bed",
  "Celebration",
  "Shame spiral",
  "Hunger / tired",
];
