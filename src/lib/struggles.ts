import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Brain,
  Church,
  Cigarette,
  Coins,
  EyeOff,
  Flame,
  HeartHandshake,
  Pill,
  Smartphone,
} from "lucide-react";
import type { StruggleId } from "@/lib/types";

export interface StruggleMeta {
  id: StruggleId;
  label: string;
  blurb: string;
  Icon: LucideIcon;
}

export const ALL_STRUGGLES: StruggleMeta[] = [
  { id: "substances", label: "Drugs & Alcohol", blurb: "Recovery and staying clean", Icon: Pill },
  { id: "gambling", label: "Gambling", blurb: "Breaking the cycle", Icon: Coins },
  {
    id: "purity",
    label: "Porn / Compulsive Sexual Behavior",
    blurb: "Freedom and self-control",
    Icon: EyeOff,
  },
  { id: "food", label: "Binge / Unhealthy Eating", blurb: "Healthier habits", Icon: Apple },
  { id: "mental", label: "Mental & Emotional Struggles", blurb: "Peace and support", Icon: Brain },
  { id: "faith", label: "Growing Closer to God", blurb: "Prayer, Scripture, and faith", Icon: Church },
  { id: "nicotine", label: "Nicotine", blurb: "Breaking nicotine habits", Icon: Cigarette },
  { id: "phone", label: "Phone / Social Media", blurb: "More control, less scrolling", Icon: Smartphone },
  { id: "anger", label: "Anger & Impulse Control", blurb: "Respond instead of react", Icon: Flame },
  { id: "other", label: "Another Habit", blurb: "A habit I want to break", Icon: HeartHandshake },
];

export function labelsFor(ids: StruggleId[]): string[] {
  return ids.map((id) => ALL_STRUGGLES.find((s) => s.id === id)?.label ?? id);
}
