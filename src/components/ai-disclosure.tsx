import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Short permanent notice for Urge / Slip / any companion UI (including fallbacks). */
export function AiDisclosure({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "rounded-lg border border-border/80 bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
      role="note"
    >
      Sober Buddy&apos;s AI is a support tool, not a therapist or crisis line.{" "}
      <Link to="/help" className="font-medium text-foreground underline-offset-2 hover:underline">
        Need a real person?
      </Link>
    </p>
  );
}

/** What is (and is not) sent when companion AI is configured — keep in sync with companion.ts + personalContext. */
export const AI_PAYLOAD_BLURB = {
  sent: [
    "Your message or the button you tapped (Talk, Calm, Pray, etc.)",
    "Struggle categories you chose at setup (labels only)",
    "A short profile snippet: preferred name, what you are protecting, up to 3 ranked triggers, and today's goal if set",
    "Recent Urge chat turns from this session (up to 8), so Buddy can stay in the conversation",
  ],
  notSent: [
    "Journal entries and private prayer notes",
    "Full story / faith essays and contact phone numbers",
    "Full trigger list, standing goals list, check-in history, and past slip details (except what you type in After a slip)",
  ],
} as const;
