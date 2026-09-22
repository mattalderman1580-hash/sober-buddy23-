import type { StruggleId } from "@/lib/types";
import { labelsFor } from "@/lib/struggles";

export type QuickLinkId =
  | "/wall"
  | "/people"
  | "/urge"
  | "/story"
  | "/patterns"
  | "/checkin"
  | "/goals"
  | "/faith"
  | "/scripture"
  | "/journal"
  | "/slip"
  | "/log"
  | "/recovery"
  | "/insights"
  | "/help";

export interface Personalization {
  primaryFocus: string;
  focusLabels: string[];
  homeSubtitle: string;
  crisisCta: string;
  urgeFraming: string;
  setupHint: string;
  empty: {
    triggers: string;
    story: string;
    goals: string;
    checkins: string;
  };
  emphasize: QuickLinkId[];
  faithFirst: boolean;
  substanceFocus: boolean;
}

export function personalize(struggles: StruggleId[]): Personalization {
  const ids = struggles;
  const focusLabels = labelsFor(ids);
  const hasFaith = ids.includes("faith");
  const substanceFocus = ids.some((id) =>
    ["substances", "gambling", "purity", "nicotine"].includes(id),
  );
  const mentalFocus = ids.includes("mental") && !substanceFocus;
  const onlyFaith = ids.length === 1 && ids[0] === "faith";
  const faithFirst = onlyFaith || (hasFaith && !substanceFocus);

  let primaryFocus = "Your recovery";
  if (faithFirst && !mentalFocus) {
    primaryFocus = "Growing closer to God";
  } else if (ids.includes("substances")) {
    primaryFocus = "Staying clean & sober";
  } else if (ids.includes("gambling")) {
    primaryFocus = "Breaking the gambling cycle";
  } else if (ids.includes("purity")) {
    primaryFocus = "Freedom and purity";
  } else if (ids.includes("nicotine")) {
    primaryFocus = "Leaving nicotine behind";
  } else if (ids.includes("food")) {
    primaryFocus = "Healthier eating habits";
  } else if (ids.includes("phone")) {
    primaryFocus = "Phone & attention freedom";
  } else if (ids.includes("anger")) {
    primaryFocus = "Calm over impulse";
  } else if (mentalFocus) {
    primaryFocus = "Peace of mind";
  } else if (focusLabels[0]) {
    primaryFocus = focusLabels[0];
  }

  const homeSubtitle = focusLabels.length
    ? focusLabels.join(" · ")
    : "Choose what you are working on to tailor support.";

  let crisisCta = "I'm struggling right now";
  let urgeFraming =
    "God first. Take a breath. Ask Jesus Christ for strength for this moment.";
  let setupHint =
    "We will personalize home, urge mode, and quick actions around what you choose.";

  if (faithFirst) {
    crisisCta = "I need God right now";
    urgeFraming =
      "God first. Pause with Jesus. Prayer and Scripture can carry this next few minutes.";
    setupHint =
      "Faith-first setup — prayer and Scripture will sit where you can reach them fast.";
  } else if (substanceFocus) {
    crisisCta = "I'm thinking about using";
    urgeFraming =
      "God first. Take a breath. This urge will pass — stay with the next right step.";
    setupHint = "Recovery setup — urge tools, people, and help will sit up front.";
  } else if (mentalFocus) {
    crisisCta = "I need steady ground";
    urgeFraming =
      "God first. Slow down. You do not have to solve everything in this moment.";
  } else if (ids.includes("anger")) {
    crisisCta = "I'm about to react";
    urgeFraming =
      "God first. Pause before you speak or act. One slow breath is the next right step.";
  }

  const empty = {
    triggers: substanceFocus
      ? "Write the situations that usually come before an urge. Rank the hardest ones first."
      : faithFirst
        ? "Write what pulls you away from prayer or peace. Rank the strongest distractions first."
        : "Write your real triggers in your own words. Rank highest to lowest.",
    story: hasFaith
      ? "Share a little of your faith story so support can speak to your actual walk with God."
      : "Story module empty. Fill it so support can speak to your actual life.",
    goals: substanceFocus
      ? "Set one small goal for today — something you can finish sober."
      : "Set one small goal for today that moves you toward freedom.",
    checkins: "No check-ins yet. A short daily note helps you see patterns over time.",
  };

  let emphasize: QuickLinkId[];
  if (faithFirst) {
    emphasize = ["/faith", "/scripture", "/wall", "/journal", "/urge", "/people", "/help"];
  } else if (substanceFocus) {
    emphasize = ["/urge", "/people", "/help", "/patterns", "/checkin", "/faith", "/wall"];
  } else if (mentalFocus) {
    emphasize = ["/urge", "/faith", "/journal", "/people", "/scripture", "/help", "/wall"];
  } else if (ids.includes("anger")) {
    emphasize = ["/urge", "/faith", "/people", "/journal", "/help", "/patterns", "/scripture"];
  } else {
    emphasize = ["/urge", "/faith", "/people", "/checkin", "/patterns", "/wall", "/help"];
  }

  return {
    primaryFocus,
    focusLabels,
    homeSubtitle,
    crisisCta,
    urgeFraming,
    setupHint,
    empty,
    emphasize,
    faithFirst,
    substanceFocus,
  };
}

/** Reorder a full link list so emphasized paths come first (stable for the rest). */
export function orderLinks<T extends { to: string }>(
  links: readonly T[],
  emphasize: QuickLinkId[],
): T[] {
  const preferred = emphasize.filter((to) => links.some((l) => l.to === to));
  const rest = links.filter((l) => !preferred.includes(l.to as QuickLinkId));
  const head = preferred
    .map((to) => links.find((l) => l.to === to))
    .filter((x): x is T => Boolean(x));
  return [...head, ...rest];
}